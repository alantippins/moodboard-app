import { DustyPeachIcon, BrutalistIcon, CelestialIcon } from "./svgIcons";

export type Palette = {
  name: string;
  colors: string[];
  fontPrimary: string;
  fontSecondary: string;
  audio: string;
  svg: (props?: React.SVGProps<SVGSVGElement>) => React.ReactNode;
};

export const palettes: Record<string, Palette> = {
  "dusty peach": {
    name: "Dusty Peach",
    colors: ["#F3DED3", "#D8A48F", "#8D543D", "#4E2E20"],
    fontPrimary: "Playfair Display",
    fontSecondary: "Inter",
    audio: "lofi-loop.mp3",
    svg: (props) => (
      <DustyPeachIcon
        color1="#f3ded3"
        color2="#8d543d"
        color3="#d8a48f"
        {...props}
      />
    )
  },
  "brutalist": {
    name: "Brutalist",
    colors: ["#22223b", "#4a4e69", "#9a8c98", "#f2e9e4"],
    fontPrimary: "IBM Plex Mono",
    fontSecondary: "Arial",
    audio: "industrial.mp3",
    svg: (props) => (
      <BrutalistIcon
        color1="#22223b"
        color2="#9a8c98"
        color3="#f2e9e4"
        {...props}
      />
    )
  },
  "celestial": {
    name: "Celestial",
    colors: ["#d7c7ff", "#5f5086", "#eef4fd", "#717680"],
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
    )
  }
};
