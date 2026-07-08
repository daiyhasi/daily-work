import { StatusBar } from "expo-status-bar";
import { CalendarDays, ClipboardList } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { getPlanForWeekday } from "./src/data/trainingPlan";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { DayPlanScreen } from "./src/screens/DayPlanScreen";
import { PlanOverviewScreen } from "./src/screens/PlanOverviewScreen";
import { getAllCheckIns, getOrCreateCycleStart, saveCheckIn } from "./src/storage/checkIns";
import { palette, paperTheme } from "./src/theme";
import { AppTab, CheckIn, CheckInMap } from "./src/types/plan";
import { fromDateKey, getCyclePosition, toDateKey } from "./src/utils/date";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("calendar");
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [cycleStartKey, setCycleStartKey] = useState<string | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAppData() {
      const [storedCycleStart, storedCheckIns] = await Promise.all([getOrCreateCycleStart(), getAllCheckIns()]);
      if (!mounted) {
        return;
      }

      setCycleStartKey(storedCycleStart);
      setCheckIns(storedCheckIns);
      setLoading(false);
    }

    loadAppData();

    return () => {
      mounted = false;
    };
  }, []);

  const cycleStart = useMemo(() => (cycleStartKey ? fromDateKey(cycleStartKey) : null), [cycleStartKey]);

  async function handleSaveCheckIn(checkIn: CheckIn) {
    setCheckIns((current) => ({
      ...current,
      [checkIn.date]: checkIn,
    }));

    const stored = await saveCheckIn(checkIn);
    setCheckIns(stored);
  }

  let content: React.ReactNode;

  if (loading || !cycleStart) {
    content = (
      <>
        <StatusBar style="light" />
        <View style={styles.loadingScreen}>
          <ActivityIndicator color={palette.lime} />
          <Text style={styles.loadingText}>正在准备训练计划</Text>
        </View>
      </>
    );
  } else if (selectedDate) {
    const dateKey = toDateKey(selectedDate);
    const position = getCyclePosition(selectedDate, cycleStart);
    const plan = getPlanForWeekday(position.week, position.weekday);

    content = (
      <>
        <StatusBar style="light" />
        <DayPlanScreen
          date={selectedDate}
          dateKey={dateKey}
          plan={plan}
          checkIn={checkIns[dateKey]}
          onBack={() => setSelectedDate(null)}
          onSave={handleSaveCheckIn}
        />
      </>
    );
  } else {
    content = (
      <>
        <StatusBar style="light" />
        <View style={styles.main}>
          {activeTab === "calendar" ? (
            <CalendarScreen
              month={visibleMonth}
              cycleStart={cycleStart}
              checkIns={checkIns}
              onMonthChange={setVisibleMonth}
              onSelectDate={setSelectedDate}
            />
          ) : (
            <PlanOverviewScreen />
          )}
        </View>
        <View style={styles.tabBar}>
          <TabButton
            label="日历"
            active={activeTab === "calendar"}
            icon={<CalendarDays color={activeTab === "calendar" ? palette.black : palette.muted} size={20} strokeWidth={2.4} />}
            onPress={() => setActiveTab("calendar")}
          />
          <TabButton
            label="计划"
            active={activeTab === "plan"}
            icon={<ClipboardList color={activeTab === "plan" ? palette.black : palette.muted} size={20} strokeWidth={2.4} />}
            onPress={() => setActiveTab("plan")}
          />
        </View>
      </>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.app}>{content}</SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

function TabButton({ label, active, icon, onPress }: { label: string; active: boolean; icon: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.tabButton, active && styles.tabButtonActive, pressed && styles.tabPressed]}
    >
      {icon}
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  main: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
  tabBar: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 24,
    height: 66,
    flexDirection: "row",
    gap: 10,
    borderRadius: 28,
    backgroundColor: "rgba(14,17,20,0.96)",
    borderWidth: 1,
    borderColor: "rgba(199,246,77,0.18)",
    padding: 7,
    shadowColor: palette.lime,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: palette.lime,
  },
  tabPressed: {
    opacity: 0.78,
  },
  tabLabel: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  tabLabelActive: {
    color: palette.black,
  },
});
