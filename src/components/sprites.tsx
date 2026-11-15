import { memo } from 'react';
import Svg, { Rect } from 'react-native-svg';

import { PixelArt } from '@/components/pixel';
import { C } from '@/lib/theme';
import type { Accessory, HouseStyle, Palette, PetKind, SignIcon } from '@/lib/world';

const BODY = [
  '..hhhh..',
  '.hhhhhh.',
  '.hssssh.',
  '.seesse.',
  '.ssssss.',
  '..ssss..',
  '.tttttt.',
  'tttttttt',
  's.tttt.s',
  '..pppp..',
];
const LEGS_A = ['..p..p..', '..b..b..'];
const LEGS_B = ['.p....p.', '.b....b.'];
const LEGS_C = ['...pp...', '...bb...'];

const ACCESSORY_ROWS: Record<Accessory, Record<number, string>> = {
  none: {},
  glasses: { 3: '.gggggg.' },
  headphones: { 1: 'mhhhhhhm', 2: 'mssssssm', 3: 'meesseem' },
  cap: { 0: '.cccccc.', 1: 'cccccccc' },
  bow: { 0: 'ww.hhhh.', 1: 'wwhhhhhh' },
};

function overlay(base: string, top?: string) {
  if (!top) return base;
  return base
    .split('')
    .map((ch, i) => (top[i] && top[i] !== '.' ? top[i] : ch))
    .join('');
}

export const Avatar = memo(function Avatar({
  palette,
  accessory = 'none',
  size,
  frame = 0,
  flip = false,
}: {
  palette: Palette;
  accessory?: Accessory;
  size: number;
  frame?: 0 | 1 | 2;
  flip?: boolean;
}) {
  const acc = ACCESSORY_ROWS[accessory];
  const rows = [
    ...BODY.map((r, i) => overlay(r, acc[i])),
    ...(frame === 1 ? LEGS_B : frame === 2 ? LEGS_C : LEGS_A),
  ];
  return (
    <PixelArt
      rows={rows}
      size={size}
      flip={flip}
      map={{
        h: palette.hair,
        s: palette.skin,
        e: C.ink,
        t: palette.shirt,
        p: palette.pants,
        b: C.ink,
        g: C.ink,
        m: palette.accent,
        c: palette.accent,
        w: palette.accent,
      }}
    />
  );
});

const PETS: Record<Exclude<PetKind, 'none'>, { rows: string[]; map: Record<string, string> }> = {
  cat: {
    rows: ['a...a.', 'aa.aa.', 'aeaea.', 'aaaaa.', '.aaaaa', '.a..a.'],
    map: { a: '#F2A541', e: C.ink },
  },
  dog: {
    rows: ['bb..bb', 'baaaab', '.aeea.', '.aana.', 'aaaaaa', '.a..a.'],
    map: { a: '#E7C49A', b: '#9B6B43', e: C.ink, n: C.ink },
  },
  frog: {
    rows: ['.e..e.', 'aaaaaa', 'aaaaaa', 'arrrra', '.aaaa.', 'a....a'],
    map: { a: '#58C16B', e: C.ink, r: '#FF8FA3' },
  },
};

export const Pet = memo(function Pet({ kind, size, flip }: { kind: PetKind; size: number; flip?: boolean }) {
  if (kind === 'none') return null;
  const p = PETS[kind];
  return <PixelArt rows={p.rows} map={p.map} size={size} flip={flip} />;
});

export const Car = memo(function Car({ color, size }: { color: string; size: number }) {
  return (
    <PixelArt
      rows={['..cccccc..', '.cwwcwwcc.', 'cccccccccc', 'cccccccccy', '.kk....kk.']}
      map={{ c: color, w: '#BFE8FF', k: C.ink, y: C.gold }}
      size={size}
    />
  );
});

export const Tree = memo(function Tree({ size, variant = 0 }: { size: number; variant?: number }) {
  const leaf = variant % 2 === 0 ? '#3E9B4F' : '#4FAE5C';
  return (
    <PixelArt
      rows={['..lll..', '.lllll.', 'llldlll', 'lldllll', 'lllllld', '.lllll.', '...t...', '...t...']}
      map={{ l: leaf, d: '#2F7A3C', t: '#7A4B2A' }}
      size={size}
    />
  );
});

