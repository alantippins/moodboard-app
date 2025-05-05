import { DustyPeachIcon, StoneIcon, CelestialIcon } from "./svgIcons";

export type Palette = {
  name: string;
  background: string;
  backgroundAlt: string;
  accent: string;
  headingColor: string;
  textColor: string;
  swatches: string[];
  fontPrimary: string;
  fontSecondary: string;
  audio: string;
  svg: (props?: React.SVGProps<SVGSVGElement>) => React.ReactNode;
};

export const palettes: Record<string, Palette> = {
  "dusty peach": {
    name: "Dusty Peach",
    background: "#F3DED3",
    backgroundAlt: "#8D543D",
    accent: "#D8A48F",
    headingColor: "#4E2E20",
    textColor: "#8D543D",
    swatches: ["#F3DED3", "#D8A48F", "#8D543D", "#4E2E20"],
    fontPrimary: "Playfair Display",
    fontSecondary: "Inter",
    audio: "rainy-lofi-city-music.mp3",
    svg: (props) => (
      <DustyPeachIcon
        color1="#F3DED3"
        color2="#8D543D"
        color3="#D8A48F"
        {...props}
      />
    ),
  },
  "stone": {
    name: "Stone",
    background: "#F2F2F2",           // Soft concrete
    backgroundAlt: "#B0B0B0",        // Pure black
    accent: "#B0B0B0",               // Industrial metal
    headingColor: "#1A1A1A",         // Strong contrast
    textColor: "#3A3A3A",            // Matches accent
    swatches: ["#F2F2F2", "#B0B0B0", "#3A3A3A", "#1A1A1A"],
    fontPrimary: "Space Grotesk",    // Modern grotesque
    fontSecondary: "Courier Prime",  // Monospaced edge
    audio: "rainy-lofi-city-music.mp3",
    svg: (props) => (
      <StoneIcon
        color1="#F2F2F2"
        color2="#3A3A3A"
        {...props}
      />
    ),
  },
  "celestial": {
    name: "Celestial",
    background: "#e3D3De",           
    backgroundAlt: "#383A69",        
    accent: "#8A7692",               
    headingColor: "#1C1E3F",        
    textColor: "#383A69",            
    swatches: ["#E3D3DE", "#8A7692","#383A69", "#1C1E3F" ],
    fontPrimary: "Cormorant Garamond",  // Elegant, poetic
    fontSecondary: "Montserrat",        // Clean, grounded
    audio: "ambient-space.mp3",
    svg: (props) => (
      <CelestialIcon
        color1="#E3D3DE"
        color2="#8A7692"
        color3="#383A69"
        {...props}
      />
    ),
  },
};
