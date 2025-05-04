import { DustyPeachIcon, BrutalistIcon, CelestialIcon } from "./svgIcons";

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
  "brutalist": {
    name: "Brutalist",
    background: "#f0ebd8",
    backgroundAlt: "#1d2d44",
    accent: "#748cab",
    headingColor: "#3e5c76",
    textColor: "#1d2d44",
    swatches: ["#f0ebd8", "#748cab", "#3e5c76", "#1d2d44"],
    fontPrimary: "IBM Plex Mono",
    fontSecondary: "Arial",
    audio: "industrial.mp3",
    svg: (props) => (
      <BrutalistIcon
        color1="#f0ebd8"
        color2="#f0ebd8"
        color3="#3e5c76"
        {...props}
      />
    ),
  },
  "celestial": {
    name: "Celestial",
    background: "#d7c7ff",
    backgroundAlt: "#5f5086",
    accent: "#5f5086",
    headingColor: "#717680",
    textColor: "#5f5086",
    swatches: ["#d7c7ff", "#5f5086", "#eef4fd", "#717680"],
    fontPrimary: "Cormorant Garamond",
    fontSecondary: "Montserrat",
    audio: "ambient-space.mp3",
    svg: (props) => (
      <CelestialIcon
        color1="#eef4fd"
        color2="#d7c7ff"
        color3="#5f5086"
        color4="#717680"
        {...props}
      />
    ),
  },
};
