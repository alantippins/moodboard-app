import OpenAI from 'openai';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Palette } from '@/data/palettes';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required in .env file');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

import { converter, formatHex } from 'culori';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { word } = req.body;
  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid word' });
  }

  // Prompt for GPT
  const prompt = `You are a designer AI. Given the mood word: "${word}", generate a JSON object for a moodboard palette with the following fields: name, background, backgroundAlt, accent, headingColor, textColor, swatches (array of 4 hex colors), fontPrimary, fontSecondary, and audio (suggest a genre or vibe, not a filename). Example output:\n{\n  "name": "Serene Blue",\n  "background": "#e0f7fa",\n  "backgroundAlt": "#b2ebf2",\n  "accent": "#0288d1",\n  "headingColor": "#01579b",\n  "textColor": "#263238",\n  "swatches": ["#e0f7fa", "#b2ebf2", "#0288d1", "#01579b"],\n  "fontPrimary": "Montserrat",\n  "fontSecondary": "Inter",\n  "audio": "calm ambient"\n}\nRespond with only the JSON, no explanation.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    const text = completion.choices[0].message?.content?.trim() || '';
    let palette: Palette;
    try {
      palette = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Failed to parse palette JSON." });
    }

    // --- Palette Post-processing to ensure light & dark swatches ---
    const hexToOklch = converter('oklch');
    const lightThreshold = 0.85;
    const darkThreshold = 0.25;
    let swatches = palette.swatches.slice(0, 4); // ensure max 4

    // Find lightest and darkest
    let lightIdx = -1, darkIdx = -1, minL = 1, maxL = 0;
    swatches.forEach((hex, i) => {
      const l = hexToOklch(hex)?.l ?? 0;
      if (l > maxL) { maxL = l; lightIdx = i; }
      if (l < minL) { minL = l; darkIdx = i; }
    });

    // Replace if needed
    if (maxL < lightThreshold) {
      // Replace lightest with a very light color
      swatches[lightIdx !== -1 ? lightIdx : 0] = '#fffbe9'; // pastel yellow/white
    }
    if (minL > darkThreshold) {
      // Replace darkest with a very dark color
      swatches[darkIdx !== -1 ? darkIdx : 0] = '#191933'; // deep navy
    }
    palette.swatches = swatches;
    // --- End post-processing ---

    // Only return serializable palette JSON. SVG will be attached on frontend.
    return res.status(200).json({ palette });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to generate palette';
    res.status(500).json({ error: errorMsg });
  }
}