import { ArrowLeft, Droplets, Dumbbell, Pencil, Plus, Trash2, Utensils, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CheckRow } from "../components/CheckRow";
import { typeColors, typeLabels, weekdayLabels } from "../data/trainingPlan";
import { createEmptyCheckIn } from "../storage/checkIns";
import { palette } from "../theme";
import { CheckIn, DayPlan, TrainingTask } from "../types/plan";
import { formatChineseDate } from "../utils/date";

type DayPlanScreenProps = {
  date: Date;
  dateKey: string;
  plan: DayPlan;
  globalRules: string[];
  dailyHabits: string[];
  checkIn?: CheckIn;
  onBack: () => void;
  onSave: (checkIn: CheckIn) => void;
  onUpdatePlan: (plan: DayPlan) => void;
};

type TaskEditorState = {
  mode: "create" | "edit";
  task?: TrainingTask;
};

export function DayPlanScreen({ date, dateKey, plan, globalRules, dailyHabits, checkIn, onBack, onSave, onUpdatePlan }: DayPlanScreenProps) {
  const insets = useSafeAreaInsets();
  const [taskEditor, setTaskEditor] = useState<TaskEditorState | null>(null);
  const [taskLabel, setTaskLabel] = useState("");
  const [taskPoints, setTaskPoints] = useState("10");
  const current = checkIn ?? createEmptyCheckIn(dateKey);
  const planColor = typeColors[plan.type];
  const taskState = buildTaskState(plan.trainingTasks, current);
  const trainingProgress = getTrainingProgress(plan.trainingTasks, taskState);
  const doneTaskCount = plan.trainingTasks.filter((task) => taskState[task.id]).length;
  const allDone = trainingProgress === 100 && current.dietDone && current.waterDone;
  const canSaveTask = taskLabel.trim().length > 0 && Number(taskPoints) > 0;

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

  function openCreateTaskEditor() {
    setTaskEditor({ mode: "create" });
    setTaskLabel("");
    setTaskPoints("10");
  }

  function openEditTaskEditor(task: TrainingTask) {
    setTaskEditor({ mode: "edit", task });
    setTaskLabel(task.label);
    setTaskPoints(String(task.points));
  }

  function closeTaskEditor() {
    setTaskEditor(null);
    setTaskLabel("");
    setTaskPoints("10");
  }

  function saveTaskEditor() {
    if (!taskEditor || !canSaveTask) {
      return;
    }

    const label = taskLabel.trim();
    const points = Math.round(Number(taskPoints));

    if (taskEditor.mode === "edit" && taskEditor.task) {
      const nextTasks = plan.trainingTasks.map((task) =>
        task.id === taskEditor.task?.id
          ? {
              ...task,
              label,
              points,
            }
          : task
      );
      onUpdatePlan({
        ...plan,
        trainingTasks: rebalanceTrainingTasks(nextTasks, taskEditor.task.id),
      });
    } else {
      const newTask: TrainingTask = {
        id: `custom-${plan.weekday}-${Date.now()}`,
        label,
        points,
      };
      onUpdatePlan({
        ...plan,
        trainingTasks: rebalanceTrainingTasks([...plan.trainingTasks, newTask], newTask.id),
      });
    }

    closeTaskEditor();
  }

  function deleteTask(taskId: string) {
    if (plan.trainingTasks.length <= 1) {
      return;
    }

    onUpdatePlan({
      ...plan,
      trainingTasks: rebalanceTrainingTasks(plan.trainingTasks.filter((task) => task.id !== taskId)),
    });
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 24) }]}>
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
            <Text style={[styles.typeLabel, { color: planColor }]}>循环周 / {typeLabels[plan.type]}</Text>
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
          <View style={styles.taskTools}>
            <Text style={styles.taskToolsText}>训练项可编辑，积分自动保持 100%</Text>
            <Pressable accessibilityLabel="新增训练项" onPress={openCreateTaskEditor} style={[styles.addTaskButton, { borderColor: `${planColor}88` }]}>
              <Plus color={planColor} size={18} />
            </Pressable>
          </View>
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
                <View style={styles.taskActions}>
                  <Pressable accessibilityLabel="编辑训练项" onPress={() => openEditTaskEditor(task)} style={styles.taskActionButton}>
                    <Pencil color={palette.muted} size={17} />
                  </Pressable>
                  <Pressable
                    accessibilityLabel="删除训练项"
                    disabled={plan.trainingTasks.length <= 1}
                    onPress={() => deleteTask(task.id)}
                    style={[styles.taskActionButton, plan.trainingTasks.length <= 1 && styles.taskActionDisabled]}
                  >
                    <Trash2 color={palette.danger} size={17} />
                  </Pressable>
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

      <Modal visible={Boolean(taskEditor)} transparent animationType="fade" onRequestClose={closeTaskEditor}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{taskEditor?.mode === "edit" ? "编辑训练项" : "新增训练项"}</Text>
                <Text style={styles.modalMeta}>积分会自动重平衡到 100%</Text>
              </View>
              <Pressable accessibilityLabel="关闭编辑弹窗" onPress={closeTaskEditor} style={styles.modalCloseButton}>
                <X color={palette.ink} size={19} />
              </Pressable>
            </View>

            <TextInput
              mode="outlined"
              value={taskLabel}
              onChangeText={setTaskLabel}
              label="训练项"
              placeholder="例如：爬坡 20 分钟"
              style={styles.editorInput}
              outlineStyle={styles.editorInputOutline}
              outlineColor={palette.line}
              activeOutlineColor={planColor}
              textColor={palette.ink}
              placeholderTextColor={palette.quiet}
            />
            <TextInput
              mode="outlined"
              value={taskPoints}
              onChangeText={(value) => setTaskPoints(value.replace(/[^\d]/g, ""))}
              label="本项进度百分比"
              keyboardType="number-pad"
              style={styles.editorInput}
              outlineStyle={styles.editorInputOutline}
              outlineColor={palette.line}
              activeOutlineColor={planColor}
              textColor={palette.ink}
            />

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={closeTaskEditor} style={styles.modalSecondaryButton} labelStyle={styles.modalSecondaryText}>
                取消
              </Button>
              <Button
                mode="contained"
                disabled={!canSaveTask}
                onPress={saveTaskEditor}
                buttonColor={planColor}
                textColor={palette.black}
                style={styles.modalPrimaryButton}
                labelStyle={styles.modalPrimaryText}
              >
                保存
              </Button>
            </View>
          </View>
        </View>
      </Modal>

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

