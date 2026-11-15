import { useMutation, useQuery } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, House, Pet } from '@/components/sprites';
import { Body, Chip, Label, Panel, PixelButton, PixelText } from '@/components/ui';
import { HOUSE_COLORS, PALETTES, ROOF_COLORS } from '@/lib/palettes';
import { C, F } from '@/lib/theme';
import type { HouseStyle, PetKind } from '@/lib/world';
import { api } from '../../../convex/_generated/api';

export default function NeighborsScreen() {
  const insets = useSafeAreaInsets();
  const villagers = useQuery(api.villagers.list);
  const add = useMutation(api.villagers.add);
  const [name, setName] = useState('');
  const [vibe, setVibe] = useState('');
  const [palette, setPalette] = useState(0);
  const [house, setHouse] = useState<HouseStyle>('cottage');
  const [pet, setPet] = useState<PetKind>('cat');
  const [saving, setSaving] = useState(false);

  async function moveIn() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await add({ name, vibe, palette, house, pet });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setName('');
      setVibe('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={{ backgroundColor: C.paper }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 10, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <PixelText size={28}>Neighbors</PixelText>
      <Body style={{ color: C.inkSoft }}>Invite someone to move into Newcomers’ Lane.</Body>

      <Panel style={{ marginTop: 14 }}>
        <View style={{ padding: 14, gap: 10 }}>
          <View style={styles.preview}>
            <House style={house} size={84} wall={HOUSE_COLORS[palette]} roof={ROOF_COLORS[palette]} lit={false} />
            <Avatar palette={PALETTES[palette]} size={5} />
            <Pet kind={pet} size={4} />
          </View>
          <TextInput testID="neighbor-name" value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={C.inkSoft} style={styles.input} maxLength={24} />
          <TextInput testID="neighbor-vibe" value={vibe} onChangeText={setVibe} placeholder="Vibe (optional)" placeholderTextColor={C.inkSoft} style={styles.input} maxLength={60} />
          <Label>Look</Label>
          <View style={styles.row}>
            {PALETTES.map((p, i) => (
              <Pressable key={i} accessibilityLabel={`Look ${i + 1}`} onPress={() => setPalette(i)} style={[styles.swatch, palette === i && { backgroundColor: C.gold }]}>
                <Avatar palette={p} size={2} />
              </Pressable>
            ))}
          </View>
          <Label>House</Label>
          <View style={styles.row}>
            {(['cottage', 'treehouse', 'loft', 'dome'] as HouseStyle[]).map((h) => (
              <Chip key={h} label={h} active={house === h} onPress={() => setHouse(h)} />
            ))}
          </View>
          <Label>Pet</Label>
          <View style={styles.row}>
            {(['cat', 'dog', 'frog', 'none'] as PetKind[]).map((p) => (
              <Chip key={p} label={p} active={pet === p} onPress={() => setPet(p)} />
            ))}
          </View>
          <PixelButton testID="add-neighbor" label={saving ? 'Moving in…' : 'Move in'} onPress={moveIn} disabled={saving || name.trim().length === 0} />
        </View>
      </Panel>

      <Label style={{ marginTop: 20, marginBottom: 8 }}>On the lane</Label>
      {villagers === undefined ? <Body style={{ color: C.inkSoft }}>Loading…</Body> : null}
      {villagers?.length === 0 ? <Body style={{ color: C.inkSoft }}>No newcomers yet. Lots are open.</Body> : null}
      {villagers?.map((v) => (
        <Animated.View key={v._id} entering={FadeInDown}>
          <Panel style={{ marginBottom: 8 }}>
            <View style={styles.card}>
              <Avatar palette={PALETTES[v.palette % PALETTES.length]} size={3} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{v.name}</Text>
                <Text style={styles.vibe}>{v.vibe || `Lives in a ${v.house}`}</Text>
              </View>
              <Pet kind={v.pet} size={3} />
            </View>
          </Panel>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  preview: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 10, paddingVertical: 6 },
  input: { borderWidth: 3, borderColor: C.ink, borderRadius: 4, backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: C.ink },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  swatch: { borderWidth: 2, borderColor: C.ink, borderRadius: 4, padding: 4, backgroundColor: C.cream },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 },
  name: { fontFamily: F.pixel, fontSize: 16, color: C.ink },
  vibe: { fontSize: 13, color: C.inkSoft },
});
