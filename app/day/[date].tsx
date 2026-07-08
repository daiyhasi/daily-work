import { router, useLocalSearchParams } from "expo-router";

import { getDailyHabitsFromDocument, getGlobalRulesFromDocument, getPlanForWeekdayFromDocument } from "../../src/data/planDocument";
import { DayPlanScreen } from "../../src/screens/DayPlanScreen";
import { AppLoadingView, useAppData } from "../../src/state/AppDataContext";
import { fromDateKey, getCyclePosition } from "../../src/utils/date";

export default function DayRoute() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { cycleStart, checkIns, generatedPlan, loading, saveCheckIn } = useAppData();

  if (loading || !cycleStart || !date) {
    return <AppLoadingView />;
  }

  const selectedDate = fromDateKey(date);
  const position = getCyclePosition(selectedDate, cycleStart);
  const plan = getPlanForWeekdayFromDocument(generatedPlan, position.week, position.weekday);

  return (
    <DayPlanScreen
      date={selectedDate}
      dateKey={date}
      plan={plan}
      globalRules={getGlobalRulesFromDocument(generatedPlan)}
      dailyHabits={getDailyHabitsFromDocument(generatedPlan)}
      checkIn={checkIns[date]}
      onBack={() => router.back()}
      onSave={saveCheckIn}
    />
  );
}
