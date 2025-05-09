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
export function generateGeometricSVG(palette: Palette, seed: string, size: number = 120): React.ReactNode {
  const rand = seededRandom(seed);
  const grid = 4;
  const cell = size / grid;
  const shapes = [];

  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      const shapeType = Math.floor(rand() * 4); // 0: circle, 1: rect, 2: triangle, 3: half-circle
      const color = palette.swatches[Math.floor(rand() * palette.swatches.length)] || palette.background;
      const cx = x * cell + cell / 2;
      const cy = y * cell + cell / 2;
      switch (shapeType) {
        case 0: // circle
          shapes.push(<circle key={`${x}-${y}-c`} cx={cx} cy={cy} r={cell / 2.5} fill={color} />);
          break;
        case 1: // rect
          shapes.push(<rect key={`${x}-${y}-r`} x={x * cell} y={y * cell} width={cell} height={cell} fill={color} />);
          break;
        case 2: // triangle
          shapes.push(
            <polygon
              key={`${x}-${y}-t`}
              points={`${cx},${cy - cell / 2} ${cx - cell / 2},${cy + cell / 2} ${cx + cell / 2},${cy + cell / 2}`}
              fill={color}
            />
          );
          break;
        case 3: // half-circle (top)
          shapes.push(
            <path
              key={`${x}-${y}-h`}
              d={`M${cx},${cy} m-${cell / 2},0 a${cell / 2},${cell / 2} 0 1,1 ${cell},0`}
              fill={color}
            />
          );
          break;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      {shapes}
    </svg>
  );
}
