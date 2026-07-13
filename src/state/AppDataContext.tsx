import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { normalizeGeneratedPlanDocument } from "../data/planDocument";
import { demoPlanProfile } from "../data/planGenerationDemo";
import { getGeneratedDemoPlanDocument } from "../data/trainingPlan";
import { getAllCheckIns, getOrCreateCycleStart, saveCheckIn } from "../storage/checkIns";
import { getGeneratedPlan, saveGeneratedPlan } from "../storage/generatedPlan";
import { palette } from "../theme";
import { CheckIn, CheckInMap, DayPlan, GeneratedPlanDocument } from "../types/plan";
import { fromDateKey } from "../utils/date";

type AppDataContextValue = {
  cycleStart: Date | null;
  checkIns: CheckInMap;
  generatedPlan: GeneratedPlanDocument | null;
  loading: boolean;
  saveCheckIn: (checkIn: CheckIn) => Promise<void>;
  activateGeneratedPlan: (plan: GeneratedPlanDocument) => Promise<void>;
  updateDayPlan: (weekday: number, plan: DayPlan) => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [cycleStartKey, setCycleStartKey] = useState<string | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInMap>({});
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlanDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAppData() {
      const [storedCycleStart, storedCheckIns, storedPlan] = await Promise.all([getOrCreateCycleStart(), getAllCheckIns(), getGeneratedPlan()]);
      if (!mounted) {
        return;
      }

      setCycleStartKey(storedCycleStart);
      setCheckIns(storedCheckIns);
      setGeneratedPlan(storedPlan);
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

  async function handleActivateGeneratedPlan(plan: GeneratedPlanDocument) {
    const normalizedPlan = await saveGeneratedPlan(plan);
    setGeneratedPlan(normalizedPlan);
  }

  async function handleUpdateDayPlan(weekday: number, plan: DayPlan) {
    const activePlan = normalizeGeneratedPlanDocument(generatedPlan ?? getGeneratedDemoPlanDocument(demoPlanProfile));
    if (!activePlan) {
      return;
    }

    const nextPlan: GeneratedPlanDocument = {
      ...activePlan,
      source: activePlan.source,
      weeks: [
        {
          ...activePlan.weeks[0],
          days: activePlan.weeks[0].days.map((day) =>
            day.weekday === weekday
              ? {
                  ...plan,
                  week: 1,
                  weekday,
                }
              : day
          ),
        },
      ],
    };

    const normalizedPlan = await saveGeneratedPlan(nextPlan);
    setGeneratedPlan(normalizedPlan);
  }

  return (
    <AppDataContext.Provider
      value={{
        cycleStart,
        checkIns,
        generatedPlan,
        loading,
        saveCheckIn: handleSaveCheckIn,
        activateGeneratedPlan: handleActivateGeneratedPlan,
        updateDayPlan: handleUpdateDayPlan,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }

  return context;
}

export function AppLoadingView() {
  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator color={palette.lime} />
      <Text style={styles.loadingText}>正在准备训练计划</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: palette.canvas,
  },
  loadingText: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
});
