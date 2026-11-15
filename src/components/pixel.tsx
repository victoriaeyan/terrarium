import { memo } from 'react';
import Svg, { Rect } from 'react-native-svg';

export type PixelMap = Record<string, string>;

type Run = { x: number; y: number; w: number; c: string };

function runs(rows: string[], map: PixelMap) {
  const out: Run[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      const c = map[ch];
      if (!c) {
        x += 1;
        continue;
      }
      let w = 1;
      while (x + w < row.length && row[x + w] === ch) w += 1;
      out.push({ x, y, w, c });
      x += w;
    }
  });
  return out;
}

export const PixelArt = memo(function PixelArt({
  rows,
  map,
  size,
  flip = false,
}: {
  rows: string[];
  map: PixelMap;
  size: number;
  flip?: boolean;
}) {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  return (
    <Svg
      width={w * size}
      height={h * size}
      viewBox={`0 0 ${w} ${h}`}
      style={flip ? { transform: [{ scaleX: -1 }] } : undefined}
     >
      {runs(rows, map).map((r, i) => (
        <Rect key={i} x={r.x} y={r.y} width={r.w + 0.02} height={1.02} fill={r.c} />
      ))}
    </Svg>
  );
});
