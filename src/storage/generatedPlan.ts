import AsyncStorage from "@react-native-async-storage/async-storage";

import { normalizeGeneratedPlanDocument } from "../data/planDocument";
import { GeneratedPlanDocument } from "../types/plan";

const GENERATED_PLAN_KEY = "daily-work:generated-plan";

export async function getGeneratedPlan(): Promise<GeneratedPlanDocument | null> {
  const raw = await AsyncStorage.getItem(GENERATED_PLAN_KEY);
  if (!raw) {
    return null;
  }

  try {
    const plan = JSON.parse(raw) as GeneratedPlanDocument;
    const normalizedPlan = normalizeGeneratedPlanDocument(plan);
    if (!normalizedPlan) {
      return null;
    }

    if (raw !== JSON.stringify(normalizedPlan)) {
      await saveGeneratedPlan(normalizedPlan);
    }

    return normalizedPlan;
  } catch {
    return null;
  }
}

export async function saveGeneratedPlan(plan: GeneratedPlanDocument) {
  const normalizedPlan = normalizeGeneratedPlanDocument(plan);
  if (!normalizedPlan) {
    throw new Error("计划必须包含 1 个完整循环周");
  }

  await AsyncStorage.setItem(GENERATED_PLAN_KEY, JSON.stringify(normalizedPlan));
  return normalizedPlan;
}

export async function clearGeneratedPlan() {
  await AsyncStorage.removeItem(GENERATED_PLAN_KEY);
}
