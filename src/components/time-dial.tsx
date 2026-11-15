import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatClock } from '@/lib/sim';
import { useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';

const MARKS = [0, 6, 12, 18, 24];

export function TimeDial() {
  const { t, setT, live, playing, togglePlay, goLive } = useStore();
  const [width, setWidth] = useState(1);
  const [lastHour, setLastHour] = useState(-1);

  function scrub(xPos: number) {
    const ratio = Math.min(1, Math.max(0, xPos / width));
    const snapped = Math.round(Math.min(23.99, ratio * 24) * 4) / 4;
    if (Math.floor(snapped) !== lastHour) {
      setLastHour(Math.floor(snapped));
      Haptics.selectionAsync();
    }
    setT(snapped);
  }

  const knobLeft = (t / 24) * width;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          testID="timelapse"
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause timelapse' : 'Play timelapse'}
          onPress={togglePlay}
          style={[styles.play, playing && { backgroundColor: C.gold }]}>
          <Text style={styles.playText}>{playing ? 'II' : '▶'}</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <View
            style={styles.track}
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
            onResponderGrant={(e) => scrub(e.nativeEvent.locationX)}
            onResponderMove={(e) => scrub(e.nativeEvent.locationX)}>
            <View pointerEvents="none" style={[styles.sky, { backgroundColor: '#20195A', width: '25%' }]} />
            <View pointerEvents="none" style={[styles.sky, { left: '25%', width: '50%', backgroundColor: C.sky }]} />
            <View pointerEvents="none" style={[styles.sky, { left: '75%', width: '25%', backgroundColor: '#5B4BD6' }]} />
            <View pointerEvents="none" style={[styles.knob, { left: knobLeft - 9 }]} />
          </View>
          <View style={styles.marks} pointerEvents="none">
            {MARKS.map((m) => (
              <Text key={m} style={styles.mark}>
                {m === 0 || m === 24 ? '12a' : m === 12 ? '12p' : m < 12 ? `${m}a` : `${m - 12}p`}
              </Text>
            ))}
          </View>
        </View>
        <Pressable
          testID="go-live"
          accessibilityRole="button"
          accessibilityLabel="Jump to live"
          onPress={goLive}
          style={[styles.live, live && { backgroundColor: C.coral }]}>
          <View style={[styles.liveDot, { backgroundColor: live ? '#FFFFFF' : C.coral }]} />
          <Text style={[styles.liveText, { color: live ? '#FFFFFF' : C.ink }]}>LIVE</Text>
        </Pressable>
      </View>
      {!live ? <Text style={styles.hint}>{playing ? 'Timelapse' : 'Scrubbing'} · {formatClock(t)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  play: {
    width: 40,
    height: 36,
    borderWidth: 3,
    borderColor: C.ink,
    borderRadius: 4,
    backgroundColor: C.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playText: { fontFamily: F.pixel, fontSize: 16, color: C.ink },
  track: {
    height: 22,
    borderWidth: 3,
    borderColor: C.ink,
    borderRadius: 4,
    overflow: 'visible',
    backgroundColor: C.sky,
  },
  sky: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  knob: {
    position: 'absolute',
    top: -6,
    width: 18,
    height: 28,
    backgroundColor: C.gold,
    borderWidth: 3,
    borderColor: C.ink,
    borderRadius: 3,
  },
  marks: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  mark: { fontFamily: F.pixelMid, fontSize: 10, color: C.inkSoft },
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 3,
    borderColor: C.ink,
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 36,
    backgroundColor: C.cream,
  },
  liveDot: { width: 7, height: 7, borderRadius: 1 },
  liveText: { fontFamily: F.pixel, fontSize: 13 },
  hint: { fontFamily: F.pixelMid, fontSize: 11, color: C.inkSoft, textAlign: 'center' },
});