const SIGNS: Record<SignIcon, { rows: string[]; map: Record<string, string> }> = {
  book: { rows: ['.....', 'rr.bb', 'rr.bb', 'rr.bb', 'rrrbb'], map: { r: '#E2574C', b: '#3D7BF2' } },
  brief: { rows: ['.kkk.', 'bbbbb', 'bbkbb', 'bbbbb', '.....'], map: { b: '#7A4B2A', k: C.ink } },
  cup: { rows: ['.s.s.', 'wwww.', 'wwwwk', 'wwww.', '.ww..'], map: { w: '#FFFFFF', k: '#FFFFFF', s: '#CFCFCF' } },
  dumbbell: { rows: ['.....', 'k...k', 'kkkkk', 'k...k', '.....'], map: { k: C.ink } },
  taco: { rows: ['.....', '.yyy.', 'yglgy', 'yrrry', '.....'], map: { y: '#F5B83D', g: '#58C16B', l: '#58C16B', r: '#D9483A' } },
  note: { rows: ['..kk.', '..k.k', '..k..', 'kkk..', 'kkk..'], map: { k: C.ink } },
  tree: { rows: ['.ggg.', 'ggggg', '.ggg.', '..t..', '..t..'], map: { g: '#3E9B4F', t: '#7A4B2A' } },
  fork: { rows: ['k.k.k', 'k.k.k', 'kkkkk', '..k..', '..k..'], map: { k: '#FFFFFF' } },
  rope: { rows: ['..k..', '.kbk.', '..k..', '.kyk.', '..k..'], map: { k: C.ink, b: '#3D7BF2', y: '#FFC94A' } },
};

export const SignGlyph = memo(function SignGlyph({ icon, size }: { icon: SignIcon; size: number }) {
  const s = SIGNS[icon];
  return <PixelArt rows={s.rows} map={s.map} size={size} />;
});

