import { Cpu, Settings, Sparkles } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { generatePlanFromPrompt } from "../api/planGeneration";
import { FloatingHeader } from "../components/FloatingHeader";
import {
  getDailyHabitsFromDocument,
  getGlobalRulesFromDocument,
  getWeekModifierFromDocument,
  getWeekPlansFromDocument,
} from "../data/planDocument";
import { defaultPlanPrompt } from "../data/planGenerationDemo";
import { typeColors, typeLabels, weekdayLabels, weeklyCycleModifier } from "../data/trainingPlan";
import { getPlanPrompt, savePlanPrompt } from "../storage/planPrompt";
import { palette } from "../theme";
import { GeneratedPlanDocument } from "../types/plan";

type PlanOverviewScreenProps = {
  generatedPlan: GeneratedPlanDocument | null;
  onActivateGeneratedPlan: (plan: GeneratedPlanDocument) => Promise<void>;
};

export function PlanOverviewScreen({ generatedPlan, onActivateGeneratedPlan }: PlanOverviewScreenProps) {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [prompt, setPrompt] = useState(defaultPlanPrompt);
  const [previewPlan, setPreviewPlan] = useState<GeneratedPlanDocument | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [generationState, setGenerationState] = useState<"idle" | "loading" | "mocked" | "generated" | "error">("idle");
  const [generationMessage, setGenerationMessage] = useState("");
  const visiblePlan = previewPlan ?? generatedPlan;
  const visibleGlobalRules = getGlobalRulesFromDocument(visiblePlan);
  const visibleDailyHabits = getDailyHabitsFromDocument(visiblePlan);
  const isPreviewing = Boolean(previewPlan);
  const visibleWeeks = [1];

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

  function handleClearPrompt() {
    setPrompt("");
    setSaveState("idle");
    setGenerationMessage("");
  }

  function handleResetPrompt() {
    setPrompt(defaultPlanPrompt);
    setSaveState("idle");
    setGenerationMessage("");
  }

  async function handleGeneratePlan() {
    setGenerationState("loading");
    setGenerationMessage("");

    try {
      const savedPrompt = await savePlanPrompt(prompt);
      const result = await generatePlanFromPrompt(savedPrompt);
      setPrompt(savedPrompt);
      setSaveState("saved");
      setPreviewPlan(result.plan);
      setGenerationState(result.usedMock ? "mocked" : "generated");
      setGenerationMessage(result.usedMock ? "已生成本地 Demo 预览，确认替换后生效。" : "已生成线上计划预览，确认替换后生效。");
    } catch (error) {
      setGenerationState("error");
      setGenerationMessage(error instanceof Error ? error.message : "计划生成失败");
    }
  }

  async function handleActivatePreviewPlan() {
    if (!previewPlan) {
      return;
    }

    await onActivateGeneratedPlan(previewPlan);
    setPreviewPlan(null);
    setGenerationState("generated");
    setGenerationMessage("已替换当前生效计划。");
  }

  return (
    <View style={styles.screen}>
      <FloatingHeader
        title="PLAN LAB"
        subtitle={isPreviewing ? "预览计划待确认" : generatedPlan ? "线上计划" : "Demo 计划"}
        scrollY={scrollY}
        rightSlot={
          <View style={styles.compactSettingsSlot}>
            <Settings color={palette.ink} size={18} />
          </View>
        }
      />
      <Animated.ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 10, 28) }]}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>PLAN LAB</Text>
            <Text style={styles.subBrand}>{isPreviewing ? "预览计划待确认" : generatedPlan ? "当前使用线上计划" : "当前使用 Demo 计划"}</Text>
          </View>
          <View style={styles.settingsSlot}>
            <Settings color={palette.ink} size={21} />
          </View>
        </View>

        <View style={styles.console}>
        <View style={styles.consoleTop}>
          <View style={styles.consoleIcon}>
            <Cpu color={palette.black} size={22} />
          </View>
          <View style={styles.consoleTitleWrap}>
            <Text style={styles.consoleTitle}>生成控制台</Text>
            <Text style={styles.consoleMeta}>{saveState === "saved" ? "提示词已保存" : "用户输入可编辑"}</Text>
          </View>
          <Sparkles color={palette.lime} size={22} />
        </View>

        <TextInput
          mode="outlined"
          multiline
          value={prompt}
          onChangeText={(value) => {
            setPrompt(value);
            setSaveState("idle");
          }}
          placeholder="输入身体情况、训练目标、饮食习惯和限制"
          style={styles.promptInput}
          contentStyle={styles.promptContent}
          outlineStyle={styles.promptOutline}
          outlineColor={palette.line}
          activeOutlineColor={palette.lime}
          textColor={palette.ink}
          placeholderTextColor={palette.quiet}
          textAlignVertical="top"
        />

        <View style={styles.utilityRow}>
          <Button mode="outlined" onPress={handleClearPrompt} style={styles.utilityButton} labelStyle={styles.utilityButtonText}>
            清空
          </Button>
          <Button mode="outlined" onPress={handleResetPrompt} style={styles.utilityButton} labelStyle={styles.utilityButtonText}>
            重置
          </Button>
        </View>

        <View style={styles.actionRow}>
          <Button mode="outlined" onPress={handleSavePrompt} style={styles.secondaryButton} labelStyle={styles.secondaryButtonText}>
            保存
          </Button>
          <Button
            mode="contained"
            disabled={generationState === "loading"}
            loading={generationState === "loading"}
            onPress={handleGeneratePlan}
            buttonColor={palette.lime}
            textColor={palette.black}
            style={styles.generateButton}
            labelStyle={styles.generateButtonText}
          >
            {generationState === "loading" ? "生成中..." : "生成计划"}
          </Button>
        </View>
        {generationMessage ? (
          <Text style={[styles.generationMessage, generationState === "error" && styles.errorMessage]}>{generationMessage}</Text>
        ) : null}
        {previewPlan ? (
          <View style={styles.previewPanel}>
            <Text style={styles.previewTitle}>新计划预览中</Text>
            <Text style={styles.previewText}>下方循环周内容来自刚生成的新计划。替换前，日历和每日详情仍使用当前生效计划。</Text>
            <View style={styles.previewActions}>
              <Button mode="outlined" onPress={() => setPreviewPlan(null)} style={styles.discardButton} labelStyle={styles.secondaryButtonText}>
                放弃预览
              </Button>
              <Button
                mode="contained"
                onPress={handleActivatePreviewPlan}
                buttonColor={palette.lime}
                textColor={palette.black}
                style={styles.activateButton}
                labelStyle={styles.generateButtonText}
              >
                替换当前计划
              </Button>
            </View>
          </View>
        ) : null}
      </View>

        <View style={styles.ruleDeck}>
        <Text style={styles.deckTitle}>每日标准</Text>
        <View style={styles.ruleGrid}>
          {visibleGlobalRules.map((rule) => (
            <View key={rule} style={styles.ruleTile}>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>
      </View>

        {visibleWeeks.map((week) => (
        <View key={week} style={styles.weekSection}>
          <View style={styles.weekHeading}>
            <View>
              <Text style={styles.weekTitle}>WEEKLY LOOP</Text>
              <Text style={styles.weekModifier}>{getWeekModifierFromDocument(visiblePlan, week, weeklyCycleModifier)}</Text>
            </View>
            <Text style={styles.weekCount}>7 DAYS</Text>
          </View>

          <View style={styles.dayList}>
            {getWeekPlansFromDocument(visiblePlan, week).map((plan) => (
              <View key={`${week}-${plan.weekday}`} style={styles.dayCard}>
                <View style={styles.dayLeft}>
                  <Text style={[styles.dayWeekday, { color: typeColors[plan.type] }]}>{weekdayLabels[plan.weekday - 1]}</Text>
                  <View style={[styles.typePill, { borderColor: `${typeColors[plan.type]}77` }]}>
                    <Text style={[styles.typePillText, { color: typeColors[plan.type] }]}>{typeLabels[plan.type]}</Text>
                  </View>
                </View>
                <View style={styles.dayContent}>
                  <Text style={styles.dayTitle}>{plan.title}</Text>
                  <Text style={styles.dayPreview} numberOfLines={2}>
                    {plan.training.join("；")}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

        <View style={styles.ruleDeck}>
          <Text style={styles.deckTitle}>日常小习惯</Text>
          {visibleDailyHabits.map((habit) => (
            <Text key={habit} style={styles.habitText}>
              {habit}
            </Text>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  brand: {
    color: palette.ink,
    fontSize: 31,
    lineHeight: 36,
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
  settingsSlot: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceRaised,
    borderWidth: 1,
    borderColor: palette.line,
  },
  compactSettingsSlot: {
    width: 34,
    height: 34,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(24,32,37,0.68)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  console: {
    borderRadius: 32,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: "rgba(199,246,77,0.32)",
    padding: 16,
    marginBottom: 16,
  },
  consoleTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  consoleIcon: {
    width: 42,
    height: 42,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.lime,
  },
  consoleTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  consoleTitle: {
    color: palette.ink,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
  },
  consoleMeta: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    marginTop: 2,
  },
  promptInput: {
    minHeight: 178,
    backgroundColor: palette.charcoal,
    color: palette.ink,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
  promptContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  promptOutline: {
    borderRadius: 22,
    borderColor: palette.line,
  },
  utilityRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  utilityButton: {
    flex: 1,
    borderRadius: 18,
    borderColor: palette.line,
    backgroundColor: palette.surfaceRaised,
  },
  utilityButtonText: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  secondaryButton: {
    width: 96,
    borderRadius: 18,
    borderColor: palette.line,
  },
  generateButton: {
    flex: 1,
    borderRadius: 18,
  },
  secondaryButtonText: {
    color: palette.ink,
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
    color: palette.lime,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
    marginTop: 10,
  },
  errorMessage: {
    color: palette.danger,
  },
  previewPanel: {
    borderRadius: 22,
    backgroundColor: palette.charcoal,
    borderWidth: 1,
    borderColor: "rgba(199,246,77,0.28)",
    padding: 13,
    marginTop: 12,
  },
  previewTitle: {
    color: palette.lime,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  previewText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    marginTop: 5,
  },
  previewActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  discardButton: {
    width: 112,
    borderRadius: 18,
    borderColor: palette.line,
  },
  activateButton: {
    flex: 1,
    borderRadius: 18,
  },
  ruleDeck: {
    borderRadius: 28,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 15,
    marginBottom: 16,
  },
  deckTitle: {
    color: palette.ink,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    marginBottom: 12,
  },
  ruleGrid: {
    gap: 9,
  },
  ruleTile: {
    borderRadius: 18,
    backgroundColor: palette.surfaceRaised,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 12,
  },
  ruleText: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  weekSection: {
    marginBottom: 20,
  },
  weekHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  weekTitle: {
    color: palette.ink,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "900",
  },
  weekModifier: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    marginTop: 3,
  },
  weekCount: {
    color: palette.quiet,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  dayList: {
    gap: 9,
  },
  dayCard: {
    minHeight: 102,
    flexDirection: "row",
    borderRadius: 24,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 12,
    gap: 12,
  },
  dayLeft: {
    width: 74,
    justifyContent: "space-between",
  },
  dayWeekday: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
  },
  typePill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typePillText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  dayContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  dayTitle: {
    color: palette.ink,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  dayPreview: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    marginTop: 6,
  },
  habitText: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
});
