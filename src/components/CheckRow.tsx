import { Check } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { palette } from "../theme";

type CheckRowProps = {
  label: string;
  value: boolean;
  onPress: () => void;
  accentColor?: string;
  meta?: string;
};

export function CheckRow({ label, value, onPress, accentColor = palette.lime, meta }: CheckRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, value && styles.rowDone, pressed && styles.pressed]}
    >
      <View style={[styles.box, value && styles.boxChecked, value && { backgroundColor: accentColor, borderColor: accentColor }]}>
        {value ? <Check color={palette.black} size={17} strokeWidth={3} /> : null}
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, value && { color: accentColor }]}>{label}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    backgroundColor: palette.surfaceRaised,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.line,
  },
  rowDone: {
    backgroundColor: "#101812",
    borderColor: "rgba(199,246,77,0.28)",
  },
  pressed: {
    opacity: 0.78,
  },
  box: {
    width: 25,
    height: 25,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.quiet,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.charcoal,
  },
  boxChecked: {
    borderColor: palette.lime,
    backgroundColor: palette.lime,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: palette.ink,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  meta: {
    color: palette.quiet,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    marginTop: 2,
  },
});
