// Mapping of moods to audio files in /public/audio
// Map moods to audio files. Keep core moods fixed, assign others using a pool of available audio files.
const coreAudioMap: Record<string, string> = {
  "dusty peach": "rainy-lofi-city-music.mp3",
  "stone": "Deep Theme Passengers Music.mp3",
  "celestial": "Deep Theme Shifty Alternative Version 31.mp3",
};

const audioPool = [
  "Ambient Music Wide Flower Fields.mp3",
  "Deep Forest Ambient Music.mp3",
  "Gentle Ambient Atmosphere.mp3",
  "Inner Peace Ambient Music.mp3",
  "Spring Hazes Deep Theme Music.mp3",
];

export const moodAudioMap: Record<string, string> = {
  ...coreAudioMap,
  "spring hazes": "Spring Hazes Deep Theme Music.mp3",
  // You can add more static assignments here if desired
  "default": "placeholder.mp3"
};

// Utility to get the best matching audio for a mood (simple fuzzy match, then pool fallback)
export function getAudioForMood(mood: string): string {
  if (!mood) return moodAudioMap["default"];
  const key = mood.toLowerCase().trim();
  if (moodAudioMap[key]) return moodAudioMap[key];
  // Fuzzy: pick the first mood whose name is included in the input
  for (const m in moodAudioMap) {
    if (key.includes(m)) return moodAudioMap[m]!;
  }
  // Pool fallback: assign based on hash of mood for variety
  const hash = Array.from(key).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const idx = hash % audioPool.length;
  return audioPool[idx];
}
