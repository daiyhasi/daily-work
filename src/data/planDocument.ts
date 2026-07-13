import { dailyHabits, getPlanForWeekday, getWeekPlans, globalRules } from "./trainingPlan";
import { DayPlan, GeneratedPlanDocument } from "../types/plan";

export function normalizeGeneratedPlanDocument(document: GeneratedPlanDocument): GeneratedPlanDocument | null {
  if (document?.schemaVersion !== "daily-training-plan/v1" || !Array.isArray(document.weeks)) {
    return null;
  }

  const cycleWeek = getCycleWeekFromDocument(document);
  if (!cycleWeek || !Array.isArray(cycleWeek.days) || cycleWeek.days.length !== 7) {
    return null;
  }

  return {
    ...document,
    durationWeeks: 1,
    weeks: [
      {
        ...cycleWeek,
        week: 1,
        theme: cycleWeek.theme || "循环基础周",
        days: [...cycleWeek.days]
          .sort((left, right) => left.weekday - right.weekday)
          .map((day) => ({
            ...day,
            week: 1,
          })),
      },
    ],
  };
}

export function getPlanForWeekdayFromDocument(document: GeneratedPlanDocument | null, week: number, weekday: number): DayPlan {
  const documentWeek = getCycleWeekFromDocument(document);
  const documentPlan = documentWeek?.days.find((day) => day.weekday === weekday);
  return documentPlan ? { ...documentPlan, week: 1 } : getPlanForWeekday(week, weekday);
}

export function getWeekPlansFromDocument(document: GeneratedPlanDocument | null, week: number): DayPlan[] {
  const documentWeek = getCycleWeekFromDocument(document);
  if (!documentWeek || documentWeek.days.length !== 7) {
    return getWeekPlans(week);
  }

  return [...documentWeek.days].sort((left, right) => left.weekday - right.weekday).map((plan) => ({
    ...plan,
    week: 1,
  }));
}

export function getGlobalRulesFromDocument(document: GeneratedPlanDocument | null) {
  return document?.globalRules?.length ? document.globalRules : globalRules;
}

export function getDailyHabitsFromDocument(document: GeneratedPlanDocument | null) {
  return document?.dailyHabits?.length ? document.dailyHabits : dailyHabits;
}

export function getWeekModifierFromDocument(document: GeneratedPlanDocument | null, _week: number, fallback: string) {
  return getCycleWeekFromDocument(document)?.modifier ?? fallback;
}

function getCycleWeekFromDocument(document: GeneratedPlanDocument | null) {
  return document?.weeks.find((item) => item.week === 1) ?? document?.weeks[0];
}
