import * as Haptics from 'expo-haptics';
import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { C, F } from '@/lib/theme';

export function Panel({
  children,
  style,
  color = C.cream,
  depth = 4,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  color?: string;
  depth?: number;
}) {
  return (
    <View style={[{ marginBottom: depth, marginRight: depth }, style]}>
      <View style={[StyleSheet.absoluteFill, styles.shadow, { top: depth, left: depth, right: -depth, bottom: -depth }]} />
      <View style={[styles.panel, { backgroundColor: color }]}>{children}</View>
    </View>
  );
}

export function PixelButton({
  label,
  onPress,
  color = C.coral,
  textColor = '#FFFFFF',
  small = false,
  icon,
  disabled,
  testID,
  style,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  small?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const press = useSharedValue(0);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: press.value * 3 }, { translateX: press.value * 3 }] }));
  const depth = small ? 3 : 4;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPressIn={() => {
        press.value = withSpring(1, { duration: 120 });
        Haptics.selectionAsync();
      }}
      onPressOut={() => {
        press.value = withSpring(0, { duration: 200 });
      }}
      onPress={onPress}
      style={[{ opacity: disabled ? 0.5 : 1, paddingRight: depth, paddingBottom: depth }, style]}>
      <View style={[styles.shadow, { position: 'absolute', top: depth, left: depth, right: 0, bottom: 0 }]} />
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: color, paddingVertical: small ? 6 : 11, paddingHorizontal: small ? 10 : 16 },
          anim,
        ]}>
        {icon}
        <Text style={[styles.buttonText, { color: textColor, fontSize: small ? 13 : 16 }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
  color = C.gold,
  testID,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  color?: string;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={[styles.chip, { backgroundColor: active ? color : C.cream, transform: [{ translateY: active ? 0 : -1 }] }]}>
      <Text style={[styles.chipText, { color: C.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function PixelText({ children, style, size = 18 }: { children: ReactNode; style?: StyleProp<TextStyle>; size?: number }) {
  return <Text style={[{ fontFamily: F.pixel, fontSize: size, color: C.ink, letterSpacing: 0.3 }, style]}>{children}</Text>;
}

export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

export function Body({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const segments = 12;
  const filled = Math.round((value / max) * segments);
  return (
    <View style={styles.bar}>
      {Array.from({ length: segments }, (_, i) => (
        <View key={i} style={[styles.barCell, { backgroundColor: i < filled ? color : 'transparent' }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { backgroundColor: C.ink, borderRadius: 4 },
  panel: { borderWidth: 3, borderColor: C.ink, borderRadius: 4, overflow: 'hidden' },
  button: {
    borderWidth: 3,
    borderColor: C.ink,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: { fontFamily: F.pixel, letterSpacing: 0.5 },
  chip: { borderWidth: 2, borderColor: C.ink, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 10 },
  chipText: { fontFamily: F.pixelMid, fontSize: 14 },
  label: { fontFamily: F.pixel, fontSize: 12, color: C.inkSoft, letterSpacing: 1.2, textTransform: 'uppercase' },
  body: { fontSize: 15, lineHeight: 21, color: C.ink },
  bar: { flexDirection: 'row', gap: 2, borderWidth: 2, borderColor: C.ink, padding: 2, borderRadius: 3, backgroundColor: C.cream },
  barCell: { flex: 1, height: 8 },
});
