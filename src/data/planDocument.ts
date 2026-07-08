import { dailyHabits, getPlanForWeekday, getWeekPlans, globalRules } from "./trainingPlan";
import { DayPlan, GeneratedPlanDocument } from "../types/plan";

export function getPlanForWeekdayFromDocument(document: GeneratedPlanDocument | null, week: number, weekday: number): DayPlan {
  const documentPlan = document?.weeks.find((item) => item.week === week)?.days.find((day) => day.weekday === weekday);
  return documentPlan ?? getPlanForWeekday(week, weekday);
}

export function getWeekPlansFromDocument(document: GeneratedPlanDocument | null, week: number): DayPlan[] {
  const documentWeek = document?.weeks.find((item) => item.week === week);
  if (!documentWeek || documentWeek.days.length !== 7) {
    return getWeekPlans(week);
  }

  return [...documentWeek.days].sort((left, right) => left.weekday - right.weekday);
}

export function getGlobalRulesFromDocument(document: GeneratedPlanDocument | null) {
  return document?.globalRules?.length ? document.globalRules : globalRules;
}

export function getDailyHabitsFromDocument(document: GeneratedPlanDocument | null) {
  return document?.dailyHabits?.length ? document.dailyHabits : dailyHabits;
}

export function getWeekModifierFromDocument(document: GeneratedPlanDocument | null, week: number, fallback: string) {
  return document?.weeks.find((item) => item.week === week)?.modifier ?? fallback;
}
