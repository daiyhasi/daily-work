import AsyncStorage from "@react-native-async-storage/async-storage";

import { defaultPlanPrompt } from "../data/planGenerationDemo";

const PLAN_PROMPT_KEY = "daily-work:plan-prompt";

export async function getPlanPrompt(): Promise<string> {
  const stored = await AsyncStorage.getItem(PLAN_PROMPT_KEY);
  return stored ?? defaultPlanPrompt;
}

export async function savePlanPrompt(prompt: string): Promise<string> {
  const normalized = prompt.trim() || defaultPlanPrompt;
  await AsyncStorage.setItem(PLAN_PROMPT_KEY, normalized);
  return normalized;
}
