import { useQuery } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { ComponentRef, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutUp, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { PixelArt } from '@/components/pixel';
import { Avatar, SignGlyph } from '@/components/sprites';
import { TimeDial } from '@/components/time-dial';
import { Body, Label, Panel, PixelButton, PixelText } from '@/components/ui';
import { Neighbor, VillageMap } from '@/components/village-map';
import { PALETTES } from '@/lib/palettes';
import { buzzAt, daylight, formatClock, presenceAt } from '@/lib/sim';
import { useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';
import { FRIENDS, Place } from '@/lib/world';
import { api } from '../../../convex/_generated/api';

const BUZZ_COLORS = { together: C.coral, heading: C.sky, group: C.gold, music: C.mint };

export default function VillageScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { t, live, gifts, me, integrations } = useStore();
  const neighbors = (useQuery(api.villagers.list) ?? []) as Neighbor[];
  const [place, setPlace] = useState<Place | null>(null);
  const [neighbor, setNeighbor] = useState<Neighbor | null>(null);
  const [featured, setFeatured] = useState<string | null>(null);
  const [buzzIndex, setBuzzIndex] = useState(0);
  const mapRef = useRef<ComponentRef<typeof View>>(null);

  const buzz = buzzAt(t);
  const presence = presenceAt(t);
  const awake = presence.filter((p) => p.seg.at !== 'sleep');
  const together = presence.filter((p) => p.together.length > 0).length;
  const night = daylight(t) > 0.5;

  useEffect(() => {
    const id = setInterval(() => {
      setBuzzIndex((i) => i + 1);
      const candidates = presenceAt(t).filter((p) => p.seg.at !== 'sleep' && p.friend.id !== 'you');
      if (candidates.length > 0) setFeatured(candidates[Math.floor(Math.random() * candidates.length)].friend.id);
    }, 4200);
    return () => clearInterval(id);
  }, [t]);

  const current = buzz[buzzIndex % buzz.length];

  async function share() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const uri = await captureRef(mapRef, { format: 'png', quality: 0.95 });
    await Sharing.shareAsync(uri, { dialogTitle: 'Share your village', mimeType: 'image/png' });
  }

  return (
    <View style={[styles.screen, { backgroundColor: night ? '#2A2350' : C.sky }]}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <View style={{ flex: 1 }}>
          <PixelText size={26} style={{ color: night ? C.cream : C.ink }}>
            terrarium
          </PixelText>
          <Text style={[styles.sub, { color: night ? '#D8D0FF' : C.inkSoft }]}>Maple Hall Crew · {awake.length} awake · {together} together</Text>
        </View>
        <View style={styles.clock}>
          {live ? <View style={styles.liveDot} /> : null}
          <Text style={styles.clockText}>{formatClock(t)}</Text>
        </View>
        <Pressable testID="share-village" accessibilityLabel="Share village screenshot" onPress={share} style={styles.iconBtn}>
          <PixelArt
            rows={['...k...', '..kkk..', '.k.k.k.', '...k...', 'k..k..k', 'k.....k', 'kkkkkkk']}
            map={{ k: C.ink }}
            size={3}
          />
        </Pressable>
      </View>

      <View style={styles.buzzWrap}>
        <Animated.View key={current.id + buzzIndex} entering={FadeInDown.duration(280)} exiting={FadeOutUp.duration(200)} style={styles.buzz}>
          <View style={[styles.buzzDot, { backgroundColor: BUZZ_COLORS[current.kind] }]} />
          <Text style={styles.buzzText} numberOfLines={1}>
            {current.text}
          </Text>
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View ref={mapRef} collapsable={false} style={styles.mapFrame}>
          <VillageMap
            width={width - 6}
            t={t}
            gifts={gifts}
            neighbors={neighbors}
            featured={featured}
            myHouse={me.house}
            myHouseColor={me.houseColor}
            myPet={me.pet}
            hideMe={!integrations.location}
            onPressFriend={(id) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: '/friend/[id]', params: { id } });
            }}
            onPressPlace={(p) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setNeighbor(null);
              setPlace(p);
            }}
            onPressNeighbor={(n) => {
              setPlace(null);
              setNeighbor(n);
            }}
            onPressEmptyLot={() => router.navigate('/neighbors')}
          />
        </View>
      </ScrollView>

      <View style={styles.dock} pointerEvents="box-none">
        {place ? (
          <Animated.View entering={SlideInDown.springify().damping(18)} exiting={SlideOutDown.duration(180)}>
            <PlaceCard place={place} t={t} onClose={() => setPlace(null)} />
          </Animated.View>
        ) : neighbor ? (
          <Animated.View entering={SlideInDown.springify().damping(18)} exiting={SlideOutDown.duration(180)}>
            <Panel>
              <View style={styles.cardRow}>
                <Avatar palette={PALETTES[neighbor.palette % PALETTES.length]} size={4} />
                <View style={{ flex: 1 }}>
                  <PixelText size={18}>{neighbor.name}</PixelText>
                  <Body style={{ color: C.inkSoft }}>{neighbor.vibe || 'Just moved in. Say hi!'}</Body>
                </View>
                <PixelButton small label="Close" color={C.cream} textColor={C.ink} onPress={() => setNeighbor(null)} />
              </View>
            </Panel>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp}>
            <Panel>
              <View style={{ padding: 10 }}>
                <TimeDial />
              </View>
            </Panel>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

function PlaceCard({ place, t, onClose }: { place: Place; t: number; onClose: () => void }) {
  const here = presenceAt(t).filter((p) => p.seg.at === place.id);
  const regulars = FRIENDS.filter((f) => f.topPlaces.some((tp) => tp.place === place.id));
  return (
    <Panel>
      <View style={{ padding: 12, gap: 8 }}>
        <View style={styles.cardRow}>
          <View style={styles.glyph}>
            <SignGlyph icon={place.sign} size={4} />
          </View>
          <View style={{ flex: 1 }}>
            <PixelText size={18}>{place.name}</PixelText>
            <Text style={styles.sub}>{place.kind === 'construction' ? 'Under construction' : here.length > 0 ? `${here.length} here now` : 'Quiet right now'}</Text>
          </View>
          <PixelButton small label="Close" color={C.cream} textColor={C.ink} onPress={onClose} />
        </View>
        <Body>{place.why}</Body>
        {here.length > 0 ? (
          <View style={styles.faces}>
            {here.map((p) => (
              <Pressable key={p.friend.id} onPress={() => router.push({ pathname: '/friend/[id]', params: { id: p.friend.id } })} style={styles.face}>
                <Avatar palette={p.friend.palette} accessory={p.friend.accessory} size={3} />
                <Text style={styles.faceText}>{p.friend.name}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {regulars.length > 0 ? <Label>Regulars: {regulars.map((r) => r.name).join(', ')}</Label> : null}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 6, gap: 8 },
  sub: { fontFamily: F.pixelMid, fontSize: 12, color: C.inkSoft },
  clock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.cream,
    borderWidth: 3,
    borderColor: C.ink,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clockText: { fontFamily: F.pixel, fontSize: 14, color: C.ink },
  liveDot: { width: 7, height: 7, backgroundColor: C.coral, borderRadius: 1 },
  iconBtn: {
    backgroundColor: C.cream,
    borderWidth: 3,
    borderColor: C.ink,
    borderRadius: 4,
    padding: 6,
  },
  buzzWrap: { height: 40, paddingHorizontal: 12, marginBottom: 6 },
  buzz: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.cream,
    borderWidth: 3,
    borderColor: C.ink,
    borderRadius: 4,
    paddingHorizontal: 10,
    height: 36,
  },
  buzzDot: { width: 10, height: 10, borderWidth: 2, borderColor: C.ink },
  buzzText: { flex: 1, fontFamily: F.pixelMid, fontSize: 13, color: C.ink },
  mapFrame: { marginHorizontal: 3, borderWidth: 3, borderColor: C.ink, borderRadius: 4, overflow: 'hidden' },
  dock: { position: 'absolute', left: 10, right: 6, bottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 2 },
  glyph: { backgroundColor: C.paper, borderWidth: 2, borderColor: C.ink, padding: 4, borderRadius: 3 },
  faces: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  face: { alignItems: 'center', gap: 2 },
  faceText: { fontFamily: F.pixel, fontSize: 10, color: C.ink },
});
