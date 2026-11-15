import { Tabs } from 'expo-router';

import { PixelTabBar } from '@/components/tab-bar';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <PixelTabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="chronicle" />
      <Tabs.Screen name="neighbors" />
      <Tabs.Screen name="you" />
    </Tabs>
  );
}
