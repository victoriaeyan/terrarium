import { memo, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

import { Building, Car, Gift, GiftKind, House, Pet, SignGlyph, Tree } from '@/components/sprites';
import { Walker } from '@/components/walker';
import { HOUSE_COLORS, PALETTES, ROOF_COLORS } from '@/lib/palettes';
import { clusterOffset, daylight, homeLot, presenceAt, spotForPlace, statusFor } from '@/lib/sim';
import { C, F } from '@/lib/theme';
import {
  AVENUE_X,
  BASE_ROWS,
  COLS,
  FRIENDS,
  HouseStyle,
  NEWCOMER_START,
  PLACES,
  Place,
  PetKind,
  ROADS,
  newcomerLot,
} from '@/lib/world';

export type Neighbor = {
  _id: string;
  name: string;
  vibe: string;
  palette: number;
  house: HouseStyle;
  pet: PetKind;
};

const VILLAGE_ROADS = [6, 11, 16, 21, 26];

const TREES = [
  { x: 6, y: 0.4 }, { x: 0.2, y: 0.2 }, { x: 14.7, y: 0.3 }, { x: 9.4, y: 0.6 }, { x: 5.4, y: 7.6 },
  { x: 9.2, y: 8.2 }, { x: 5.5, y: 3.2 }, { x: 9.3, y: 3 }, { x: 15.1, y: 12.4 }, { x: 7.2, y: 12.3 },
  { x: 15.2, y: 17.6 }, { x: 1.5, y: 25.1 }, { x: 5.6, y: 24.9 }, { x: 15.2, y: 27.1 }, { x: 0.1, y: 27.1 },
];

const STATUS_DOT: Record<string, string> = {
  free: '#5FD3A1',
  busy: '#FF6B5A',
  meeting: '#FF6B5A',
  class: '#8E6BFF',
  asleep: '#8A8A8A',
};

function rand(seed: number) {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

export function mapRows(neighborCount: number) {
  const r = Math.max(1, Math.ceil(neighborCount / 4));
  return NEWCOMER_START + 1 + r * 5;
}

const Ground = memo(function Ground({ width, rows }: { width: number; rows: number }) {
  const U = 8;
  const W = COLS * U;
  const H = rows * U;
  const roads = [...VILLAGE_ROADS];
  for (let y = NEWCOMER_START + 4; y < rows; y += 5) roads.push(y);
  const tufts = Array.from({ length: Math.round(rows * 7) }, (_, i) => ({
    x: Math.floor(rand(i + 1) * W),
    y: Math.floor(rand(i + 101) * H),
    c: rand(i + 7) > 0.85 ? (rand(i + 3) > 0.5 ? '#FFF1A8' : '#FFB3C7') : rand(i) > 0.5 ? C.grassDark : C.grassLight,
  }));
  const pond = { x: 2 * U, y: 23 * U, w: 3 * U, h: 2 * U };
  return (
    <Svg width={width} height={(width / W) * H} viewBox={`0 0 ${W} ${H}`} style={StyleSheet.absoluteFill}>
      <Rect x={0} y={0} width={W} height={H} fill={C.grass} />
      {tufts.map((t, i) => (
        <Rect key={i} x={t.x} y={t.y} width={1} height={1} fill={t.c} />
      ))}
      <Rect x={0.5 * U} y={22.25 * U} width={6.5 * U} height={3.5 * U} fill="#8ED37A" />
      {roads.map((r) => (
        <Rect key={`r${r}`} x={0} y={r * U} width={W} height={U} fill={C.dirt} />
      ))}
      {roads.map((r) => (
        <Rect key={`re${r}`} x={0} y={r * U + U - 1} width={W} height={1} fill={C.dirtDark} />
      ))}
      <Rect x={(AVENUE_X - 1) * U} y={0} width={2 * U} height={H} fill={C.dirt} />
      <Rect x={(AVENUE_X - 1) * U} y={0} width={1} height={H} fill={C.dirtDark} />
      <Rect x={(AVENUE_X + 1) * U - 1} y={0} width={1} height={H} fill={C.dirtDark} />
      {Array.from({ length: Math.floor(H / 6) }, (_, i) => (
        <Rect key={`d${i}`} x={AVENUE_X * U - 0.5} y={i * 6 + 1} width={1} height={3} fill="#F2D9A8" />
      ))}
      <Rect x={pond.x - 1} y={pond.y + 2} width={pond.w + 2} height={pond.h - 4} fill={C.water} />
      <Rect x={pond.x + 2} y={pond.y} width={pond.w - 4} height={pond.h} fill={C.water} />
      <Rect x={pond.x + 4} y={pond.y + 3} width={6} height={1} fill={C.waterLight} />
      <Rect x={pond.x + 12} y={pond.y + 9} width={4} height={1} fill={C.waterLight} />
      <Rect x={pond.x + 15} y={pond.y + 4} width={2} height={2} fill="#3E9B4F" />
    </Svg>
  );
});

function Twinkle({ size, delay }: { size: number; delay: number }) {
  const o = useSharedValue(0.2);
  useEffect(() => {
    const t = setTimeout(() => {
      o.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.2, { duration: 900 })), -1);
    }, delay);
    return () => clearTimeout(t);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View style={style}>
      <Text style={{ color: '#FFE27A', fontSize: size, fontFamily: F.pixel }}>✦</Text>
    </Animated.View>
  );
}

