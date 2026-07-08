import { Settings } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";

import { generatePlanFromPrompt } from "../api/planGeneration";
import { defaultPlanPrompt } from "../data/planGenerationDemo";
import { dailyHabits, getWeekPlans, globalRules, typeColors, typeLabels, weekdayLabels, weekModifiers } from "../data/trainingPlan";
import { getPlanPrompt, savePlanPrompt } from "../storage/planPrompt";
import { palette } from "../theme";

export function PlanOverviewScreen() {
  const [prompt, setPrompt] = useState(defaultPlanPrompt);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [generationState, setGenerationState] = useState<"idle" | "loading" | "mocked" | "generated" | "error">("idle");
  const [generationMessage, setGenerationMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    getPlanPrompt().then((storedPrompt) => {
      if (mounted) {
        setPrompt(storedPrompt);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSavePrompt() {
    const savedPrompt = await savePlanPrompt(prompt);
    setPrompt(savedPrompt);
    setSaveState("saved");
  }

  async function handleGeneratePlan() {
    setGenerationState("loading");
    setGenerationMessage("");

    try {
      const savedPrompt = await savePlanPrompt(prompt);
      const result = await generatePlanFromPrompt(savedPrompt);
      setPrompt(savedPrompt);
      setSaveState("saved");
      setGenerationState(result.usedMock ? "mocked" : "generated");
      setGenerationMessage(result.usedMock ? "后台未配置，已使用本地 Demo 计划。" : "已从后台生成训练计划。");
    } catch (error) {
      setGenerationState("error");
      setGenerationMessage(error instanceof Error ? error.message : "计划生成失败");
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>plan studio</Text>
          <Text style={styles.title}>四周训练计划</Text>
        </View>
        <View style={styles.settingsSlot}>
          <Settings color={palette.muted} size={21} />
        </View>
      </View>

      <View style={styles.aiPanel}>
        <View style={styles.aiPanelHeader}>
          <Text style={styles.aiKicker}>AI 生成 Demo</Text>
          <Text style={styles.saveStateText}>{saveState === "saved" ? "已保存" : "可编辑"}</Text>
        </View>
        <Text style={styles.panelTitle}>计划提示词</Text>
        <TextInput
          mode="outlined"
          multiline
          value={prompt}
          onChangeText={(value) => {
            setPrompt(value);
            setSaveState("idle");
          }}
          placeholder="输入你的身体情况、目标、饮食习惯和训练偏好"
          style={styles.promptInput}
          outlineStyle={styles.promptOutline}
          textAlignVertical="top"
        />
        <View style={styles.actionRow}>
          <Button mode="outlined" onPress={handleSavePrompt} style={styles.secondaryButton} labelStyle={styles.secondaryButtonText}>
            保存
          </Button>
          <Button
            mode="contained"
            disabled={generationState === "loading"}
            loading={generationState === "loading"}
            onPress={handleGeneratePlan}
            buttonColor={palette.charcoal}
            textColor={palette.lime}
            style={styles.generateButton}
            labelStyle={styles.generateButtonText}
          >
            {generationState === "loading" ? "生成中..." : "生成计划"}
          </Button>
        </View>
        {generationMessage ? (
          <Text style={[styles.generationMessage, generationState === "error" && styles.errorMessage]}>{generationMessage}</Text>
        ) : null}
      </View>

      <View style={styles.rulesPanel}>
        <Text style={styles.panelTitle}>每日标准</Text>
        {globalRules.map((rule) => (
          <Text key={rule} style={styles.ruleText}>
            {rule}
          </Text>
        ))}
      </View>

      {[1, 2, 3, 4].map((week) => (
        <View key={week} style={styles.weekSection}>
          <View style={styles.weekHeading}>
            <Text style={styles.weekTitle}>第 {week} 周</Text>
            <Text style={styles.weekModifier}>{weekModifiers[week] ?? "基础适应周"}</Text>
          </View>

          <View style={styles.dayList}>
            {getWeekPlans(week).map((plan) => (
              <View key={`${week}-${plan.weekday}`} style={styles.dayCard}>
                <View style={[styles.typeBar, { backgroundColor: typeColors[plan.type] }]} />
                <View style={styles.dayContent}>
                  <Text style={styles.dayTitle}>
                    {weekdayLabels[plan.weekday - 1]} · {plan.title}
                  </Text>
                  <Text style={styles.dayType}>{typeLabels[plan.type]}</Text>
                  <Text style={styles.dayPreview} numberOfLines={2}>
                    {plan.training.join("；")}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.rulesPanel}>
        <Text style={styles.panelTitle}>日常小习惯</Text>
        {dailyHabits.map((habit) => (
          <Text key={habit} style={styles.ruleText}>
            {habit}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 112,
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
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "800",
  },
  settingsSlot: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceRaised,
    borderWidth: 1,
    borderColor: palette.line,
  },
  aiPanel: {
    borderRadius: 24,
    backgroundColor: "#E9EFD3",
    borderWidth: 1,
    borderColor: "#D5DDAF",
    padding: 15,
    marginBottom: 16,
  },
  aiPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  aiKicker: {
    color: palette.moss,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  saveStateText: {
    color: palette.moss,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  promptInput: {
    minHeight: 176,
    backgroundColor: palette.surfaceRaised,
    color: palette.ink,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    paddingHorizontal: 12,
  },
  promptOutline: {
    borderRadius: 18,
    borderColor: "#C5CF96",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  secondaryButton: {
    width: 92,
    borderRadius: 14,
    borderColor: palette.moss,
  },
  generateButton: {
    flex: 1,
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: palette.moss,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900",
  },
  generateButtonText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900",
  },
  generationMessage: {
    color: palette.moss,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    marginTop: 10,
  },
  errorMessage: {
    color: palette.danger,
  },
  rulesPanel: {
    borderRadius: 20,
    backgroundColor: palette.surfaceRaised,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 15,
    marginBottom: 16,
  },
  panelTitle: {
    color: palette.ink,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    marginBottom: 10,
  },
  ruleText: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    marginBottom: 8,
  },
  weekSection: {
    marginBottom: 20,
  },
  weekHeading: {
    marginBottom: 10,
  },
  weekTitle: {
    color: palette.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
  },
  weekModifier: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 3,
  },
  dayList: {
    gap: 9,
  },
  dayCard: {
    minHeight: 92,
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: palette.surfaceRaised,
    borderWidth: 1,
    borderColor: palette.line,
  },
  typeBar: {
    width: 5,
  },
  dayContent: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  dayTitle: {
    color: palette.ink,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  dayType: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  dayPreview: {
    color: "#4E514B",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 5,
  },
});
