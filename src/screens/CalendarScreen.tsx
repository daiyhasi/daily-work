import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { typeColors } from "../data/trainingPlan";
import { CheckInMap } from "../types/plan";
import { addMonths, buildMonthGrid, formatChineseMonth, getCyclePosition } from "../utils/date";
import { getPlanForWeekday } from "../data/trainingPlan";
import { getCompletionStatus } from "../storage/checkIns";

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

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>每日训练打卡</Text>
          <Text style={styles.title}>{formatChineseMonth(month)}</Text>
        </View>
        <View style={styles.monthControls}>
          <Pressable accessibilityLabel="上个月" onPress={() => onMonthChange(addMonths(month, -1))} style={styles.iconButton}>
            <ChevronLeft color="#252723" size={21} />
          </Pressable>
          <Pressable accessibilityLabel="下个月" onPress={() => onMonthChange(addMonths(month, 1))} style={styles.iconButton}>
            <ChevronRight color="#252723" size={21} />
          </Pressable>
        </View>
      </View>

      <View style={styles.summaryBand}>
        <Text style={styles.summaryValue}>{Object.values(checkIns).filter((item) => getCompletionStatus(item) === "complete").length}</Text>
        <Text style={styles.summaryText}>天完整打卡</Text>
        <View style={styles.summaryDivider} />
        <Text style={styles.summaryHint}>点击日期查看训练和饮食安排</Text>
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
    color: "#76746D",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  title: {
    color: "#20221F",
    fontSize: 31,
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
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DFD6",
  },
  summaryBand: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#293D35",
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
  },
  summaryText: {
    color: "#EDF5EE",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    marginLeft: 7,
  },
  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.24)",
    marginHorizontal: 14,
  },
  summaryHint: {
    flex: 1,
    color: "#CFDED3",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  calendar: {
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E0D8",
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
    color: "#858179",
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
    aspectRatio: 0.86,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  todayCell: {
    backgroundColor: "#EDF5EE",
  },
  outsideDay: {
    opacity: 0.42,
  },
  dayPressed: {
    backgroundColor: "#F1EFE8",
  },
  dayNumber: {
    color: "#262823",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  mutedDay: {
    color: "#8C887F",
  },
  todayText: {
    color: "#2F7A67",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
  },
});
