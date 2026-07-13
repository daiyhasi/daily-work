import { GeneratedPlanProfile, PlanGenerationRequest } from "../types/plan";

export const demoPlanProfile: GeneratedPlanProfile = {
  heightCm: 174,
  weightJin: 156,
  bodyNotes: ["肚子大", "手臂细"],
  abilityNotes: ["力量小", "耐力小", "跑步机爬坡 20 分钟就不行"],
  goal: "健身锻炼身体，先建立稳定运动习惯，逐步提升力量和心肺耐力。",
  currentDiet: "每天两顿沙县鸡腿饭。",
};

export const defaultPlanPrompt = `174，156斤，肚子大，手臂细，力量小，耐力小，跑步机爬坡20分钟就不行了，想要健身锻炼身体，帮我以周为单位列一份详细的健身饮食计划，目前来说饮食已经改成了每天两顿沙县鸡腿饭。`;

const hiddenPlanGenerationInstructions = [
  "只生成 1 个循环周计划，每周 7 天；后续日期由前端按周重复映射，不要展开第 2-4 周。",
  "每天必须包含训练标题、训练类型、训练概览、训练子项、饮食安排和注意事项。",
  "训练子项 points 必须合计 100，用于每日训练进度条。",
  "训练强度从低起步，适合力量和耐力较弱、爬坡 20 分钟已吃力的阶段。",
  "饮食围绕每天两顿沙县鸡腿饭调整，优先控制米饭、卤汁、饮水、蛋白质和青菜。",
  "输出必须符合 daily-training-plan/v1，便于直接映射到日历每日计划。",
];

const planOutputSchema = `{
  "schemaVersion": "daily-training-plan/v1",
  "source": "ai",
  "durationWeeks": 1,
  "profile": {
    "heightCm": 174,
    "weightJin": 156,
    "bodyNotes": ["肚子大", "手臂细"],
    "abilityNotes": ["力量小", "耐力小"],
    "goal": "健身锻炼身体",
    "currentDiet": "每天两顿沙县鸡腿饭"
  },
  "globalRules": ["每日通用规则"],
  "dailyHabits": ["日常小习惯"],
  "weeks": [{
    "week": 1,
    "theme": "循环基础周",
    "modifier": "这一周会按自然周循环重复执行",
    "days": [{
      "week": 1,
      "weekday": 1,
      "title": "爬坡有氧日",
      "type": "cardio",
      "training": ["训练概览文字"],
      "trainingTasks": [
        { "id": "w1d1-warmup", "label": "热身 5min", "points": 10 }
      ],
      "meals": ["12:20 去皮鸡腿饭，米饭一拳"],
      "notes": ["当天注意事项"]
    }]
  }]
}`;

export function buildPlanGenerationRequest(userPrompt: string): PlanGenerationRequest {
  const normalizedPrompt = userPrompt.trim() || defaultPlanPrompt;

  return {
    userPrompt: normalizedPrompt,
    hiddenInstructions: hiddenPlanGenerationInstructions,
    responseSchema: planOutputSchema,
  };
}
