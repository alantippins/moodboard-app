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
    const prompt = `You are a designer AI. Given the mood word: "${sanitizedWord}", generate a JSON object for a moodboard palette with the following fields: name, background, backgroundAlt, accent, headingColor, textColor, swatches (array of 4 hex colors), fontPrimary, fontSecondary, and audio (suggest a genre or vibe, not a filename). IMPORTANT: Use the exact word "${originalWord}" as the name field. Example output:
{
  "name": "${originalWord}",
  "background": "#e0f7fa",
  "backgroundAlt": "#b2ebf2",
  "accent": "#0288d1",
  "headingColor": "#01579b",
  "textColor": "#263238",
  "swatches": ["#e0f7fa", "#b2ebf2", "#0288d1", "#01579b"],
  "fontPrimary": "Montserrat",
  "fontSecondary": "Inter",
  "audio": "calm ambient"
}
Respond with only the JSON, no explanation.`;

    // Make request to OpenAI API directly
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error?.message || 'Failed to generate palette' };
    }

    const data = await response.json();
    const text = data.choices[0].message?.content?.trim() || '';
    
    try {
      const palette: Palette = JSON.parse(text);
      
      // --- Palette Post-processing to ensure light & dark swatches and proper contrast ---
      const { converter } = await import('culori');
      const hexToOklch = converter('oklch');
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
    } catch {
      // If we can't parse the response, fall back to a static palette
      console.error('Failed to parse OpenAI response, using fallback palette');
      const fallbackPalette = getStaticPalette(word);
      fallbackPalette.name = originalWord;
      return fallbackPalette;
    }
  } catch (err) {
    console.error('Error generating palette:', err);
    return { error: err instanceof Error ? err.message : 'Failed to generate palette' };
  }
}