export const Building = memo(function Building({
  width,
  height,
  wall,
  roof,
  lit,
  style = 'shop',
  sign,
}: {
  width: number;
  height: number;
  wall: string;
  roof: string;
  lit: boolean;
  style?: 'shop' | 'civic';
  sign?: SignIcon;
}) {
  const W = 24;
  const H = Math.round((height / width) * W);
  const roofH = style === 'civic' ? 6 : 5;
  const windowColor = lit ? '#FFE27A' : '#9FD8F5';
  const wins = style === 'civic' ? [3, 8, 14, 19] : [3, 17];
  const rows = [] as { x: number; y: number; w: number; h: number; c: string }[];
  for (let i = 0; i < roofH; i += 1) {
    const inset = style === 'civic' ? Math.max(0, roofH - 2 - i) * 2 : (roofH - 1 - i) * 2;
    rows.push({ x: inset, y: i, w: W - inset * 2, h: 1, c: i === roofH - 1 ? C.ink : roof });
  }
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${W} ${H}`}>
      <Rect x={1} y={roofH} width={W - 2} height={H - roofH} fill={wall} />
      <Rect x={1} y={H - 1} width={W - 2} height={1} fill={C.ink} opacity={0.35} />
      {rows.map((r, i) => (
        <Rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.c} />
      ))}
      {style === 'civic' &&
        [4, 9, 14, 19].map((x) => <Rect key={x} x={x} y={roofH} width={1} height={H - roofH} fill="#FFFFFF" opacity={0.45} />)}
      {wins.map((x) => (
        <Rect key={x} x={x} y={roofH + 3} width={3} height={3} fill={windowColor} />
      ))}
      <Rect x={9} y={H - 7} width={6} height={6} fill={C.ink} opacity={0.85} />
      <Rect x={10} y={H - 6} width={4} height={5} fill={lit ? '#FFB84D' : '#8A5A3B'} />
      {sign && <Rect x={8} y={roofH + 1} width={8} height={1} fill={C.ink} opacity={0.2} />}
    </Svg>
  );
});

export const House = memo(function House({
  style,
  size,
  wall,
  roof,
  lit,
}: {
  style: HouseStyle;
  size: number;
  wall: string;
  roof: string;
  lit: boolean;
}) {
  const win = lit ? '#FFE27A' : '#9FD8F5';
  const door = lit ? '#FFB84D' : '#8A5A3B';
  if (style === 'treehouse') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x={10} y={14} width={4} height={10} fill="#7A4B2A" />
        <Rect x={0} y={1} width={24} height={6} fill="#3E9B4F" />
        <Rect x={2} y={0} width={20} height={2} fill="#4FAE5C" />
        <Rect x={4} y={5} width={16} height={9} fill={wall} />
        <Rect x={3} y={4} width={18} height={2} fill={roof} />
        <Rect x={6} y={8} width={3} height={3} fill={win} />
        <Rect x={15} y={8} width={3} height={3} fill={win} />
        <Rect x={10} y={9} width={4} height={5} fill={door} />
        <Rect x={4} y={14} width={16} height={1} fill={C.ink} opacity={0.6} />
        <Rect x={14} y={15} width={1} height={8} fill="#C9A06A" />
        <Rect x={14} y={17} width={3} height={1} fill="#C9A06A" />
        <Rect x={14} y={20} width={3} height={1} fill="#C9A06A" />
      </Svg>
    );
  }
  if (style === 'loft') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x={3} y={2} width={18} height={22} fill={wall} />
        <Rect x={2} y={1} width={20} height={2} fill={roof} />
        <Rect x={2} y={3} width={20} height={1} fill={C.ink} opacity={0.6} />
        {[6, 11].map((y) => [5, 10, 15].map((x) => <Rect key={`${x}-${y}`} x={x} y={y} width={4} height={3} fill={win} />))}
        <Rect x={9} y={17} width={6} height={7} fill={door} />
        <Rect x={17} y={0} width={2} height={2} fill="#6B6B6B" />
      </Svg>
    );
  }
  if (style === 'dome') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x={8} y={4} width={8} height={2} fill={roof} />
        <Rect x={5} y={6} width={14} height={2} fill={roof} />
        <Rect x={3} y={8} width={18} height={3} fill={roof} />
        <Rect x={2} y={11} width={20} height={13} fill={wall} />
        <Rect x={2} y={11} width={20} height={1} fill={C.ink} opacity={0.4} />
        <Rect x={5} y={14} width={4} height={4} fill={win} />
        <Rect x={15} y={14} width={4} height={4} fill={win} />
        <Rect x={10} y={16} width={4} height={8} fill={door} />
        <Rect x={11} y={2} width={2} height={2} fill={C.gold} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={10} y={2} width={4} height={2} fill={roof} />
      <Rect x={7} y={4} width={10} height={2} fill={roof} />
      <Rect x={4} y={6} width={16} height={2} fill={roof} />
      <Rect x={1} y={8} width={22} height={3} fill={roof} />
      <Rect x={1} y={11} width={22} height={1} fill={C.ink} opacity={0.6} />
      <Rect x={3} y={12} width={18} height={12} fill={wall} />
      <Rect x={17} y={3} width={2} height={4} fill="#8A5A3B" />
      <Rect x={5} y={14} width={4} height={4} fill={win} />
      <Rect x={15} y={14} width={4} height={4} fill={win} />
      <Rect x={10} y={16} width={4} height={8} fill={door} />
    </Svg>
  );
});

export const GIFTS = {
  plant: { label: 'Monstera', rows: ['.g.g.', 'ggggg', '.ggg.', '.ppp.', '.ppp.'], map: { g: '#3E9B4F', p: '#C9663B' } },
  lamp: { label: 'Lava lamp', rows: ['.kkk.', '.rrr.', '.rpr.', '.rrr.', 'kkkkk'], map: { k: C.ink, r: '#FF6B8A', p: '#FFC94A' } },
  stars: { label: 'Star garland', rows: ['y...y', '.y.y.', '..y..', '.y.y.', 'y...y'], map: { y: '#FFE27A' } },
  cake: { label: 'Tiny cake', rows: ['..r..', '.www.', 'ppppp', 'wwwww', 'ppppp'], map: { r: '#FF5A5A', w: '#FFFFFF', p: '#FF9EC4' } },
  flag: { label: 'Pennant', rows: ['kbb..', 'kbbbb', 'kbb..', 'k....', 'k....'], map: { k: C.ink, b: '#8C1515' } },
  duck: { label: 'Rubber duck', rows: ['..yy.', '.yeyo', 'yyyy.', 'yyyyy', '.yyy.'], map: { y: '#FFD23F', e: C.ink, o: '#FF8A3D' } },
} as const;

export type GiftKind = keyof typeof GIFTS;

export const Gift = memo(function Gift({ kind, size }: { kind: GiftKind; size: number }) {
  const g = GIFTS[kind];
  return <PixelArt rows={g.rows as unknown as string[]} map={g.map} size={size} />;
});
