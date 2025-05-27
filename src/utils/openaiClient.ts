import { Palette } from '@/data/palettes';
import { getStaticPalette } from './staticPalettes';

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
