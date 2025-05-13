import React from "react";
import { Palette } from "@/data/palettes";

// Deterministic seeded random number generator
function seededRandom(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return function () {
    h += h << 13; h ^= h >>> 7;
    h += h << 3; h ^= h >>> 17;
    h += h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

// Main SVG generator
export function generateGeometricSVG(palette: Palette, seed: string, size: number = 260): React.ReactNode {
  // Minimal, stacked layout with varied shapes and color contrast
  const rand = seededRandom(seed);
  const numShapes = 2 + Math.floor(rand() * 2); // 2 or 3
  const margin = 32; // px space from top and bottom
  const shapeSize = (size - 2 * margin) / (numShapes + 0.2); // add a little space between
  const centerX = size / 2;
  const backgroundColor = palette.background;
  const shapes = [];

  // Helper: pick a swatch with enough contrast from background
  function pickContrastColor(swatches: string[], bg: string) {
    // Simple contrast: pick the farthest color in the palette by luminance
    function luminance(hex: string) {
      const c = hex.replace('#', '');
      const r = parseInt(c.substring(0,2),16)/255;
      const g = parseInt(c.substring(2,4),16)/255;
      const b = parseInt(c.substring(4,6),16)/255;
      return 0.299*r + 0.587*g + 0.114*b;
    }
    const bgLum = luminance(bg);
    let maxDist = -1, best = swatches[0] || bg;
    for (const s of swatches) {
      const dist = Math.abs(luminance(s) - bgLum);
      if (dist > maxDist) { maxDist = dist; best = s; }
    }
    return best;
  }

  // Define all possible shape types
  const shapeTypes = [
    'circle', 'semi-up', 'semi-down', 'semi-left', 'semi-right',
    'square', 'half-vert', 'half-horiz',
    'triangle-up', 'triangle-down', 'triangle-left', 'triangle-right',
    'half-triangle-ur', 'half-triangle-ul', 'half-triangle-dr', 'half-triangle-dl'
  ];

  for (let i = 0; i < numShapes; i++) {
    const color = pickContrastColor(palette.swatches, backgroundColor);
    const cy = margin + shapeSize / 2 + i * (shapeSize + 8); // 8px vertical gap
    const type = shapeTypes[Math.floor(rand() * shapeTypes.length)];
    let node = null;
    switch (type) {
      case 'circle':
        node = <circle cx={centerX} cy={cy} r={shapeSize/2} fill={color} key={`circle-${i}`} />;
        break;
      case 'semi-up':
        node = <path d={`M${centerX-shapeSize/2},${cy} A${shapeSize/2},${shapeSize/2} 0 0 1 ${centerX+shapeSize/2},${cy} L${centerX},${cy} Z`} fill={color} key={`semiup-${i}`} />;
        break;
      case 'semi-down':
        node = <path d={`M${centerX-shapeSize/2},${cy} A${shapeSize/2},${shapeSize/2} 0 0 0 ${centerX+shapeSize/2},${cy} L${centerX},${cy} Z`} fill={color} key={`semidown-${i}`} />;
        break;
      case 'semi-left':
        node = <path d={`M${centerX},${cy-shapeSize/2} A${shapeSize/2},${shapeSize/2} 0 0 0 ${centerX},${cy+shapeSize/2} L${centerX},${cy} Z`} fill={color} key={`semileft-${i}`} />;
        break;
      case 'semi-right':
        node = <path d={`M${centerX},${cy-shapeSize/2} A${shapeSize/2},${shapeSize/2} 0 0 1 ${centerX},${cy+shapeSize/2} L${centerX},${cy} Z`} fill={color} key={`semiright-${i}`} />;
        break;
      case 'square':
        node = <rect x={centerX-shapeSize/2} y={cy-shapeSize/2} width={shapeSize} height={shapeSize} fill={color} key={`square-${i}`} />;
        break;
      case 'half-vert':
        node = <rect x={centerX-shapeSize/2} y={cy-shapeSize/2} width={shapeSize/2} height={shapeSize} fill={color} key={`halfvert-${i}`} />;
        break;
      case 'half-horiz':
        node = <rect x={centerX-shapeSize/2} y={cy-shapeSize/2} width={shapeSize} height={shapeSize/2} fill={color} key={`halfhoriz-${i}`} />;
        break;
      case 'triangle-up':
        node = <polygon points={`${centerX},${cy-shapeSize/2} ${centerX-shapeSize/2},${cy+shapeSize/2} ${centerX+shapeSize/2},${cy+shapeSize/2}`} fill={color} key={`triup-${i}`} />;
        break;
      case 'triangle-down':
        node = <polygon points={`${centerX},${cy+shapeSize/2} ${centerX-shapeSize/2},${cy-shapeSize/2} ${centerX+shapeSize/2},${cy-shapeSize/2}`} fill={color} key={`tridown-${i}`} />;
        break;
      case 'triangle-left':
        node = <polygon points={`${centerX-shapeSize/2},${cy} ${centerX+shapeSize/2},${cy-shapeSize/2} ${centerX+shapeSize/2},${cy+shapeSize/2}`} fill={color} key={`trileft-${i}`} />;
        break;
      case 'triangle-right':
        node = <polygon points={`${centerX+shapeSize/2},${cy} ${centerX-shapeSize/2},${cy-shapeSize/2} ${centerX-shapeSize/2},${cy+shapeSize/2}`} fill={color} key={`triright-${i}`} />;
        break;
      case 'half-triangle-ur':
        node = <polygon points={`${centerX},${cy-shapeSize/2} ${centerX+shapeSize/2},${cy+shapeSize/2} ${centerX},${cy+shapeSize/2}`} fill={color} key={`htriur-${i}`} />;
        break;
      case 'half-triangle-ul':
        node = <polygon points={`${centerX},${cy-shapeSize/2} ${centerX-shapeSize/2},${cy+shapeSize/2} ${centerX},${cy+shapeSize/2}`} fill={color} key={`htriul-${i}`} />;
        break;
      case 'half-triangle-dr':
        node = <polygon points={`${centerX},${cy+shapeSize/2} ${centerX+shapeSize/2},${cy-shapeSize/2} ${centerX},${cy-shapeSize/2}`} fill={color} key={`htridr-${i}`} />;
        break;
      case 'half-triangle-dl':
        node = <polygon points={`${centerX},${cy+shapeSize/2} ${centerX-shapeSize/2},${cy-shapeSize/2} ${centerX},${cy-shapeSize/2}`} fill={color} key={`htridl-${i}`} />;
        break;
      default:
        break;
    }
    if (node) shapes.push(node);
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: backgroundColor }} xmlns="http://www.w3.org/2000/svg">
      {shapes}
    </svg>
  );
}



