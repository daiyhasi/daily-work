import { StatusBar } from "expo-status-bar";
import { CalendarDays, ClipboardList } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { getPlanForWeekday } from "./src/data/trainingPlan";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { DayPlanScreen } from "./src/screens/DayPlanScreen";
import { PlanOverviewScreen } from "./src/screens/PlanOverviewScreen";
import { getAllCheckIns, getOrCreateCycleStart, saveCheckIn } from "./src/storage/checkIns";
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
        <StatusBar style="dark" />
        <View style={styles.loadingScreen}>
          <ActivityIndicator color="#2F7A67" />
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
        <StatusBar style="dark" />
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
        <StatusBar style="dark" />
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
            icon={<CalendarDays color={activeTab === "calendar" ? "#FFFFFF" : "#676B64"} size={20} />}
            onPress={() => setActiveTab("calendar")}
          />
          <TabButton
            label="计划"
            active={activeTab === "plan"}
            icon={<ClipboardList color={activeTab === "plan" ? "#FFFFFF" : "#676B64"} size={20} />}
            onPress={() => setActiveTab("plan")}
          />
        </View>
      </>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.app}>{content}</SafeAreaView>
    </SafeAreaProvider>
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
    backgroundColor: "#F7F5EF",
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
    color: "#68665F",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
  tabBar: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 24,
    height: 62,
    flexDirection: "row",
    gap: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3DFD7",
    padding: 7,
    shadowColor: "#1F241E",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: "#2F7A67",
  },
  tabPressed: {
    opacity: 0.78,
  },
  tabLabel: {
    color: "#676B64",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  tabLabelActive: {
    color: "#FFFFFF",
  },
});
