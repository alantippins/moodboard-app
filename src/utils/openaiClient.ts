import { Palette } from '@/data/palettes';
import { getStaticPalette } from './staticPalettes';

// Simple client-side rate limiting
// This isn't as robust as server-side rate limiting but provides basic protection
const RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  max: 10 // 10 requests per minute
};

const rateLimitStore = {
  timestamp: Date.now(),
  count: 0
};

/**
 * Check if the client has exceeded rate limits
 * @returns Object with allowed status and reset time if blocked
 */
export function checkRateLimit(): { allowed: boolean; resetTime?: Date } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;
  
  // If entry is from previous window, reset count
  if (rateLimitStore.timestamp < windowStart) {
    rateLimitStore.timestamp = now;
    rateLimitStore.count = 0;
  }
  
  if (rateLimitStore.count >= RATE_LIMIT.max) {
    const resetTime = new Date(rateLimitStore.timestamp + RATE_LIMIT.windowMs);
    return { allowed: false, resetTime };
  }
  
  // Increment count and update timestamp
  rateLimitStore.count++;
  rateLimitStore.timestamp = now;
  
  return { allowed: true };
}

/**
 * Generate a palette using OpenAI API directly from the browser
 * This is used for GitHub Pages deployment where server API is not available
 */
export async function generatePaletteClient(word: string, originalWord: string, apiKey: string): Promise<Palette | { error: string }> {
  try {
    // Basic validation
    if (!word || typeof word !== 'string') {
      return { error: 'Missing or invalid word' };
    }
    
    if (!apiKey || typeof apiKey !== 'string') {
      return { error: 'Missing or invalid API key' };
    }
    
    // Validate API key format (basic check)
    if (!apiKey.startsWith('sk-')) {
      return { error: 'Invalid API key format' };
    }

    // Sanitize input
    const sanitizedWord = word.replace(/[^\w\s-.,!?]/gi, '').trim();
    if (!sanitizedWord) {
      return { error: 'Word contains only invalid characters' };
    }

    // Prompt for GPT
    const prompt = `You are a designer AI specializing in creating unique color palettes that evoke specific moods. 

For the mood word: "${sanitizedWord}", create a JSON object for a moodboard palette that STRONGLY reflects the emotional and visual qualities of this specific word.

CRITICAL: Each word MUST have a UNIQUE palette that reflects its meaning. For example:
- "blue" should have predominantly blue tones
- "fire" should have warm reds and oranges
- "forest" should have natural greens
- "night" should have dark blues and purples

Include these fields: name, background, backgroundAlt, accent, headingColor, textColor, swatches (array of 4 hex colors), fontPrimary, fontSecondary, and audio (suggest a genre or vibe, not a filename).

IMPORTANT: Use the exact word "${originalWord}" as the name field. The palette MUST be visually cohesive but UNIQUE to this specific word.

Respond with only the JSON, no explanation.`;

    // Make request to OpenAI API directly
    let response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.9, // Higher temperature for more creative and diverse responses
      })
      });
      // Request completed successfully
    } catch (networkError) {
      console.error('Network error during API call:', networkError);
      return { error: 'Network error: Failed to connect to OpenAI API' };
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return { error: errorData.error?.message || 'Failed to generate palette' };
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse API response as JSON:', jsonError);
      return { error: 'Failed to parse API response' };
    }
    
    const text = data.choices[0]?.message?.content?.trim() || '';
    if (!text) {
      console.error('Empty or invalid response from API');
      return { error: 'Empty response from API' };
    }
    
    try {
      // Try to clean up the response if it's not valid JSON
      let cleanedText = text;
      
      // Sometimes the model includes markdown code block markers
      if (cleanedText.includes('```')) {
        cleanedText = cleanedText.replace(/```json\n|```/g, '');
      }
      
      // Sometimes the model adds explanations before or after the JSON
      const jsonStartIndex = cleanedText.indexOf('{');
      const jsonEndIndex = cleanedText.lastIndexOf('}') + 1;
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        cleanedText = cleanedText.substring(jsonStartIndex, jsonEndIndex);
      }
      
      let palette: Palette;
      
      try {
        palette = JSON.parse(cleanedText);
      } catch {
        // Last resort: try to fix common JSON syntax errors
        cleanedText = cleanedText
          .replace(/([{,])\s*([\w]+)\s*:/g, '$1"$2":') // Add quotes to keys
          .replace(/:\s*'([^']*)'/g, ':"$1"') // Replace single quotes with double quotes
          .replace(/,\s*}/g, '}'); // Remove trailing commas
          
        palette = JSON.parse(cleanedText);
      }
      
      // --- Palette Post-processing to ensure light & dark swatches and proper contrast ---
      let hexToOklch;
      try {
        const { converter } = await import('culori');
        hexToOklch = converter('oklch');
      } catch (importError) {
        console.error('Failed to import color processing library:', importError);
        // Continue without color processing if import fails
        // Return the palette as-is without post-processing
        return palette;
      }
      const lightThreshold = 0.85;
      const darkThreshold = 0.25;
      const swatches = palette.swatches.slice(0, 4); // ensure max 4

      // Find lightest and darkest
      let lightIdx = -1, darkIdx = -1, minL = 1, maxL = 0;
      swatches.forEach((hex, i) => {
        const l = hexToOklch(hex)?.l ?? 0;
        if (l > maxL) { maxL = l; lightIdx = i; }
        if (l < minL) { minL = l; darkIdx = i; }
      });

      // Replace if needed to ensure light and dark swatches
      if (maxL < lightThreshold) {
        // Replace lightest with a very light color
        swatches[lightIdx !== -1 ? lightIdx : 0] = '#fffbe9'; // pastel yellow/white
      }
      if (minL > darkThreshold) {
        // Replace darkest with a very dark color
        swatches[darkIdx !== -1 ? darkIdx : 0] = '#191933'; // deep navy
      }
      
      // Calculate WCAG contrast ratios for text colors against background
      const getLuminance = (hexColor: string): number => {
        // Convert hex to rgb
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        
        // Calculate luminance using WCAG formula
        const R = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        const G = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        const B = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
        
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
      };
      
      const getContrastRatio = (color1: string, color2: string): number => {
        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        const lightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (lightest + 0.05) / (darkest + 0.05);
      };
      
      // Ensure text colors have sufficient contrast with background
      const bgLuminance = getLuminance(palette.background);
      const textContrastRatio = getContrastRatio(palette.background, palette.textColor);
      const headingContrastRatio = getContrastRatio(palette.background, palette.headingColor);
      
      // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
      if (textContrastRatio < 4.5) {
        palette.textColor = bgLuminance > 0.5 ? '#000000' : '#ffffff';
      }
      
      if (headingContrastRatio < 3) {
        palette.headingColor = bgLuminance > 0.5 ? '#000000' : '#ffffff';
      }
      
      palette.swatches = swatches;
      // --- End post-processing ---
      
      return palette;
    } catch (parseError) {
      // If we can't parse the response, fall back to a static palette
      console.error('Failed to parse OpenAI response:', parseError);
      const fallbackPalette = getStaticPalette(word);
      fallbackPalette.name = originalWord;
      return fallbackPalette;
    }
  } catch (err) {
    console.error('[DEBUG] Error generating palette:', err);
    return { error: err instanceof Error ? err.message : 'Failed to generate palette' };
  }
}
