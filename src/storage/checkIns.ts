import AsyncStorage from "@react-native-async-storage/async-storage";

import { CheckIn, CheckInMap } from "../types/plan";
import { startOfWeekMonday, toDateKey } from "../utils/date";

const CHECK_INS_KEY = "daily-work:check-ins";
const CYCLE_START_KEY = "daily-work:cycle-start";

export async function getAllCheckIns(): Promise<CheckInMap> {
  const raw = await AsyncStorage.getItem(CHECK_INS_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as CheckInMap;
  } catch {
    return {};
  }
}

export async function saveCheckIn(checkIn: CheckIn): Promise<CheckInMap> {
  const current = await getAllCheckIns();
  const next = {
    ...current,
    [checkIn.date]: checkIn,
  };

  await AsyncStorage.setItem(CHECK_INS_KEY, JSON.stringify(next));
  return next;
}

export async function getOrCreateCycleStart(): Promise<string> {
  const stored = await AsyncStorage.getItem(CYCLE_START_KEY);
  if (stored) {
    return stored;
  }

  const cycleStart = toDateKey(startOfWeekMonday(new Date()));
  await AsyncStorage.setItem(CYCLE_START_KEY, cycleStart);
  return cycleStart;
}

export function createEmptyCheckIn(date: string): CheckIn {
  return {
    date,
    trainingDone: false,
    dietDone: false,
    waterDone: false,
  };
}

export function getCompletionStatus(checkIn?: CheckIn) {
  if (!checkIn) {
    return "empty";
  }

  const completedCount = [checkIn.trainingDone, checkIn.dietDone, checkIn.waterDone].filter(Boolean).length;
  if (completedCount === 3) {
    return "complete";
  }

  return completedCount > 0 ? "partial" : "empty";
}
