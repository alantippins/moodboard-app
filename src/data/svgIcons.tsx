import React from "react";

type DustyPeachIconProps = React.SVGProps<SVGSVGElement> & {
  color1?: string;
  color2?: string;
  color3?: string;
};

export function DustyPeachIcon({ color1 = "#f3ded3", color2 = "#8d543d", color3 = "#d8a48f", ...props }: DustyPeachIconProps) {
  return (
    <svg width="240" height="280" viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="240" height="280" rx="24" fill={color1}/>
      <path d="M40 90 a80 80 0 0 0 160 0" fill={color2}/>
      <path d="M40 170 a80 80 0 0 0 160 0" fill={color3}/>
    </svg>
  );
}

type BrutalistIconProps = React.SVGProps<SVGSVGElement> & {
  color1?: string;
  color2?: string;
  color3?: string;
};

export function BrutalistIcon({ color1 = "#22223b", color2 = "#9a8c98", color3 = "#f2e9e4", ...props }: BrutalistIconProps) {
  return (
    <svg width="240" height="280" viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="240" height="280" rx="0" fill={color1}/>
      <rect x="40" y="40" width="160" height="80" fill={color2}/>
      <rect x="40" y="140" width="160" height="40" fill={color3}/>
    </svg>
  );
}

type CelestialIconProps = React.SVGProps<SVGSVGElement> & {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
};

export function CelestialIcon({ color1 = "#eef4fd", color2 = "#d7c7ff", color3 = "#5f5086", color4 = "#717680", ...props }: CelestialIconProps) {
  return (
    <svg width="240" height="280" viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="240" height="280" rx="24" fill={color1}/>
      <circle cx="120" cy="100" r="60" fill={color2}/>
      <circle cx="120" cy="200" r="40" fill={color3}/>
      <circle cx="170" cy="170" r="15" fill={color4}/>
    </svg>
  );
}
