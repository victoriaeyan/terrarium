import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PixelArt } from '@/components/pixel';
import { Avatar, Gift, GIFTS, GiftKind, House, Pet, SignGlyph } from '@/components/sprites';
import { Bar, Body, Chip, Label, Panel, PixelButton, PixelText } from '@/components/ui';
import { formatHour, freeWindows, segmentAt, statusFor, whereLabel } from '@/lib/sim';
import { useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';
import { BADGES, CATEGORY_META, Category, Friend, friendById, placeById } from '@/lib/world';

const TONE_COLOR = { free: C.mint, busy: C.coral, meeting: C.coral, class: C.plum, asleep: '#A0A0A0' };

function useTypewriter(text: string) {
  const [state, setState] = useState({ text, n: 0 });
  if (state.text !== text) setState({ text, n: 0 });
  useEffect(() => {
    const id = setInterval(() => setState((s) => (s.n >= s.text.length ? s : { ...s, n: s.n + 3 })), 16);
    return () => clearInterval(id);
  }, [text]);
  return text.slice(0, state.text === text ? state.n : 0);
}

export default function FriendScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const friend = friendById(id ?? '')!;
  const insets = useSafeAreaInsets();
  const { t, gifts, giveGift, hangouts, proposeHangout } = useStore();
  const [range, setRange] = useState<'today' | 'week'>('today');
  const [panel, setPanel] = useState<'none' | 'gift' | 'hang'>('none');
  const [toast, setToast] = useState<string | null>(null);
  const summary = useTypewriter(range === 'today' ? friend.today : friend.week);
  const status = statusFor(friend, t);
  const seg = segmentAt(friend, t);
  const isMe = friend.id === 'you';
  const me = friendById('you')!;
  const windows = freeWindows(friend, me, t);
  const myHangouts = hangouts.filter((h) => h.friendId === friend.id);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  function act(kind: 'call' | 'facetime' | 'sms') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const scheme = kind === 'call' ? 'tel:' : kind === 'facetime' ? 'facetime:' : 'sms:';
    Linking.openURL(`${scheme}${friend.phone}`).catch(() => setToast(`Can't open ${kind} on this device`));
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={[styles.hero, { backgroundColor: friend.houseColor }]}>
          <View style={styles.heroGround} />
          <Pressable testID="close-profile" accessibilityLabel="Close profile" onPress={() => router.back()} style={styles.close}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <View style={styles.heroHouse}>
            <House style={friend.house} size={120} wall={friend.houseColor} roof={friend.roofColor} lit={false} />
          </View>
          <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.heroAvatar}>
            <Avatar palette={friend.palette} accessory={friend.accessory} size={8} />
          </Animated.View>
          <View style={styles.heroPet}>
            <Pet kind={friend.pet} size={5} />
          </View>
          <View style={styles.heroGifts}>
            {(gifts[friend.id] ?? []).map((g, i) => (
              <Animated.View key={`${g}-${i}`} entering={ZoomIn}>
                <Gift kind={g} size={4} />
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <PixelText size={30}>{friend.name}</PixelText>
            <Text style={styles.pron}>{friend.pronouns}</Text>
          </View>
          <Text style={styles.major}>{friend.major}</Text>

          <View style={styles.statusRow}>
            <View style={[styles.status, { backgroundColor: TONE_COLOR[status.tone] }]}>
              <Text style={styles.statusText} numberOfLines={1}>
                {status.label}
              </Text>
            </View>
            <View style={[styles.status, { backgroundColor: C.cream }]}>
              <Text style={styles.statusText} numberOfLines={1}>
                {whereLabel(friend, t)}
              </Text>
            </View>
          </View>

          <Panel color="#211A3A" style={{ marginTop: 14 }}>
            <View style={styles.music}>
              <Equalizer />
              <View style={{ flex: 1 }}>
                <Text style={styles.musicLabel}>NOW PLAYING · {friend.nowPlaying.mood.toUpperCase()}</Text>
                <Text style={styles.musicTrack} numberOfLines={1}>
                  {friend.nowPlaying.track}
                </Text>
                <Text style={styles.musicArtist}>{friend.nowPlaying.artist}</Text>
              </View>
            </View>
          </Panel>

          {!isMe ? (
            <View style={styles.actions}>
              <ActionButton label="Call" glyph={['.kk....', 'kkk....', 'kk.....', 'kk.....', '.kk..kk', '..kkkkk', '....kk.']} onPress={() => act('call')} />
              <ActionButton label="FaceTime" glyph={['.......', 'kkkkk..', 'kkkkk.k', 'kkkkkkk', 'kkkkk.k', 'kkkkk..', '.......']} onPress={() => act('facetime')} />
              <ActionButton label="Text" glyph={['kkkkkkk', 'k.....k', 'k.k.k.k', 'k.....k', 'kkkkkkk', '.kk....', '.k.....']} onPress={() => act('sms')} />
              <ActionButton label="Gift" active={panel === 'gift'} glyph={['.k...k.', '..k.k..', 'kkkkkkk', 'k..k..k', 'kkkkkkk', 'k..k..k', 'kkkkkkk']} onPress={() => setPanel(panel === 'gift' ? 'none' : 'gift')} testID="action-gift" />
              <ActionButton label="Hang" active={panel === 'hang'} glyph={['kkkkkkk', 'k.k.k.k', 'kkkkkkk', 'k.....k', 'k.kk..k', 'k.kk..k', 'kkkkkkk']} onPress={() => setPanel(panel === 'hang' ? 'none' : 'hang')} testID="action-hang" />
            </View>
          ) : null}

          {panel === 'gift' ? (
            <Animated.View entering={FadeInDown}>
              <Panel color={C.cream} style={{ marginTop: 10 }}>
                <View style={{ padding: 12, gap: 10 }}>
                  <Label>Make {friend.name} something</Label>
                  <View style={styles.giftGrid}>
                    {(Object.keys(GIFTS) as GiftKind[]).map((g) => (
                      <Pressable
                        key={g}
                        testID={`gift-${g}`}
                        accessibilityLabel={GIFTS[g].label}
                        onPress={() => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          giveGift(friend.id, g);
                          setToast(`${GIFTS[g].label} sent! It's on ${friend.name}'s lawn now.`);
                          setPanel('none');
                        }}
                        style={styles.giftCell}>
                        <Gift kind={g} size={6} />
                        <Text style={styles.giftLabel}>{GIFTS[g].label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </Panel>
            </Animated.View>
          ) : null}

          {panel === 'hang' ? (
            <Animated.View entering={FadeInDown}>
              <Panel color={C.cream} style={{ marginTop: 10 }}>
                <View style={{ padding: 12, gap: 10 }}>
                  <Label>You’re both free</Label>
                  {windows.length === 0 ? <Body>No overlap left today. Tomorrow looks better.</Body> : null}
                  {windows.map((w) => {
                    const booked = myHangouts.some((h) => h.from === w.from);
                    return (
                      <View key={w.from} style={styles.window}>
                        <Text style={styles.windowText}>
                          {formatHour(w.from)} – {formatHour(w.to)}
                        </Text>
                        <PixelButton
                          small
                          label={booked ? 'Proposed ✓' : 'Propose'}
                          color={booked ? C.mint : C.coral}
                          disabled={booked}
                          onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            proposeHangout({ friendId: friend.id, from: w.from, to: w.to, place: 'Bean There' });
                            setToast(`Sent ${friend.name} a hangout for ${formatHour(w.from)}`);
                          }}
                        />
                      </View>
                    );
                  })}
                </View>
              </Panel>
            </Animated.View>
          ) : null}

          {friend.withYou ? (
            <Panel color={C.gold} style={{ marginTop: 14 }}>
              <Text style={styles.withYou}>{friend.withYou}</Text>
            </Panel>
          ) : null}

          <Panel style={{ marginTop: 14 }}>
            <View style={{ padding: 14, gap: 10 }}>
              <View style={styles.aiHead}>
                <PixelArt rows={['..k..', '.kkk.', 'kkkkk', '.kkk.', '..k..']} map={{ k: C.plum }} size={3} />
                <Label style={{ flex: 1 }}>Terra’s take</Label>
                <Chip label="Today" active={range === 'today'} onPress={() => setRange('today')} />
                <Chip label="Week" active={range === 'week'} onPress={() => setRange('week')} />
              </View>
              <Text style={styles.summary}>{summary}</Text>
              <View style={styles.sources}>
                {['Calendar', 'Location', 'Group chat', 'Music'].map((s) => (
                  <Text key={s} style={styles.source}>
                    {s}
                  </Text>
                ))}
              </View>
            </View>
          </Panel>

          <Label style={styles.section}>Their day</Label>
          <DayStrip friend={friend} t={t} />
          <Text style={styles.note}>
            Now: {seg.doing}
            {friend.share.calendar === 'busy' ? ' · calendar shared as busy/free only' : ''}
          </Text>

          <Label style={styles.section}>What changed</Label>
          {friend.changes.map((c, i) => (
            <Animated.View key={c} entering={FadeIn.delay(i * 80)} style={styles.change}>
              <View style={styles.bullet} />
              <Body style={{ flex: 1 }}>{c}</Body>
            </Animated.View>
          ))}

          <Label style={styles.section}>Where the week went</Label>
          <Panel>
            <View style={{ padding: 12, gap: 8 }}>
              {(Object.keys(friend.weekHours) as Category[])
                .filter((k) => friend.weekHours[k] > 0)
                .sort((a, b) => friend.weekHours[b] - friend.weekHours[a])
                .map((k) => (
                  <View key={k} style={styles.hoursRow}>
                    <Text style={styles.hoursLabel}>{CATEGORY_META[k].label}</Text>
                    <View style={{ flex: 1 }}>
                      <Bar value={friend.weekHours[k]} max={42} color={CATEGORY_META[k].color} />
                    </View>
                    <Text style={styles.hoursValue}>{friend.weekHours[k]}h</Text>
                  </View>
                ))}
            </View>
          </Panel>

          <Label style={styles.section}>Spots</Label>
          <View style={styles.spots}>
            {friend.topPlaces.map((tp) => {
              const p = placeById(tp.place);
              if (!p) return null;
              return (
                <Panel key={tp.place} style={{ flex: 1 }}>
                  <View style={styles.spot}>
                    <SignGlyph icon={p.sign} size={4} />
                    <Text style={styles.spotName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={styles.spotVisits}>{tp.visits}× this week</Text>
                  </View>
                </Panel>
              );
            })}
          </View>

          <Label style={styles.section}>Badges</Label>
          <View style={styles.badges}>
            {friend.badges.map((b) => (
              <View key={b} style={[styles.badge, { backgroundColor: BADGES[b].color }]}>
                <Text style={styles.badgeText}>{BADGES[b].label}</Text>
                <Text style={styles.badgeBlurb}>{BADGES[b].blurb}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {toast ? (
        <Animated.View entering={FadeInDown} style={[styles.toast, { bottom: insets.bottom + 20 }]}>
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

function ActionButton({
  label,
  glyph,
  onPress,
  active,
  testID,
}: {
  label: string;
  glyph: string[];
  onPress: () => void;
  active?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [styles.action, active && { backgroundColor: C.gold }, pressed && { transform: [{ translateY: 2 }] }]}>
      <PixelArt rows={glyph} map={{ k: C.ink }} size={3} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

function Equalizer() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 180);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={styles.eq}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.eqBar, { height: 6 + ((tick * (i + 2) * 7) % 22) }]} />
      ))}
    </View>
  );
}

function DayStrip({ friend, t }: { friend: Friend; t: number }) {
  return (
    <Panel>
      <View style={styles.strip}>
        {friend.schedule.map((s, i) => {
          const flex = s.to - s.from;
          const color = s.at === 'sleep' ? '#3B3466' : CATEGORY_META[s.category].color;
          const title = s.cal ? (friend.share.calendar === 'busy' ? 'Busy' : s.cal.title) : null;
          return (
            <View key={i} style={{ flex, backgroundColor: color, justifyContent: 'center', overflow: 'hidden' }}>
              {title && flex >= 2 ? (
                <Text style={styles.stripText} numberOfLines={1}>
                  {title}
                </Text>
              ) : null}
            </View>
          );
        })}
        <View style={[styles.nowLine, { left: `${(t / 24) * 100}%` }]} />
      </View>
      <View style={styles.stripMarks}>
        {['12a', '6a', '12p', '6p', '12a'].map((m, i) => (
          <Text key={i} style={styles.stripMark}>
            {m}
          </Text>
        ))}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  hero: { height: 230, borderBottomWidth: 3, borderColor: C.ink, overflow: 'hidden' },
  heroGround: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 56, backgroundColor: C.grass, borderTopWidth: 3, borderColor: C.ink },
  close: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 3,
    width: 38,
    height: 38,
    backgroundColor: C.cream,
    borderWidth: 3,
    borderColor: C.ink,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontFamily: F.pixel, fontSize: 16, color: C.ink },
  heroHouse: { position: 'absolute', left: 24, bottom: 40 },
  heroAvatar: { position: 'absolute', left: 170, bottom: 30 },
  heroPet: { position: 'absolute', left: 250, bottom: 34 },
  heroGifts: { position: 'absolute', right: 20, bottom: 20, flexDirection: 'row', gap: 6 },
  body: { padding: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  pron: { fontFamily: F.pixelMid, color: C.inkSoft, fontSize: 14 },
  major: { color: C.inkSoft, fontSize: 15, marginTop: 2 },
  statusRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  status: { borderWidth: 2, borderColor: C.ink, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, maxWidth: '100%' },
  statusText: { fontFamily: F.pixel, fontSize: 13, color: C.ink },
  music: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  musicLabel: { fontFamily: F.pixel, fontSize: 10, color: '#B9AEFF', letterSpacing: 1 },
  musicTrack: { fontFamily: F.pixel, fontSize: 17, color: '#FFFFFF', marginTop: 2 },
  musicArtist: { color: '#D8D0FF', fontSize: 13 },
  eq: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 30, width: 30 },
  eqBar: { width: 5, backgroundColor: C.mint },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, gap: 6 },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingVertical: 9,
    backgroundColor: C.cream,
    borderWidth: 3,
    borderColor: C.ink,
    borderRadius: 4,
  },
  actionText: { fontFamily: F.pixel, fontSize: 11, color: C.ink },
  giftGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  giftCell: {
    width: '31%',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    backgroundColor: C.paper,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: 4,
  },
  giftLabel: { fontFamily: F.pixelMid, fontSize: 11, color: C.ink },
  window: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  windowText: { fontFamily: F.pixel, fontSize: 16, color: C.ink },
  withYou: { padding: 12, fontFamily: F.pixel, fontSize: 15, color: C.ink, lineHeight: 20 },
  aiHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summary: { fontSize: 16, lineHeight: 23, color: C.ink, minHeight: 92 },
  sources: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  source: {
    fontFamily: F.pixelMid,
    fontSize: 10,
    color: C.inkSoft,
    borderWidth: 1.5,
    borderColor: C.inkSoft,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  section: { marginTop: 20, marginBottom: 8 },
  strip: { flexDirection: 'row', height: 34 },
  stripText: { fontFamily: F.pixel, fontSize: 9, color: '#FFFFFF', paddingHorizontal: 3 },
  nowLine: { position: 'absolute', top: -2, bottom: -2, width: 3, backgroundColor: C.ink },
  stripMarks: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, paddingVertical: 3, borderTopWidth: 2, borderColor: C.ink },
  stripMark: { fontFamily: F.pixelMid, fontSize: 10, color: C.inkSoft },
  note: { fontSize: 13, color: C.inkSoft, marginTop: 4 },
  change: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  bullet: { width: 8, height: 8, backgroundColor: C.coral, borderWidth: 2, borderColor: C.ink },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hoursLabel: { width: 54, fontFamily: F.pixel, fontSize: 12, color: C.ink },
  hoursValue: { width: 34, textAlign: 'right', fontFamily: F.pixel, fontSize: 12, color: C.ink },
  spots: { flexDirection: 'row', gap: 6 },
  spot: { alignItems: 'center', padding: 10, gap: 4 },
  spotName: { fontFamily: F.pixel, fontSize: 11, color: C.ink },
  spotVisits: { fontSize: 11, color: C.inkSoft },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { borderWidth: 3, borderColor: C.ink, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6, width: '48%' },
  badgeText: { fontFamily: F.pixel, fontSize: 14, color: '#FFFFFF' },
  badgeBlurb: { fontSize: 11, color: '#FFFFFF', opacity: 0.9 },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: C.ink,
    borderRadius: 4,
    padding: 12,
  },
  toastText: { fontFamily: F.pixel, color: C.cream, fontSize: 14, textAlign: 'center' },
});
