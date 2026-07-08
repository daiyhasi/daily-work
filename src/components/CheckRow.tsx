import { Check } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
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
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E4E2DD",
  },
  pressed: {
    opacity: 0.78,
  },
  box: {
    width: 25,
    height: 25,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#A8A397",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F6F0",
  },
  boxChecked: {
    borderColor: "#2F7A67",
    backgroundColor: "#2F7A67",
  },
  label: {
    flex: 1,
    color: "#252723",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
  },
  labelDone: {
    color: "#2F7A67",
  },
});
