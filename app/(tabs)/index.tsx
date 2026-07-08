import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { CalendarScreen } from "../../src/screens/CalendarScreen";
import { AppLoadingView, useAppData } from "../../src/state/AppDataContext";
import { toDateKey } from "../../src/utils/date";

export default function CalendarRoute() {
  const { cycleStart, checkIns, generatedPlan, loading } = useAppData();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());

  if (loading || !cycleStart) {
    return <AppLoadingView />;
  }

  return (
    <View style={{ flex: 1 }}>
      <CalendarScreen
        month={visibleMonth}
        cycleStart={cycleStart}
        checkIns={checkIns}
        generatedPlan={generatedPlan}
        onMonthChange={setVisibleMonth}
        onSelectDate={(date) => router.push(`/day/${toDateKey(date)}`)}
      />
    </View>
  );
}
