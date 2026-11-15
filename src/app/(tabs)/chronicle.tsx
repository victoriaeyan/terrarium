import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, SignGlyph } from '@/components/sprites';
import { Bar, Body, Chip, Label, Panel, PixelText } from '@/components/ui';
import { C, F } from '@/lib/theme';
import { BADGES, CATEGORY_META, Category, FRIENDS, placeById } from '@/lib/world';

const SCALE = { day: 1 / 7, week: 1, month: 4.3 };

const BOARDS = [
  { title: 'Most locked in', unit: 'h', score: (k: Record<Category, number>) => k.study + k.work },
  { title: 'Most social', unit: 'h', score: (k: Record<Category, number>) => k.social },
  { title: 'Most active', unit: 'h', score: (k: Record<Category, number>) => k.exercise },
];

export default function ChronicleScreen() {
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<'day' | 'week' | 'month'>('week');
  const s = SCALE[range];
  const totals = (Object.keys(CATEGORY_META) as Category[]).map((k) => ({
    k,
    hours: Math.round(FRIENDS.reduce((sum, f) => sum + f.weekHours[k], 0) * s),
  }));
  const max = Math.max(...totals.map((x) => x.hours));
  const hangouts = Math.round(3 * s * (range === 'day' ? 2 : 1));

  return (
    <ScrollView style={{ backgroundColor: C.paper }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 10, paddingBottom: 40 }}>
      <PixelText size={28}>Chronicle</PixelText>
      <View style={styles.row}>
        <Chip label="Today" active={range === 'day'} onPress={() => setRange('day')} />
        <Chip label="This week" active={range === 'week'} onPress={() => setRange('week')} />
        <Chip label="This month" active={range === 'month'} onPress={() => setRange('month')} />
      </View>

      <Panel color={C.gold} style={{ marginTop: 14 }}>
        <View style={{ padding: 14 }}>
          <Text style={styles.big}>{hangouts}</Text>
          <Body>hangouts arranged through Terrarium {range === 'day' ? 'today' : range === 'week' ? 'this week' : 'this month'}. Maya and you lead the village.</Body>
        </View>
      </Panel>

      <Label style={styles.section}>The village grew</Label>
      {(['gym', 'library', 'climbing'] as const).map((id) => {
        const p = placeById(id)!;
        return (
          <Panel key={id} style={{ marginBottom: 8 }}>
            <View style={styles.grow}>
              <SignGlyph icon={p.sign} size={4} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{p.kind === 'construction' ? `${p.name} (under construction)` : p.name}</Text>
                <Text style={styles.small}>{p.why}</Text>
              </View>
            </View>
          </Panel>
        );
      })}

      <Label style={styles.section}>Where the crew’s time went</Label>
      <Panel>
        <View style={{ padding: 12, gap: 8 }}>
          {totals.map((t) => (
            <View key={t.k} style={styles.barRow}>
              <Text style={styles.barLabel}>{CATEGORY_META[t.k].label}</Text>
              <View style={{ flex: 1 }}>
                <Bar value={t.hours} max={max} color={CATEGORY_META[t.k].color} />
              </View>
              <Text style={styles.barValue}>{t.hours}h</Text>
            </View>
          ))}
        </View>
      </Panel>

      {BOARDS.map((b) => {
        const ranked = [...FRIENDS].sort((a, z) => b.score(z.weekHours) - b.score(a.weekHours)).slice(0, 3);
        return (
          <View key={b.title}>
            <Label style={styles.section}>{b.title}</Label>
            <View style={styles.podium}>
              {[ranked[1], ranked[0], ranked[2]].map((f, i) => (
                <View key={f.id} style={styles.podiumCol}>
                  <Avatar palette={f.palette} accessory={f.accessory} size={3} />
                  <View style={[styles.step, { height: i === 1 ? 54 : i === 0 ? 38 : 26, backgroundColor: i === 1 ? C.gold : C.cream }]}>
                    <Text style={styles.stepText}>{f.name}</Text>
                    <Text style={styles.small}>{Math.round(b.score(f.weekHours) * s)}{b.unit}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      })}

      <Label style={styles.section}>Badges earned</Label>
      <View style={styles.row}>
        {FRIENDS.flatMap((f) => f.badges.map((b) => ({ f, b }))).map(({ f, b }) => (
          <View key={`${f.id}-${b}`} style={[styles.badge, { backgroundColor: BADGES[b].color }]}>
            <Text style={styles.badgeText}>
              {BADGES[b].label} · {f.name}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  section: { marginTop: 20, marginBottom: 8 },
  big: { fontFamily: F.pixel, fontSize: 44, color: C.ink },
  grow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 },
  name: { fontFamily: F.pixel, fontSize: 15, color: C.ink },
  small: { fontSize: 12, color: C.inkSoft },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { width: 54, fontFamily: F.pixel, fontSize: 12, color: C.ink },
  barValue: { width: 40, textAlign: 'right', fontFamily: F.pixel, fontSize: 12, color: C.ink },
  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  podiumCol: { flex: 1, alignItems: 'center', gap: 4 },
  step: { alignSelf: 'stretch', borderWidth: 3, borderColor: C.ink, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontFamily: F.pixel, fontSize: 13, color: C.ink },
  badge: { borderWidth: 2, borderColor: C.ink, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontFamily: F.pixel, fontSize: 12, color: '#FFFFFF' },
});
