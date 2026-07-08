import { ArrowLeft, Droplets, Dumbbell, Utensils } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CheckRow } from "../components/CheckRow";
import { dailyHabits, globalRules, typeColors, typeLabels, weekdayLabels } from "../data/trainingPlan";
import { createEmptyCheckIn } from "../storage/checkIns";
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
          <ArrowLeft color="#252723" size={22} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.dateText}>
            {formatChineseDate(date)} · {weekdayLabels[plan.weekday - 1]}
          </Text>
          <Text style={styles.title}>{plan.title}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { borderColor: planColor }]}>
          <View style={[styles.typePill, { backgroundColor: planColor }]}>
            <Text style={styles.typePillText}>第 {plan.week} 周 · {typeLabels[plan.type]}</Text>
          </View>
          <Text style={styles.heroTitle}>{allDone ? "今天完成得很稳" : "照着清单做，完成后打卡"}</Text>
          <Text style={styles.heroCopy}>训练、饮食和饮水会分别记录，日历会同步显示完成状态。</Text>
        </View>

        <View style={styles.checkPanel}>
          <CheckRow label="饮食完成" value={current.dietDone} onPress={() => updateCheckIn({ dietDone: !current.dietDone })} />
          <CheckRow label="饮水 2400ml 完成" value={current.waterDone} onPress={() => updateCheckIn({ waterDone: !current.waterDone })} />
        </View>

        <Section icon={<Dumbbell color="#2F7A67" size={20} />} title="训练">
          <View style={styles.progressPanel}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>训练进度</Text>
              <Text style={[styles.progressValue, { color: planColor }]}>{trainingProgress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${trainingProgress}%`, backgroundColor: planColor }]} />
            </View>
          </View>
          <View style={styles.trainingTaskList}>
            {plan.trainingTasks.map((task) => (
              <CheckRow
                key={task.id}
                label={`${task.label} +${task.points}%`}
                value={taskState[task.id]}
                onPress={() => updateTrainingTask(task.id)}
              />
            ))}
          </View>
          {plan.training.map((item) => (
            <Text key={item} style={styles.listItem}>
              {item}
            </Text>
          ))}
        </Section>

        <Section icon={<Utensils color="#9B5C2E" size={20} />} title="饮食">
          {plan.meals.map((item) => (
            <Text key={item} style={styles.listItem}>
              {item}
            </Text>
          ))}
        </Section>

        <Section icon={<Droplets color="#4776A6" size={20} />} title="规则提醒">
          {[...globalRules, ...(plan.notes ?? []), ...dailyHabits].map((item) => (
            <Text key={item} style={styles.ruleItem}>
              {item}
            </Text>
          ))}
        </Section>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={completeToday} style={({ pressed }) => [styles.primaryButton, allDone && styles.primaryDone, pressed && styles.buttonPressed]}>
          <Text style={styles.primaryText}>{allDone ? "今日已完整打卡" : "完成今日打卡"}</Text>
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
    backgroundColor: "#F7F5EF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DFD6",
  },
  headerText: {
    flex: 1,
  },
  dateText: {
    color: "#76746D",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  title: {
    color: "#20221F",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 112,
  },
  hero: {
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 14,
  },
  typePill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 14,
  },
  typePillText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  heroTitle: {
    color: "#22241F",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
  },
  heroCopy: {
    color: "#68665F",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    marginTop: 6,
  },
  checkPanel: {
    gap: 9,
    marginBottom: 16,
  },
  progressPanel: {
    borderRadius: 8,
    backgroundColor: "#F7F5EF",
    borderWidth: 1,
    borderColor: "#E4E0D8",
    padding: 12,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  progressLabel: {
    color: "#555750",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800",
  },
  progressValue: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
  },
  progressTrack: {
    height: 10,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#E4E0D8",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  trainingTaskList: {
    gap: 9,
  },
  section: {
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E0D8",
    padding: 15,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#242620",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
  sectionBody: {
    gap: 9,
  },
  listItem: {
    color: "#33352F",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  ruleItem: {
    color: "#585750",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: "rgba(247,245,239,0.96)",
    borderTopWidth: 1,
    borderTopColor: "#E7E2D8",
  },
  primaryButton: {
    height: 54,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F7A67",
  },
  primaryDone: {
    backgroundColor: "#293D35",
  },
  buttonPressed: {
    opacity: 0.82,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
});
