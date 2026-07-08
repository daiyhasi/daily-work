import AsyncStorage from "@react-native-async-storage/async-storage";

import { GeneratedPlanDocument } from "../types/plan";

const GENERATED_PLAN_KEY = "daily-work:generated-plan";

export async function getGeneratedPlan(): Promise<GeneratedPlanDocument | null> {
  const raw = await AsyncStorage.getItem(GENERATED_PLAN_KEY);
  if (!raw) {
    return null;
  }

  try {
    const plan = JSON.parse(raw) as GeneratedPlanDocument;
    return isGeneratedPlanDocument(plan) ? plan : null;
  } catch {
    return null;
  }
}

export async function saveGeneratedPlan(plan: GeneratedPlanDocument) {
  await AsyncStorage.setItem(GENERATED_PLAN_KEY, JSON.stringify(plan));
}

export async function clearGeneratedPlan() {
  await AsyncStorage.removeItem(GENERATED_PLAN_KEY);
}

function isGeneratedPlanDocument(value: GeneratedPlanDocument) {
  return (
    value?.schemaVersion === "daily-training-plan/v1" &&
    value.durationWeeks === 4 &&
    Array.isArray(value.weeks) &&
    value.weeks.length === 4
  );
}
