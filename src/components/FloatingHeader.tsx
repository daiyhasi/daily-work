import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { palette } from "../theme";

type FloatingHeaderProps = {
  title: string;
  subtitle?: string;
  scrollY: Animated.Value;
  rightSlot?: ReactNode;
};

export function FloatingHeader({ title, subtitle, scrollY, rightSlot }: FloatingHeaderProps) {
  const insets = useSafeAreaInsets();
  const opacity = scrollY.interpolate({
    inputRange: [18, 82],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <Animated.View pointerEvents="box-none" style={[styles.shell, { height: insets.top + 64, opacity }]}>
      <BlurView intensity={42} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.tint, StyleSheet.absoluteFill]} />
      <View style={[styles.bar, { paddingTop: insets.top }]}>
        <View style={styles.side} />
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.side}>{rightSlot}</View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  tint: {
    backgroundColor: "rgba(9,11,13,0.42)",
  },
  bar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  side: {
    width: 54,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },
  title: {
    color: palette.ink,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  subtitle: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    marginTop: 1,
  },
});
