import { useAuthActions } from '@convex-dev/auth/react';
import { useMutation, useQuery } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, House, Pet } from '@/components/sprites';
import { Body, Chip, Label, Panel, PixelButton, PixelText } from '@/components/ui';
import { HOUSE_COLORS } from '@/lib/palettes';
import { Audience, Integration, useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';
import { friendById, HouseStyle, PetKind } from '@/lib/world';
import { api } from '../../../convex/_generated/api';

const INTEGRATIONS: { key: Integration; name: string; blurb: string }[] = [
  { key: 'calendar', name: 'Google Calendar', blurb: 'Shows friends when you’re busy, free, or in class.' },
  { key: 'location', name: 'Location', blurb: 'Moves your avatar around the village. Off means you stroll.' },
  { key: 'chats', name: 'Group chats', blurb: 'Spots plans so hangouts show up in the village.' },
  { key: 'music', name: 'Music', blurb: 'Shares what you’re listening to and your vibe.' },
  { key: 'photos', name: 'Photos', blurb: 'Lets you dress your house and pet from your camera roll.' },
];

const AUDIENCES: { key: Audience; label: string }[] = [
  { key: 'everyone', label: 'Everyone' },
  { key: 'close', label: 'Close friends' },
  { key: 'nobody', label: 'Only me' },
];

function ago(ms: number) {
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

export default function YouScreen() {
  const insets = useSafeAreaInsets();
  const me = friendById('you')!;
  const store = useStore();
  const { signOut } = useAuthActions();
  const moments = useQuery(api.moments.mine);
  const addMoment = useMutation(api.moments.add);
  const [text, setText] = useState('');

  async function post() {
    const value = text.trim();
    if (!value) return;
    setText('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addMoment({ text: value });
  }

  return (
    <ScrollView style={{ backgroundColor: C.paper }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 10, paddingBottom: 40 }}>
      <PixelText size={28}>You</PixelText>

      <Panel color={store.me.houseColor} style={{ marginTop: 12 }}>
        <View style={styles.home}>
          <House style={store.me.house} size={110} wall={store.me.houseColor} roof={me.roofColor} lit={false} />
          <Avatar palette={me.palette} size={6} />
          <Pet kind={store.me.pet} size={4} />
        </View>
      </Panel>

      <Label style={styles.section}>Moments</Label>
      <Panel>
        <View style={{ padding: 12, gap: 10 }}>
          <TextInput
            testID="moment-input"
            value={text}
            onChangeText={setText}
            placeholder="What are you up to?"
            placeholderTextColor={C.inkSoft}
            style={styles.input}
            maxLength={280}
            onSubmitEditing={post}
            returnKeyType="send"
          />
          <PixelButton testID="add-moment" label="Post moment" onPress={post} disabled={text.trim().length === 0} />
          {moments === undefined ? <Body style={{ color: C.inkSoft }}>Loading…</Body> : null}
          {moments?.length === 0 ? <Body style={{ color: C.inkSoft }}>No moments yet. Your first one shows up here.</Body> : null}
          {moments?.map((m) => (
            <Animated.View key={m._id} entering={FadeInDown} style={styles.moment}>
              <Text style={styles.momentText}>{m.text}</Text>
              <Text style={styles.momentTime}>{ago(m._creationTime)}</Text>
            </Animated.View>
          ))}
        </View>
      </Panel>

      <Label style={styles.section}>House</Label>
      <View style={styles.row}>
        {(['cottage', 'treehouse', 'loft', 'dome'] as HouseStyle[]).map((h) => (
          <Chip key={h} label={h} active={store.me.house === h} onPress={() => store.setMe({ house: h })} />
        ))}
      </View>
      <View style={[styles.row, { marginTop: 8 }]}>
        {HOUSE_COLORS.map((c) => (
          <Pressable
            key={c}
            accessibilityLabel={`House color ${c}`}
            onPress={() => store.setMe({ houseColor: c })}
            style={[styles.swatch, { backgroundColor: c, borderWidth: store.me.houseColor === c ? 4 : 2 }]}
          />
        ))}
      </View>
      <Label style={styles.section}>Pet</Label>
      <View style={styles.row}>
        {(['cat', 'dog', 'frog', 'none'] as PetKind[]).map((p) => (
          <Chip key={p} label={p} active={store.me.pet === p} onPress={() => store.setMe({ pet: p })} />
        ))}
      </View>

      <Label style={styles.section}>Connected life</Label>
      {INTEGRATIONS.map((i) => (
        <Panel key={i.key} style={{ marginBottom: 8 }}>
          <View style={{ padding: 12, gap: 8 }}>
            <View style={styles.intRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.intName}>{i.name}</Text>
                <Text style={styles.intBlurb}>{i.blurb}</Text>
              </View>
              <Switch
                value={store.integrations[i.key]}
                onValueChange={(v) => store.setIntegration(i.key, v)}
                trackColor={{ true: C.mint, false: '#D8C9A8' }}
              />
            </View>
            {store.integrations[i.key] ? (
              <View style={styles.row}>
                {AUDIENCES.map((a) => (
                  <Chip key={a.key} label={a.label} active={store.audience[i.key] === a.key} onPress={() => store.setAudience(i.key, a.key)} />
                ))}
              </View>
            ) : null}
            {i.key === 'calendar' && store.integrations.calendar ? (
              <View style={styles.row}>
                <Chip label="Busy / free only" active={store.calendarDetail === 'busy'} onPress={() => store.setCalendarDetail('busy')} color={C.sky} />
                <Chip label="Event titles" active={store.calendarDetail === 'titles'} onPress={() => store.setCalendarDetail('titles')} color={C.sky} />
              </View>
            ) : null}
          </View>
        </Panel>
      ))}

      <PixelButton testID="sign-out" label="Sign out" color={C.cream} textColor={C.ink} onPress={() => signOut()} style={{ marginTop: 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  home: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 12, padding: 16 },
  section: { marginTop: 20, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  swatch: { width: 34, height: 34, borderRadius: 4, borderColor: C.ink },
  input: {
    borderWidth: 3,
    borderColor: C.ink,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: C.ink,
  },
  moment: { borderTopWidth: 2, borderColor: C.paperDeep, paddingTop: 8 },
  momentText: { fontSize: 15, color: C.ink },
  momentTime: { fontFamily: F.pixelMid, fontSize: 11, color: C.inkSoft, marginTop: 2 },
  intRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  intName: { fontFamily: F.pixel, fontSize: 15, color: C.ink },
  intBlurb: { fontSize: 13, color: C.inkSoft },
});