function Zzz({ size }: { size: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.linear }), -1);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: 1 - v.value, transform: [{ translateY: -v.value * size * 2 }, { translateX: v.value * size }] }));
  return (
    <Animated.View style={[{ position: 'absolute', right: -size * 0.4, top: -size * 0.6 }, style]} pointerEvents="none">
      <Text style={{ fontFamily: F.pixel, fontSize: size, color: '#FFFFFF', textShadowColor: C.ink, textShadowRadius: 1, textShadowOffset: { width: 1, height: 1 } }}>z Z</Text>
    </Animated.View>
  );
}

function PlaceView({ place, T, lit, onPress, visitors }: { place: Place; T: number; lit: boolean; onPress: () => void; visitors: number }) {
  const style = { position: 'absolute' as const, left: place.x * T, top: place.y * T, width: place.w * T, height: place.h * T };
  if (place.kind === 'park') {
    return (
      <Pressable style={style} onPress={onPress} accessibilityLabel={place.name}>
        <View style={[styles.plaque, { left: place.w * T - 4 * T, top: T * 0.2 }]}>
          <SignGlyph icon={place.sign} size={2} />
          <Text style={styles.plaqueText}>{place.name}</Text>
        </View>
      </Pressable>
    );
  }
  const building = (
    <Building
      width={place.w * T}
      height={place.h * T}
      wall={place.wall}
      roof={place.roof}
      lit={lit}
      style={place.id === 'library' || place.id === 'office' ? 'civic' : 'shop'}
      sign={place.sign}
    />
  );
  return (
    <Pressable style={style} onPress={onPress} accessibilityLabel={place.name}>
      <View style={{ opacity: place.kind === 'construction' ? 0.55 : 1 }}>{building}</View>
      {place.kind === 'construction' ? <Scaffold w={place.w * T} h={place.h * T} /> : null}
      <View style={[styles.signBox, { top: place.h * T * 0.3 }]}>
        <SignGlyph icon={place.sign} size={Math.max(2, Math.round(T / 10))} />
      </View>
      {place.kind === 'construction' ? (
        <View style={styles.progress}>
          <Text style={styles.progressText}>BUILDING 3/5</Text>
        </View>
      ) : null}
      {visitors > 0 && place.kind === 'building' ? (
        <View style={styles.count}>
          <Text style={styles.countText}>{visitors}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function Scaffold({ w, h }: { w: number; h: number }) {
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill} viewBox="0 0 24 24">
      {[2, 11, 20].map((x) => (
        <Rect key={x} x={x} y={2} width={1.5} height={22} fill="#C98A3B" />
      ))}
      {[6, 13, 20].map((y) => (
        <Rect key={y} x={1} y={y} width={22} height={1.5} fill="#C98A3B" />
      ))}
      <Rect x={0} y={21} width={24} height={3} fill="#FFC94A" />
      {[0, 4, 8, 12, 16, 20].map((x) => (
        <Rect key={`s${x}`} x={x} y={21} width={2} height={3} fill={C.ink} />
      ))}
    </Svg>
  );
}

export const VillageMap = memo(function VillageMap({
  width,
  t,
  gifts,
  neighbors,
  featured,
  myHouse,
  myHouseColor,
  myPet,
  hideMe,
  onPressFriend,
  onPressPlace,
  onPressNeighbor,
  onPressEmptyLot,
}: {
  width: number;
  t: number;
  gifts: Record<string, GiftKind[]>;
  neighbors: Neighbor[];
  featured: string | null;
  myHouse: HouseStyle;
  myHouseColor: string;
  myPet: PetKind;
  hideMe: boolean;
  onPressFriend: (id: string) => void;
  onPressPlace: (p: Place) => void;
  onPressNeighbor: (n: Neighbor) => void;
  onPressEmptyLot: () => void;
}) {
  const T = width / COLS;
  const rows = mapRows(neighbors.length);
  const dark = daylight(t);
  const presence = presenceAt(t);
  const newcomerRoads = useMemo(() => {
    const out: number[] = [];
    for (let y = NEWCOMER_START + 4; y < rows; y += 5) out.push(y);
    return out;
  }, [rows]);

  const clusterIndex: Record<string, number> = {};
  const visitors: Record<string, number> = {};
  for (const p of presence) {
    if (p.seg.at === 'sleep' || p.seg.at === 'wander') continue;
    visitors[p.seg.at] = (visitors[p.seg.at] ?? 0) + 1;
  }

  return (
    <View style={{ width, height: rows * T, backgroundColor: C.grass }}>
      <Ground width={width} rows={rows} />

      {TREES.map((tr, i) => (
        <View key={i} style={{ position: 'absolute', left: tr.x * T, top: tr.y * T }} pointerEvents="none">
          <Tree size={Math.max(2, Math.round(T / 7))} variant={i} />
        </View>
      ))}

      {PLACES.map((place) => (
        <PlaceView
          key={place.id}
          place={place}
          T={T}
          lit={dark > 0.3 && (visitors[place.id] ?? 0) > 0}
          visitors={visitors[place.id] ?? 0}
          onPress={() => onPressPlace(place)}
        />
      ))}

      {FRIENDS.map((f, i) => {
        const lot = homeLot(f);
        const isMe = f.id === 'you';
        const seg = presence[i].seg;
        const home = seg.at === `home:${f.id}` || seg.at === 'sleep';
        const asleep = seg.at === 'sleep';
        const owl = f.badges.includes('owl');
        return (
          <Pressable
            key={f.id}
            testID={`house-${f.id}`}
            accessibilityLabel={`${f.name}'s house`}
            onPress={() => onPressFriend(f.id)}
            style={{ position: 'absolute', left: lot.x * T, top: lot.y * T, width: 3 * T, height: 3 * T }}>
            <House
              style={isMe ? myHouse : f.house}
              size={3 * T}
              wall={isMe ? myHouseColor : f.houseColor}
              roof={f.roofColor}
              lit={dark > 0.3 && home && !asleep}
            />
            {asleep ? <Zzz size={T * 0.45} /> : null}
            {owl && dark > 0.3 ? (
              <View style={styles.owlStars} pointerEvents="none">
                <Twinkle size={T * 0.4} delay={0} />
                <Twinkle size={T * 0.3} delay={400} />
                <Twinkle size={T * 0.45} delay={900} />
              </View>
            ) : null}
            <View style={[styles.lawn, { top: 3 * T - T * 0.85 }]} pointerEvents="none">
              {(gifts[f.id] ?? []).map((g, gi) => (
                <Gift key={`${g}-${gi}`} kind={g} size={Math.max(2, Math.round(T / 9))} />
              ))}
            </View>
            {f.car ? (
              <View style={{ position: 'absolute', left: -T * 0.25, top: 3 * T - T * 0.55 }} pointerEvents="none">
                <Car color={f.car} size={Math.max(1.5, T / 12)} />
              </View>
            ) : null}
            <View style={{ position: 'absolute', right: -T * 0.1, top: 3 * T - T * 0.75 }} pointerEvents="none">
              <Pet kind={isMe ? myPet : f.pet} size={Math.max(2, Math.round(T / 10))} flip={i % 2 === 0} />
            </View>
          </Pressable>
        );
      })}

      <View style={[styles.laneSign, { top: (NEWCOMER_START + 0.2) * T, left: 0.5 * T }]} pointerEvents="none">
        <Text style={styles.plaqueText}>NEWCOMERS’ LANE</Text>
      </View>

      {neighbors.map((n, i) => {
        const lot = newcomerLot(i);
        return (
          <Pressable
            key={n._id}
            accessibilityLabel={`${n.name}'s house`}
            onPress={() => onPressNeighbor(n)}
            style={{ position: 'absolute', left: lot.x * T, top: lot.y * T, width: 3 * T, height: 3 * T }}>
            <House
              style={n.house}
              size={3 * T}
              wall={HOUSE_COLORS[n.palette % HOUSE_COLORS.length]}
              roof={ROOF_COLORS[n.palette % ROOF_COLORS.length]}
              lit={dark > 0.3}
            />
            <View style={{ position: 'absolute', right: -T * 0.1, top: 3 * T - T * 0.75 }} pointerEvents="none">
              <Pet kind={n.pet} size={Math.max(2, Math.round(T / 10))} />
            </View>
          </Pressable>
        );
      })}

      {neighbors.length % 4 !== 0 || neighbors.length === 0 ? (
        <Pressable
          testID="empty-lot"
          accessibilityLabel="Empty lot, invite a neighbor"
          onPress={onPressEmptyLot}
          style={[
            styles.emptyLot,
            {
              left: newcomerLot(neighbors.length).x * T,
              top: newcomerLot(neighbors.length).y * T + T * 0.4,
              width: 3 * T,
              height: 2.4 * T,
            },
          ]}>
          <Text style={styles.emptyLotText}>+</Text>
          <Text style={styles.emptyLotSmall}>FREE LOT</Text>
        </Pressable>
      ) : null}

      {presence.map((p) => {
        const f = p.friend;
        const seg = p.seg;
        const isMe = f.id === 'you';
        const wander = seg.at === 'wander' || (isMe && hideMe);
        const asleep = seg.at === 'sleep';
        const spot = asleep || wander ? spotForPlace(`home:${f.id}`) : spotForPlace(seg.at as never);
        const ci = clusterIndex[seg.at] ?? 0;
        clusterIndex[seg.at] = ci + 1;
        const status = statusFor(f, t);
        return (
          <Walker
            key={f.id}
            id={f.id}
            name={f.name}
            palette={f.palette}
            accessory={f.accessory}
            tile={T}
            spot={spot}
            offset={wander ? { x: 0, y: 0 } : clusterOffset(ci)}
            hidden={asleep}
            wanderRoads={wander ? VILLAGE_ROADS : undefined}
            bubble={featured === f.id || (p.together.length > 0 && ci === 0) ? seg.doing : null}
            hearts={p.together.length > 0 && ci === 0}
            dot={STATUS_DOT[status.tone]}
            onPress={() => onPressFriend(f.id)}
          />
        );
      })}

      {neighbors.map((n, i) => {
        const lot = newcomerLot(i);
        const spot = { x: lot.x + 1.5, y: lot.road, road: lot.road };
        return (
          <Walker
            key={n._id}
            id={n._id}
            name={n.name}
            palette={PALETTES[n.palette % PALETTES.length]}
            tile={T}
            spot={spot}
            offset={{ x: 0, y: 0 }}
            wanderRoads={newcomerRoads}
            onPress={() => onPressNeighbor(n)}
          />
        );
      })}

      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: C.night, opacity: dark * 0.42 }]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  plaque: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8A5A3B',
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },
  plaqueText: { fontFamily: F.pixel, fontSize: 9, color: '#FFF6E0', letterSpacing: 0.8 },
  signBox: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: C.cream,
    borderWidth: 2,
    borderColor: C.ink,
    padding: 2,
    borderRadius: 2,
  },
  progress: {
    position: 'absolute',
    bottom: 2,
    alignSelf: 'center',
    backgroundColor: C.gold,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 3,
  },
  progressText: { fontFamily: F.pixel, fontSize: 8, color: C.ink },
  count: {
    position: 'absolute',
    right: -4,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.coral,
    borderWidth: 2,
    borderColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontFamily: F.pixel, fontSize: 10, color: '#FFFFFF' },
  lawn: { position: 'absolute', left: '28%', flexDirection: 'row', gap: 2 },
  owlStars: { position: 'absolute', top: -8, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around' },
  laneSign: {
    position: 'absolute',
    backgroundColor: '#8A5A3B',
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  emptyLot: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(43,29,20,0.45)',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,246,224,0.25)',
  },
  emptyLotText: { fontFamily: F.pixel, fontSize: 22, color: C.ink },
  emptyLotSmall: { fontFamily: F.pixel, fontSize: 9, color: C.ink, letterSpacing: 1 },
});
