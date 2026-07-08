import { ArrowLeft, Droplets, Dumbbell, Utensils } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CheckRow } from "../components/CheckRow";
import { dailyHabits, globalRules, typeColors, typeLabels, weekdayLabels } from "../data/trainingPlan";
import { createEmptyCheckIn } from "../storage/checkIns";
import { palette } from "../theme";
import { CheckIn, DayPlan, TrainingTask } from "../types/plan";
import { formatChineseDate } from "../utils/date";

type DayPlanScreenProps = {
  date: Date;
  dateKey: string;
  plan: DayPlan;
  checkIn?: CheckIn;
  onBack: () => void;
  onSave: (checkIn: CheckIn) => void;
};

export function DayPlanScreen({ date, dateKey, plan, checkIn, onBack, onSave }: DayPlanScreenProps) {
  const current = checkIn ?? createEmptyCheckIn(dateKey);
  const planColor = typeColors[plan.type];
  const taskState = buildTaskState(plan.trainingTasks, current);
  const trainingProgress = getTrainingProgress(plan.trainingTasks, taskState);
  const doneTaskCount = plan.trainingTasks.filter((task) => taskState[task.id]).length;
  const allDone = trainingProgress === 100 && current.dietDone && current.waterDone;

  function updateCheckIn(patch: Partial<CheckIn>) {
    onSave({
      ...current,
      ...patch,
    });
  }

  function updateTrainingTask(taskId: string) {
    const nextTaskState = {
      ...taskState,
      [taskId]: !taskState[taskId],
    };
    const nextProgress = getTrainingProgress(plan.trainingTasks, nextTaskState);

    updateCheckIn({
      trainingTaskDone: nextTaskState,
      trainingDone: nextProgress === 100,
    });
  }

  function completeToday() {
    const completedTasks = Object.fromEntries(plan.trainingTasks.map((task) => [task.id, true]));

    onSave({
      ...current,
      trainingDone: true,
      trainingTaskDone: completedTasks,
      dietDone: true,
      waterDone: true,
    });
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="返回日历" onPress={onBack} style={styles.backButton}>
          <ArrowLeft color={palette.ink} size={22} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.dateText}>
            {formatChineseDate(date)} / {weekdayLabels[plan.weekday - 1]}
          </Text>
          <Text style={styles.title}>{plan.title}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { borderColor: `${planColor}66` }]}>
          <View style={styles.heroTop}>
            <Text style={[styles.typeLabel, { color: planColor }]}>第 {plan.week} 周 / {typeLabels[plan.type]}</Text>
            <Text style={styles.doneLabel}>{allDone ? "闭环完成" : `${doneTaskCount}/${plan.trainingTasks.length} 项`}</Text>
          </View>

          <View style={styles.heroNumberRow}>
            <Text style={[styles.heroNumber, { color: planColor }]}>{trainingProgress}</Text>
            <Text style={[styles.heroPercent, { color: planColor }]}>%</Text>
            <View style={styles.heroCopyBox}>
              <Text style={styles.heroCopy}>训练拆成细项打卡，饮食和饮水独立记录。</Text>
            </View>
          </View>

          <SegmentProgress progress={trainingProgress} color={planColor} />
        </View>

        <View style={styles.quickGrid}>
          <Pressable
            onPress={() => updateCheckIn({ dietDone: !current.dietDone })}
            style={({ pressed }) => [styles.quickTile, current.dietDone && styles.quickTileDone, pressed && styles.pressedPanel]}
          >
            <Utensils color={current.dietDone ? palette.black : palette.ember} size={22} />
            <Text style={[styles.quickValue, current.dietDone && styles.quickDoneText]}>{current.dietDone ? "DONE" : "WAIT"}</Text>
            <Text style={[styles.quickLabel, current.dietDone && styles.quickDoneText]}>饮食</Text>
          </Pressable>
          <Pressable
            onPress={() => updateCheckIn({ waterDone: !current.waterDone })}
            style={({ pressed }) => [styles.quickTile, current.waterDone && styles.quickTileDone, pressed && styles.pressedPanel]}
          >
            <Droplets color={current.waterDone ? palette.black : palette.cyan} size={22} />
            <Text style={[styles.quickValue, current.waterDone && styles.quickDoneText]}>{current.waterDone ? "2400" : "0/2400"}</Text>
            <Text style={[styles.quickLabel, current.waterDone && styles.quickDoneText]}>饮水 ml</Text>
          </Pressable>
        </View>

        <Section icon={<Dumbbell color={planColor} size={20} />} title="训练轨道">
          <View style={styles.trainingTaskList}>
            {plan.trainingTasks.map((task, index) => (
              <View key={task.id} style={styles.taskLine}>
                <View style={styles.taskIndexWrap}>
                  <Text style={[styles.taskIndex, taskState[task.id] && { color: planColor }]}>{String(index + 1).padStart(2, "0")}</Text>
                </View>
                <View style={styles.taskContent}>
                  <CheckRow
                    label={task.label}
                    meta={`+${task.points}%`}
                    value={taskState[task.id]}
                    accentColor={planColor}
                    onPress={() => updateTrainingTask(task.id)}
                  />
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section icon={<Dumbbell color={palette.muted} size={20} />} title="训练原文">
          {plan.training.map((item) => (
            <Text key={item} style={styles.listItem}>
              {item}
            </Text>
          ))}
        </Section>

        <Section icon={<Utensils color={palette.ember} size={20} />} title="饮食">
          {plan.meals.map((item) => (
            <Text key={item} style={styles.listItem}>
              {item}
            </Text>
          ))}
        </Section>

        <Section icon={<Droplets color={palette.cyan} size={20} />} title="规则提醒">
          {[...globalRules, ...(plan.notes ?? []), ...dailyHabits].map((item) => (
            <Text key={item} style={styles.ruleItem}>
              {item}
            </Text>
          ))}
        </Section>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={completeToday} style={({ pressed }) => [styles.primaryButton, allDone && styles.primaryDone, pressed && styles.buttonPressed]}>
          <Text style={[styles.primaryText, allDone && styles.primaryDoneText]}>{allDone ? "今日已完整打卡" : "完成今日打卡"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function buildTaskState(tasks: TrainingTask[], checkIn: CheckIn) {
  return Object.fromEntries(tasks.map((task) => [task.id, checkIn.trainingTaskDone?.[task.id] ?? checkIn.trainingDone]));
}

function getTrainingProgress(tasks: TrainingTask[], taskState: Record<string, boolean>) {
  const progress = tasks.reduce((total, task) => total + (taskState[task.id] ? task.points : 0), 0);
  return Math.min(progress, 100);
}

function SegmentProgress({ progress, color }: { progress: number; color: string }) {
  return (
    <View style={styles.segmentWrap}>
      {Array.from({ length: 20 }, (_, index) => {
        const active = index < Math.round(progress / 5);
        return <View key={index} style={[styles.segment, active && { backgroundColor: color }]} />;
      })}
    </View>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceRaised,
    borderWidth: 1,
    borderColor: palette.line,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  dateText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  title: {
    color: palette.ink,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "900",
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 112,
  },
  hero: {
    borderRadius: 32,
    borderWidth: 1,
    backgroundColor: palette.surface,
    padding: 18,
    marginBottom: 14,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  typeLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  doneLabel: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  heroNumberRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 18,
  },
  heroNumber: {
    fontSize: 82,
    lineHeight: 84,
    fontWeight: "900",
  },
  heroPercent: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "900",
    marginTop: 12,
  },
  heroCopyBox: {
    flex: 1,
    alignSelf: "center",
    marginLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: palette.line,
    paddingLeft: 14,
  },
  heroCopy: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  segmentWrap: {
    flexDirection: "row",
    gap: 4,
    marginTop: 18,
  },
  segment: {
    flex: 1,
    height: 18,
    borderRadius: 6,
    backgroundColor: "#252E34",
  },
  quickGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  quickTile: {
    flex: 1,
    minHeight: 106,
    borderRadius: 26,
    backgroundColor: palette.surfaceRaised,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
    justifyContent: "space-between",
  },
  quickTileDone: {
    backgroundColor: palette.lime,
    borderColor: palette.lime,
  },
  quickValue: {
    color: palette.ink,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
    marginTop: 12,
  },
  quickLabel: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  quickDoneText: {
    color: palette.black,
  },
  pressedPanel: {
    opacity: 0.82,
  },
  trainingTaskList: {
    gap: 10,
  },
  taskLine: {
    flexDirection: "row",
    gap: 10,
  },
  taskIndexWrap: {
    width: 34,
    alignItems: "center",
    paddingTop: 17,
  },
  taskIndex: {
    color: palette.quiet,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
  },
  taskContent: {
    flex: 1,
    minWidth: 0,
  },
  section: {
    borderRadius: 26,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 15,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 12,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
  },
  sectionBody: {
    gap: 9,
  },
  listItem: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "700",
  },
  ruleItem: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: "rgba(9,11,13,0.96)",
    borderTopWidth: 1,
    borderTopColor: palette.line,
  },
  primaryButton: {
    height: 56,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.ink,
  },
  primaryDone: {
    backgroundColor: palette.lime,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  primaryText: {
    color: palette.black,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
  },
  primaryDoneText: {
    color: palette.black,
  },
});
