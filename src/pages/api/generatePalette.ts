import OpenAI from 'openai';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Palette } from '@/data/palettes';
import { converter } from 'culori';

interface RateLimitEntry {
  timestamp: number;
  count: number;
}

/** Memory store for rate limiting */
const rateLimit = new Map<string, RateLimitEntry>();

const RATE_LIMIT = {
  windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : 900000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100 // limit each IP to 100 requests per windowMs
};

/**
 * Rate limiting middleware to prevent abuse
 * @param ip - The client IP address
 * @returns Object containing whether the request is allowed and when the limit resets
 */
function rateLimiter(ip: string): { allowed: boolean; resetTime?: Date } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;
  
  // Clean up old entries
  for (const [key, entry] of rateLimit.entries()) {
    if (entry.timestamp < windowStart) rateLimit.delete(key);
  }
  
  // Get or create entry for this IP
  const ipKey = `${ip}`;
  const entry = rateLimit.get(ipKey) || { timestamp: now, count: 0 };
  
  // If entry is from previous window, reset count
  if (entry.timestamp < windowStart) {
    entry.timestamp = now;
    entry.count = 0;
  }
  
  if (entry.count >= RATE_LIMIT.max) {
    const resetTime = new Date(entry.timestamp + RATE_LIMIT.windowMs);
    return { allowed: false, resetTime };
  }
  
  // Increment count and update timestamp
  entry.count++;
  entry.timestamp = now;
  rateLimit.set(ipKey, entry);
  
  return { allowed: true };
}

/**
 * Sanitize user input to prevent injection and ensure valid input
 * @param word - The user-provided word to sanitize
 * @returns Sanitized string containing only letters, numbers, spaces, and basic punctuation
 */
function sanitizeInput(word: string): string {
  // Remove any characters that aren't letters, numbers, spaces, or basic punctuation
  return word.replace(/[^\w\s-.,!?]/gi, '').trim();
}

/**
 * API endpoint to generate a color palette based on a mood word
 * Uses OpenAI to create a cohesive design palette including colors, fonts, and audio suggestions
 */
type ApiResponse = Palette | { error: string; resetTime?: Date };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Get client IP
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const clientIp = Array.isArray(ip) ? ip[0] : ip;

  // Check rate limit
  const { allowed, resetTime } = rateLimiter(clientIp);
  if (!allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      resetTime
    });
  }

  const { word, apiKey } = req.body;
  
  // Sanitize input
  const sanitizedWord = sanitizeInput(word);
  
  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid word' });
  }
  
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid API key' });
  }
  
  // Initialize OpenAI client with the provided API key
  const openai = new OpenAI({ apiKey });

  // Prompt for GPT
  const prompt = `You are a designer AI. Given the mood word: "${sanitizedWord}", generate a JSON object for a moodboard palette with the following fields: name, background, backgroundAlt, accent, headingColor, textColor, swatches (array of 4 hex colors), fontPrimary, fontSecondary, and audio (suggest a genre or vibe, not a filename). Example output:\n{\n  "name": "Serene Blue",\n  "background": "#e0f7fa",\n  "backgroundAlt": "#b2ebf2",\n  "accent": "#0288d1",\n  "headingColor": "#01579b",\n  "textColor": "#263238",\n  "swatches": ["#e0f7fa", "#b2ebf2", "#0288d1", "#01579b"],\n  "fontPrimary": "Montserrat",\n  "fontSecondary": "Inter",\n  "audio": "calm ambient"\n}\nRespond with only the JSON, no explanation.`;

  try {
    // Validate API key format (basic check)
    if (!apiKey.startsWith('sk-')) {
      return res.status(400).json({ error: 'Invalid API key format' });
    }
    
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
    const swatches = palette.swatches.slice(0, 4); // ensure max 4

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
    return res.status(200).json(palette);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to generate palette';
    res.status(500).json({ error: errorMsg });
  }
}