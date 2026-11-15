import * as Haptics from 'expo-haptics';
import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PixelArt } from '@/components/pixel';
import { C, F } from '@/lib/theme';

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONS: Record<string, { label: string; rows: string[] }> = {
  index: { label: 'Village', rows: ['...kk...', '..kkkk..', '.kkkkkk.', 'kkkkkkkk', '.k....k.', '.k.kk.k.', '.k.kk.k.', '.kkkkkk.'] },
  chronicle: { label: 'Chronicle', rows: ['kkkkkkk.', 'k.....kk', 'k.kkk.k.', 'k.....k.', 'k.kkk.k.', 'k.....k.', 'kk.....k', '.kkkkkkk'] },
  neighbors: { label: 'Neighbors', rows: ['.kk..kk.', 'kkkkkkkk', '.kk..kk.', '........', 'kkk..kkk', 'kkkkkkkk', 'kkkkkkkk', '........'] },
  you: { label: 'You', rows: ['..kkkk..', '.kkkkkk.', '.k.kk.k.', '.kkkkkk.', '..kkkk..', '........', '.kkkkkk.', 'kkkkkkkk'] },
};

export function PixelTabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const meta = ICONS[route.name] ?? { label: route.name, rows: ['k'] };
        return (
          <Pressable
            key={route.key}
            testID={`tab-${route.name}`}
            accessibilityRole="tab"
            accessibilityLabel={meta.label}
            accessibilityState={{ selected: focused }}
            onPress={() => {
              Haptics.selectionAsync();
              if (!focused) navigateToTab(route.key);
            }}
            style={styles.item}>
            <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
              <PixelArt rows={meta.rows} map={{ k: focused ? C.ink : C.inkSoft }} size={3} />
            </View>
            <Text style={[styles.label, { color: focused ? C.ink : C.inkSoft }]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: C.cream,
    borderTopWidth: 3,
    borderColor: C.ink,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  iconBox: { padding: 6, borderRadius: 4, borderWidth: 2, borderColor: 'transparent' },
  iconBoxActive: { backgroundColor: C.gold, borderColor: C.ink },
  label: { fontFamily: F.pixel, fontSize: 11, letterSpacing: 0.4 },
});
