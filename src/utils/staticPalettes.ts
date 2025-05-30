import type { Palette } from '@/data/palettes';
import { generateGeometricSVG } from './generateGeometricSVG';

// Fallback palettes for static deployment
export const staticPalettes: Record<string, Palette> = {
  ocean: {
    name: "Ocean",
    background: "#e0f7fa",
    backgroundAlt: "#b2ebf2",
    accent: "#0288d1",
    headingColor: "#01579b",
    textColor: "#263238",
    swatches: ["#e0f7fa", "#b2ebf2", "#0288d1", "#01579b"],
    fontPrimary: "Montserrat",
    fontSecondary: "Inter",
    audio: "calm ambient",
    svg: () => generateGeometricSVG({
      name: "Ocean",
      background: "#e0f7fa",
      backgroundAlt: "#b2ebf2",
      accent: "#0288d1",
      headingColor: "#01579b",
      textColor: "#263238",
      swatches: ["#e0f7fa", "#b2ebf2", "#0288d1", "#01579b"],
      fontPrimary: "Montserrat",
      fontSecondary: "Inter",
      audio: "calm ambient"
    }, "Ocean", 240)
  },
  forest: {
    name: "Forest",
    background: "#e8f5e9",
    backgroundAlt: "#c8e6c9",
    accent: "#388e3c",
    headingColor: "#1b5e20",
    textColor: "#212121",
    swatches: ["#e8f5e9", "#c8e6c9", "#388e3c", "#1b5e20"],
    fontPrimary: "Roboto",
    fontSecondary: "Lato",
    audio: "forest sounds",
    svg: () => generateGeometricSVG({
      name: "Forest",
      background: "#e8f5e9",
      backgroundAlt: "#c8e6c9",
      accent: "#388e3c",
      headingColor: "#1b5e20",
      textColor: "#212121",
      swatches: ["#e8f5e9", "#c8e6c9", "#388e3c", "#1b5e20"],
      fontPrimary: "Roboto",
      fontSecondary: "Lato",
      audio: "forest sounds"
    }, "Forest", 240)
  },
  sunset: {
    name: "Sunset",
    background: "#fff8e1",
    backgroundAlt: "#ffecb3",
    accent: "#ff9800",
    headingColor: "#e65100",
    textColor: "#3e2723",
    swatches: ["#fff8e1", "#ffecb3", "#ff9800", "#e65100"],
    fontPrimary: "Poppins",
    fontSecondary: "Open Sans",
    audio: "relaxing sunset",
    svg: () => generateGeometricSVG({
      name: "Sunset",
      background: "#fff8e1",
      backgroundAlt: "#ffecb3",
      accent: "#ff9800",
      headingColor: "#e65100",
      textColor: "#3e2723",
      swatches: ["#fff8e1", "#ffecb3", "#ff9800", "#e65100"],
      fontPrimary: "Poppins",
      fontSecondary: "Open Sans",
      audio: "relaxing sunset"
    }, "Sunset", 240)
  },
  cosmic: {
    name: "Cosmic",
    background: "#e8eaf6",
    backgroundAlt: "#c5cae9",
    accent: "#3f51b5",
    headingColor: "#1a237e",
    textColor: "#212121",
    swatches: ["#e8eaf6", "#c5cae9", "#3f51b5", "#1a237e"],
    fontPrimary: "Space Grotesk",
    fontSecondary: "Work Sans",
    audio: "space ambient",
    svg: () => generateGeometricSVG({
      name: "Cosmic",
      background: "#e8eaf6",
      backgroundAlt: "#c5cae9",
      accent: "#3f51b5",
      headingColor: "#1a237e",
      textColor: "#212121",
      swatches: ["#e8eaf6", "#c5cae9", "#3f51b5", "#1a237e"],
      fontPrimary: "Space Grotesk",
      fontSecondary: "Work Sans",
      audio: "space ambient"
    }, "Cosmic", 240)
  },
  minimal: {
    name: "Minimal",
    background: "#fafafa",
    backgroundAlt: "#f5f5f5",
    accent: "#616161",
    headingColor: "#212121",
    textColor: "#424242",
    swatches: ["#fafafa", "#f5f5f5", "#616161", "#212121"],
    fontPrimary: "Inter",
    fontSecondary: "Roboto",
    audio: "minimal ambient",
    svg: () => generateGeometricSVG({
      name: "Minimal",
      background: "#fafafa",
      backgroundAlt: "#f5f5f5",
      accent: "#616161",
      headingColor: "#212121",
      textColor: "#424242",
      swatches: ["#fafafa", "#f5f5f5", "#616161", "#212121"],
      fontPrimary: "Inter",
      fontSecondary: "Roboto",
      audio: "minimal ambient"
    }, "Minimal", 240)
  }
};

// Get a static palette based on input word
export function getStaticPalette(word: string): Palette {
  const normalizedWord = word.toLowerCase().trim();
  
  // Direct matches
  if (staticPalettes[normalizedWord]) {
    return staticPalettes[normalizedWord];
  }
  
  // Default to a fixed palette for consistency
  // This makes it obvious when we're not getting a unique palette from OpenAI
  const fallbackPalette = {
    ...staticPalettes['celestial'],
    name: word
  };
  
  return fallbackPalette;
}
