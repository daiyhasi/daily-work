import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Icon, Label, NativeTabs, VectorIcon } from "expo-router/unstable-native-tabs";

import { palette } from "../../src/theme";

export default function TabsLayout() {
  return (
    <NativeTabs
      backgroundColor="rgba(9,11,13,0.72)"
      blurEffect="systemMaterialDark"
      disableTransparentOnScrollEdge
      iconColor={{
        default: palette.muted,
        selected: palette.lime,
      }}
      labelStyle={{
        default: {
          color: palette.muted,
          fontSize: 12,
          fontWeight: "700",
        },
        selected: {
          color: palette.lime,
          fontSize: 12,
          fontWeight: "800",
        },
      }}
      minimizeBehavior="automatic"
      shadowColor="rgba(0,0,0,0.45)"
    >
      <NativeTabs.Trigger name="index">
        <Icon
          sf={{ default: "calendar", selected: "calendar.badge.checkmark" }}
          androidSrc={{
            default: <VectorIcon family={MaterialCommunityIcons} name="calendar-month-outline" />,
            selected: <VectorIcon family={MaterialCommunityIcons} name="calendar-check" />,
          }}
          selectedColor={palette.lime}
        />
        <Label>日历</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plan">
        <Icon
          sf={{ default: "doc.text", selected: "doc.text.fill" }}
          androidSrc={{
            default: <VectorIcon family={MaterialCommunityIcons} name="clipboard-text-outline" />,
            selected: <VectorIcon family={MaterialCommunityIcons} name="clipboard-text" />,
          }}
          selectedColor={palette.lime}
        />
        <Label>计划</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
