import { Check } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { palette } from "../theme";

type CheckRowProps = {
  label: string;
  value: boolean;
  onPress: () => void;
};

export function CheckRow({ label, value, onPress }: CheckRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, value && styles.rowDone, pressed && styles.pressed]}
    >
      <View style={[styles.box, value && styles.boxChecked]}>{value ? <Check color="#FFFFFF" size={17} strokeWidth={3} /> : null}</View>
      <Text style={[styles.label, value && styles.labelDone]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    backgroundColor: palette.surfaceRaised,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.line,
  },
  rowDone: {
    backgroundColor: "#F4F7E8",
    borderColor: "#CEDBA6",
  },
  pressed: {
    opacity: 0.78,
  },
  box: {
    width: 25,
    height: 25,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#9EA48E",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F3EA",
  },
  boxChecked: {
    borderColor: palette.moss,
    backgroundColor: palette.moss,
  },
  label: {
    flex: 1,
    color: palette.ink,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
  },
  labelDone: {
    color: palette.moss,
  },
});
