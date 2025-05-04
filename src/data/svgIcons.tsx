import React from "react";

type DustyPeachIconProps = React.SVGProps<SVGSVGElement> & {
  color1?: string;
  color2?: string;
  color3?: string;
};

export function DustyPeachIcon({ color1 = "#f3ded3", color2 = "#8d543d", color3 = "#d8a48f", ...props }: DustyPeachIconProps) {
  return (
    <svg width="240" height="280" viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M40 90 a80 80 0 0 0 160 0" fill={color2}/>
      <path d="M40 170 a80 80 0 0 0 160 0" fill={color3}/>
    </svg>
  );
}

type StoneIconProps = React.SVGProps<SVGSVGElement> & {
  color1?: string;
  color2?: string;
};

export function StoneIcon({ color1 = "#B0B0B0", color2 = "#B0B0B0", ...props }: StoneIconProps) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 316 316" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Top Stone */}
      <path d="M220 70c0 40-35 60-90 60S40 100 40 70 75 10 130 10s90 50 90 60z" fill={color1} />
      {/* Bottom Stone */}
      <path d="M260 220c0 60-60 70-120 50S20 230 60 160s140-60 180-30 20 90 20 90z" fill={color2} />
    </svg>
  );
}

type CelestialIconProps = React.SVGProps<SVGSVGElement> & {
  color1?: string;
  color2?: string;
  color3?: string;
};

export function CelestialIcon({ color1 = "#E3D3DE", color2 = "#8A7692", color3 = "#383A69", ...props }: CelestialIconProps) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#celestialClip)">
        <circle cx="75" cy="75" r="75" fill={color1} />
        <circle cx="150" cy="0" r="75" fill={color2} />
        <circle cx="0" cy="0" r="75" fill={color3} />
        <circle cx="0" cy="150" r="75" fill={color2} />
        <circle cx="150" cy="150" r="75" fill={color3} />
      </g>
      <defs>
        <clipPath id="celestialClip">
          <rect width="150" height="150" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
