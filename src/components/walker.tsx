import { memo, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Avatar } from '@/components/sprites';
import { Spot, waypoints } from '@/lib/sim';
import { C, F } from '@/lib/theme';
import type { Accessory, Palette } from '@/lib/world';

const MS_PER_TILE = 230;

export type WalkerProps = {
  id: string;
  name: string;
  palette: Palette;
  accessory?: Accessory;
  tile: number;
  spot: Spot;
  offset: { x: number; y: number };
  hidden?: boolean;
  wanderRoads?: number[];
  bubble?: string | null;
  dot?: string;
  hearts?: boolean;
  onPress?: () => void;
};

function randomRoadSpot(roads: number[]): Spot {
  const road = roads[Math.floor(Math.random() * roads.length)] + 0.5;
  return { x: 1 + Math.random() * 14, y: road, road };
}

export const Walker = memo(function Walker(props: WalkerProps) {
  const { tile, spot, offset, hidden, wanderRoads, bubble, dot, hearts, name, palette, accessory, onPress, id } = props;
  const px = Math.max(2, Math.round(tile / 8));
  const spriteW = 8 * px;
  const spriteH = 12 * px;
  const [wanderSpot, setWanderSpot] = useState<Spot | null>(null);
  const target = wanderRoads ? wanderSpot ?? spot : spot;
  const last = useRef<Spot>(target);
  const x = useSharedValue((target.x + offset.x) * tile - spriteW / 2);
  const y = useSharedValue((target.y + offset.y) * tile - spriteH);
  const bob = useSharedValue(0);
  const [moving, setMoving] = useState(false);
  const [frame, setFrame] = useState<0 | 1 | 2>(0);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (!wanderRoads) return;
    let alive = true;
    const step = () => {
      if (!alive) return;
      setWanderSpot(randomRoadSpot(wanderRoads));
      timer = setTimeout(step, 4500 + Math.random() * 4000);
    };
    let timer = setTimeout(step, 600 + Math.random() * 1500);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [wanderRoads]);

  useEffect(() => {
    const from = last.current;
    const to = target;
    last.current = to;
    const pts = waypoints(from, to);
    let prev = { x: x.value, y: y.value };
    const xs = [];
    const ys = [];
    let total = 0;
    for (let i = 0; i < pts.length; i += 1) {
      const isLast = i === pts.length - 1;
      const p = {
        x: (pts[i].x + (isLast ? offset.x : 0)) * tile - spriteW / 2,
        y: (pts[i].y + (isLast ? offset.y : 0)) * tile - spriteH,
      };
      const dist = Math.hypot(p.x - prev.x, p.y - prev.y) / tile;
      if (dist < 0.02) continue;
      const duration = dist * MS_PER_TILE;
      total += duration;
      xs.push(withTiming(p.x, { duration, easing: Easing.linear }));
      ys.push(withTiming(p.y, { duration, easing: Easing.linear }));
      prev = p;
    }
    if (xs.length === 0) return;
    const dx = pts[pts.length - 1].x - from.x;
    if (Math.abs(dx) > 0.1) setFlip(dx < 0);
    x.value = withSequence(...xs);
    y.value = withSequence(...ys);
    setMoving(true);
    const done = setTimeout(() => setMoving(false), total);
    return () => clearTimeout(done);
  }, [target.x, target.y, target.road, offset.x, offset.y, tile]);

  useEffect(() => {
    if (!moving) {
      bob.value = withTiming(0, { duration: 120 });
      return;
    }
    bob.value = withRepeat(withSequence(withTiming(-px, { duration: 140 }), withTiming(0, { duration: 140 })), -1);
    const id = setInterval(() => setFrame((f) => (f === 1 ? 2 : 1)), 150);
    return () => clearInterval(id);
  }, [moving]);

  const pos = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }] }));
  const body = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  if (hidden) return null;

  return (
    <Animated.View style={[styles.wrap, { width: spriteW }, pos]} pointerEvents="box-none">
      {bubble ? (
        <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(160)} style={[styles.bubble, { bottom: spriteH + 6 }]}>
          <Text numberOfLines={1} style={styles.bubbleText}>
            {bubble}
          </Text>
          <View style={styles.bubbleTail} />
        </Animated.View>
      ) : null}
      {hearts ? <Hearts size={px} top={-px * 5} /> : null}
      <Pressable
        testID={`walker-${id}`}
        accessibilityRole="button"
        accessibilityLabel={`${name} avatar`}
        hitSlop={10}
        onPress={onPress}>
        <View style={[styles.shadow, { width: spriteW * 0.8, height: px * 2, left: spriteW * 0.1, top: spriteH - px }]} />
        <Animated.View style={body}>
          <Avatar palette={palette} accessory={accessory} size={px} frame={moving ? frame : 0} flip={flip} />
        </Animated.View>
        <View style={styles.tag}>
          {dot ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
          <Text style={styles.tagText} numberOfLines={1}>
            {name}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
});

function Hearts({ size, top }: { size: number; top: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1);
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [{ translateY: -t.value * size * 8 }, { scale: 0.8 + t.value * 0.4 }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', top, alignSelf: 'center' }, style]} pointerEvents="none">
      <Text style={{ fontSize: size * 5, color: C.coral, fontFamily: F.pixel }}>♥</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, top: 0, alignItems: 'center' },
  shadow: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 99 },
  tag: {
    marginTop: 1,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(43,29,20,0.78)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  tagText: { color: '#FFFFFF', fontFamily: F.pixel, fontSize: 9 },
  dot: { width: 5, height: 5, borderRadius: 1 },
  bubble: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: C.cream,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    maxWidth: 150,
    minWidth: 40,
  },
  bubbleText: { fontFamily: F.pixelMid, fontSize: 10, color: C.ink, textAlign: 'center' },
  bubbleTail: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 6,
    height: 6,
    backgroundColor: C.cream,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: C.ink,
    transform: [{ rotate: '45deg' }],
  },
});
