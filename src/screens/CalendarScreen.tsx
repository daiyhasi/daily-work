import { ChevronLeft, ChevronRight, Flame, MoveUpRight } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getPlanForWeekdayFromDocument } from "../data/planDocument";
import { typeColors, typeLabels, weekdayLabels } from "../data/trainingPlan";
import { getCompletionStatus } from "../storage/checkIns";
import { palette } from "../theme";
import { CheckIn, CheckInMap, GeneratedPlanDocument, TrainingTask } from "../types/plan";
import { addDays, addMonths, buildMonthGrid, formatChineseDate, formatChineseMonth, getCyclePosition, startOfWeekMonday, toDateKey } from "../utils/date";

type CalendarScreenProps = {
  month: Date;
  cycleStart: Date;
  checkIns: CheckInMap;
  generatedPlan: GeneratedPlanDocument | null;
  onMonthChange: (month: Date) => void;
  onSelectDate: (date: Date) => void;
};

const weekdays = ["一", "二", "三", "四", "五", "六", "日"];

export function CalendarScreen({ month, cycleStart, checkIns, generatedPlan, onMonthChange, onSelectDate }: CalendarScreenProps) {
  const days = buildMonthGrid(month);
  const monthDays = days.filter((day) => day.inCurrentMonth);
  const completeCount = monthDays.filter((day) => getCompletionStatus(checkIns[day.dateKey]) === "complete").length;
  const partialCount = monthDays.filter((day) => getCompletionStatus(checkIns[day.dateKey]) === "partial").length;
  const today = new Date();
  const todayKey = toDateKey(today);
  const todayPosition = getCyclePosition(today, cycleStart);
  const todayPlan = getPlanForWeekdayFromDocument(generatedPlan, todayPosition.week, todayPosition.weekday);
  const todayCheckIn = checkIns[todayKey];
  const todayTrainingProgress = getTrainingProgress(todayPlan.trainingTasks, todayCheckIn);
  const todayOverall = Math.round((todayTrainingProgress + (todayCheckIn?.dietDone ? 100 : 0) + (todayCheckIn?.waterDone ? 100 : 0)) / 3);
  const weekStart = startOfWeekMonday(today);
  const currentWeekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brand}>DAILY WORK</Text>
          <Text style={styles.subBrand}>{formatChineseMonth(month)}</Text>
        </View>
        <View style={styles.monthControls}>
          <Pressable accessibilityLabel="上个月" onPress={() => onMonthChange(addMonths(month, -1))} style={styles.iconButton}>
            <ChevronLeft color={palette.ink} size={21} />
          </Pressable>
          <Pressable accessibilityLabel="下个月" onPress={() => onMonthChange(addMonths(month, 1))} style={styles.iconButton}>
            <ChevronRight color={palette.ink} size={21} />
          </Pressable>
        </View>
      </View>

      <Pressable onPress={() => onSelectDate(today)} style={({ pressed }) => [styles.todayPanel, pressed && styles.pressedPanel]}>
        <View style={styles.todayMetaRow}>
          <View style={styles.fireBadge}>
            <Flame color={palette.black} size={18} fill={palette.black} />
          </View>
          <Text style={styles.todayMeta}>
            {formatChineseDate(today)} / {weekdayLabels[todayPlan.weekday - 1]}
          </Text>
          <MoveUpRight color={palette.lime} size={20} />
        </View>

        <View style={styles.todayMainRow}>
          <View style={styles.todayCopy}>
            <Text style={styles.todayTitle}>{todayPlan.title}</Text>
            <Text style={styles.todayType}>第 {todayPlan.week} 周 / {typeLabels[todayPlan.type]}</Text>
          </View>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreNumber}>{todayOverall}</Text>
            <Text style={styles.scoreUnit}>%</Text>
          </View>
        </View>

        <View style={styles.segmentStrip}>
          {Array.from({ length: 12 }, (_, index) => {
            const active = index < Math.round(todayOverall / 8.34);
            return <View key={index} style={[styles.segment, active && styles.segmentActive]} />;
          })}
        </View>

        <View style={styles.todayStats}>
          <Metric label="训练" value={`${todayTrainingProgress}%`} />
          <Metric label="饮食" value={todayCheckIn?.dietDone ? "DONE" : "WAIT"} />
          <Metric label="饮水" value={todayCheckIn?.waterDone ? "DONE" : "WAIT"} />
        </View>
      </Pressable>

      <View style={styles.weekRail}>
        {currentWeekDays.map((date) => {
          const key = toDateKey(date);
          const position = getCyclePosition(date, cycleStart);
          const plan = getPlanForWeekdayFromDocument(generatedPlan, position.week, position.weekday);
          const status = getCompletionStatus(checkIns[key]);
          const color = typeColors[plan.type];

          return (
            <Pressable key={key} onPress={() => onSelectDate(date)} style={[styles.weekDay, key === todayKey && styles.weekDayToday]}>
              <Text style={[styles.weekDayLabel, key === todayKey && styles.weekDayTodayText]}>{weekdays[position.weekday - 1]}</Text>
              <Text style={[styles.weekDayNumber, key === todayKey && styles.weekDayTodayText]}>{date.getDate()}</Text>
              <View
                style={[
                  styles.weekStatus,
                  {
                    backgroundColor: status === "empty" ? palette.line : color,
                    opacity: status === "partial" ? 0.45 : 1,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.monthHeader}>
        <Text style={styles.monthTitle}>月历矩阵</Text>
        <View style={styles.monthMetrics}>
          <Text style={styles.monthMetric}>{completeCount} 完整</Text>
          <Text style={styles.monthMetric}>{partialCount} 进行中</Text>
        </View>
      </View>

      <View style={styles.calendar}>
        <View style={styles.weekHeader}>
          {weekdays.map((weekday) => (
            <Text key={weekday} style={styles.weekLabel}>
              {weekday}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {days.map((day) => {
            const checkIn = checkIns[day.dateKey];
            const status = getCompletionStatus(checkIn);
            const position = getCyclePosition(day.date, cycleStart);
            const plan = getPlanForWeekdayFromDocument(generatedPlan, position.week, position.weekday);
            const planColor = typeColors[plan.type];

            return (
              <Pressable
                key={day.dateKey}
                accessibilityRole="button"
                accessibilityLabel={`${day.date.getMonth() + 1}月${day.date.getDate()}日`}
                onPress={() => onSelectDate(day.date)}
                style={({ pressed }) => [
                  styles.dayCell,
                  day.isToday && styles.todayCell,
                  !day.inCurrentMonth && styles.outsideDay,
                  status === "complete" && styles.completeCell,
                  pressed && styles.dayPressed,
                ]}
              >
                <Text style={[styles.dayNumber, !day.inCurrentMonth && styles.mutedDay, day.isToday && styles.todayText]}>
                  {day.date.getDate()}
                </Text>
                <View style={styles.daySignals}>
                  <View style={[styles.typeNeedle, { backgroundColor: planColor }]} />
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: status === "empty" ? "transparent" : planColor,
                        opacity: status === "partial" ? 0.38 : 1,
                      },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function getTrainingProgress(tasks: TrainingTask[], checkIn?: CheckIn) {
  if (!checkIn) {
    return 0;
  }

  if (checkIn.trainingDone && !checkIn.trainingTaskDone) {
    return 100;
  }

  const progress = tasks.reduce((total, task) => total + (checkIn.trainingTaskDone?.[task.id] ? task.points : 0), 0);
  return Math.min(progress, 100);
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 116,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  brand: {
    color: palette.ink,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subBrand: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    marginTop: 2,
  },
  monthControls: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceRaised,
    borderWidth: 1,
    borderColor: palette.line,
  },
  todayPanel: {
    minHeight: 238,
    borderRadius: 32,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: "rgba(199,246,77,0.34)",
    padding: 18,
    marginBottom: 14,
    overflow: "hidden",
  },
  pressedPanel: {
    opacity: 0.86,
  },
  todayMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fireBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.lime,
  },
  todayMeta: {
    flex: 1,
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  todayMainRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 28,
  },
  todayCopy: {
    flex: 1,
  },
  todayTitle: {
    color: palette.ink,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
  },
  todayType: {
    color: palette.cyan,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900",
    marginTop: 8,
  },
  scoreBlock: {
    minWidth: 96,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
  },
  scoreNumber: {
    color: palette.lime,
    fontSize: 64,
    lineHeight: 66,
    fontWeight: "900",
  },
  scoreUnit: {
    color: palette.lime,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "900",
    marginTop: 8,
  },
  segmentStrip: {
    flexDirection: "row",
    gap: 5,
    marginTop: 22,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#263036",
  },
  segmentActive: {
    backgroundColor: palette.lime,
  },
  todayStats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  metric: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "#0D1114",
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  metricValue: {
    color: palette.ink,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  metricLabel: {
    color: palette.quiet,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    marginTop: 2,
  },
  weekRail: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 20,
  },
  weekDay: {
    flex: 1,
    minWidth: 0,
    minHeight: 86,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceRaised,
    borderWidth: 1,
    borderColor: palette.line,
    paddingVertical: 9,
  },
  weekDayToday: {
    backgroundColor: palette.lime,
    borderColor: palette.lime,
  },
  weekDayLabel: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  weekDayNumber: {
    color: palette.ink,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
    marginTop: 4,
  },
  weekDayTodayText: {
    color: palette.black,
  },
  weekStatus: {
    width: 18,
    height: 3,
    borderRadius: 999,
    marginTop: 8,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  monthTitle: {
    color: palette.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  monthMetrics: {
    alignItems: "flex-end",
  },
  monthMetric: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  calendar: {
    borderRadius: 28,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekLabel: {
    width: `${100 / 7}%`,
    textAlign: "center",
    color: palette.quiet,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 0.82,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
  },
  todayCell: {
    backgroundColor: "rgba(199,246,77,0.12)",
    borderWidth: 1,
    borderColor: "rgba(199,246,77,0.28)",
  },
  completeCell: {
    backgroundColor: "rgba(199,246,77,0.08)",
  },
  outsideDay: {
    opacity: 0.28,
  },
  dayPressed: {
    backgroundColor: "#202A30",
  },
  dayNumber: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  mutedDay: {
    color: palette.quiet,
  },
  todayText: {
    color: palette.lime,
  },
  daySignals: {
    height: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  typeNeedle: {
    width: 14,
    height: 2,
    borderRadius: 999,
    opacity: 0.68,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 3,
  },
});