function rebalanceTrainingTasks(tasks: TrainingTask[], lockedTaskId?: string) {
  if (tasks.length === 0) {
    return [];
  }

  if (tasks.length === 1) {
    return [
      {
        ...tasks[0],
        points: 100,
      },
    ];
  }

  const lockedTask = lockedTaskId ? tasks.find((task) => task.id === lockedTaskId) : undefined;
  const lockedPoints = lockedTask ? clampInteger(lockedTask.points, 1, 100 - (tasks.length - 1)) : 0;
  const unlockedTasks = lockedTask ? tasks.filter((task) => task.id !== lockedTaskId) : tasks;
  const targetTotal = lockedTask ? 100 - lockedPoints : 100;
  const normalizedUnlocked = distributePoints(unlockedTasks, targetTotal);

  return tasks.map((task) => {
    if (task.id === lockedTaskId) {
      return {
        ...task,
        points: lockedPoints,
      };
    }

    return normalizedUnlocked.find((item) => item.id === task.id) ?? task;
  });
}

function distributePoints(tasks: TrainingTask[], total: number) {
  if (tasks.length === 0) {
    return [];
  }

  const minTotal = tasks.length;
  const safeTotal = Math.max(total, minTotal);
  const currentTotal = tasks.reduce((sum, task) => sum + Math.max(task.points, 1), 0);
  let remaining = safeTotal;

  const distributed = tasks.map((task, index) => {
    const slotsLeft = tasks.length - index - 1;
    const proportional = currentTotal > 0 ? Math.round((Math.max(task.points, 1) / currentTotal) * safeTotal) : Math.round(safeTotal / tasks.length);
    const points = clampInteger(proportional, 1, remaining - slotsLeft);
    remaining -= points;

    return {
      ...task,
      points,
    };
  });

  if (remaining !== 0) {
    const lastIndex = distributed.length - 1;
    distributed[lastIndex] = {
      ...distributed[lastIndex],
      points: Math.max(1, distributed[lastIndex].points + remaining),
    };
  }

  return distributed;
}

function clampInteger(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(Math.round(value), min), max);
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
  taskTools: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 4,
  },
  taskToolsText: {
    flex: 1,
    color: palette.quiet,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  addTaskButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.charcoal,
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
  taskActions: {
    width: 42,
    gap: 8,
  },
  taskActionButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceRaised,
    borderWidth: 1,
    borderColor: palette.line,
  },
  taskActionDisabled: {
    opacity: 0.35,
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
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.68)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  modalTitle: {
    color: palette.ink,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900",
  },
  modalMeta: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    marginTop: 3,
  },
  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceRaised,
    borderWidth: 1,
    borderColor: palette.line,
  },
  editorInput: {
    marginTop: 10,
    backgroundColor: palette.surfaceRaised,
  },
  editorInputOutline: {
    borderRadius: 18,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  modalSecondaryButton: {
    flex: 1,
    borderColor: palette.line,
  },
  modalSecondaryText: {
    color: palette.ink,
    fontWeight: "900",
  },
  modalPrimaryButton: {
    flex: 1,
  },
  modalPrimaryText: {
    fontWeight: "900",
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
