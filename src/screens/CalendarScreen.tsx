import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { typeColors } from "../data/trainingPlan";
import { CheckInMap } from "../types/plan";
import { addMonths, buildMonthGrid, formatChineseMonth, getCyclePosition } from "../utils/date";
import { getPlanForWeekday } from "../data/trainingPlan";
import { getCompletionStatus } from "../storage/checkIns";
import { palette } from "../theme";

type CalendarScreenProps = {
  month: Date;
  cycleStart: Date;
  checkIns: CheckInMap;
  onMonthChange: (month: Date) => void;
  onSelectDate: (date: Date) => void;
};

const weekdays = ["一", "二", "三", "四", "五", "六", "日"];

export function CalendarScreen({ month, cycleStart, checkIns, onMonthChange, onSelectDate }: CalendarScreenProps) {
  const days = buildMonthGrid(month);
  const monthDays = days.filter((day) => day.inCurrentMonth);
  const completeCount = monthDays.filter((day) => getCompletionStatus(checkIns[day.dateKey]) === "complete").length;
  const partialCount = monthDays.filter((day) => getCompletionStatus(checkIns[day.dateKey]) === "partial").length;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>training ledger</Text>
          <Text style={styles.title}>{formatChineseMonth(month)}</Text>
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

      <View style={styles.summaryBand}>
        <View style={styles.metricBlock}>
          <Text style={styles.summaryValue}>{completeCount}</Text>
          <Text style={styles.summaryText}>完整</Text>
        </View>
        <View style={styles.metricBlock}>
          <Text style={styles.summaryValue}>{partialCount}</Text>
          <Text style={styles.summaryText}>进行中</Text>
        </View>
        <Text style={styles.summaryHint}>点日期进入当天计划</Text>
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
            const plan = getPlanForWeekday(position.week, position.weekday);
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
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: status === "empty" ? "transparent" : planColor,
                      opacity: status === "partial" ? 0.38 : 1,
                    },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  kicker: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  title: {
    color: palette.ink,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
  },
  monthControls: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceRaised,
    borderWidth: 1,
    borderColor: palette.line,
  },
  summaryBand: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: palette.charcoal,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  metricBlock: {
    width: 74,
  },
  summaryValue: {
    color: palette.lime,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
  },
  summaryText: {
    color: "#D8DDD1",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
  summaryHint: {
    flex: 1,
    color: "#BEC9B9",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  calendar: {
    borderRadius: 24,
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
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 0.88,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  todayCell: {
    backgroundColor: "#EEF3D8",
  },
  completeCell: {
    backgroundColor: "#F8F9EE",
  },
  outsideDay: {
    opacity: 0.42,
  },
  dayPressed: {
    backgroundColor: "#E8E2D3",
  },
  dayNumber: {
    color: palette.ink,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  mutedDay: {
    color: "#96978F",
  },
  todayText: {
    color: palette.moss,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
  },
});
