import React from "react";
import {
  Animated,
  Platform,
  requireNativeComponent,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  View,
} from "react-native";

type ElasticScrollViewProps = ScrollViewProps & {
  elasticEnabled?: boolean;
  maxOverscrollDistance?: number;
  dragResistance?: number;
  springStiffness?: number;
  springDamping?: number;
  flingVelocityMultiplier?: number;
};

const AndroidElasticScrollView = requireNativeComponent<ElasticScrollViewProps>("DailyWorkElasticScrollView");
const AnimatedAndroidElasticScrollView = Animated.createAnimatedComponent(AndroidElasticScrollView);

export function ElasticScrollView({
  children,
  contentContainerStyle,
  style,
  elasticEnabled = true,
  maxOverscrollDistance = 92,
  dragResistance = 0.42,
  springStiffness = 520,
  springDamping = 0.82,
  flingVelocityMultiplier = 1.35,
  ...props
}: ElasticScrollViewProps) {
  if (Platform.OS !== "android") {
    return (
      <Animated.ScrollView contentContainerStyle={contentContainerStyle} style={style} {...props}>
        {children}
      </Animated.ScrollView>
    );
  }

  return (
    <AnimatedAndroidElasticScrollView
      {...props}
      style={[styles.base, style]}
      elasticEnabled={elasticEnabled}
      maxOverscrollDistance={maxOverscrollDistance}
      dragResistance={dragResistance}
      springStiffness={springStiffness}
      springDamping={springDamping}
      flingVelocityMultiplier={flingVelocityMultiplier}
      overScrollMode="never"
    >
      <View collapsable={false} style={contentContainerStyle}>
        {children}
      </View>
    </AnimatedAndroidElasticScrollView>
  );
}

const styles = StyleSheet.create({
  base: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: "column",
    overflow: "scroll",
  },
});
