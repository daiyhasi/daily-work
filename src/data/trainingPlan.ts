import { DayPlan, GeneratedPlanProfile, GeneratedPlanDocument, PlanType } from "../types/plan";

export const weekdayLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export const typeLabels: Record<PlanType, string> = {
  cardio: "爬坡有氧",
  strength: "力量 + 有氧",
  recovery: "轻有氧放松",
  rest: "休息日",
};

export const typeColors: Record<PlanType, string> = {
  cardio: "#56D8F5",
  strength: "#C7F64D",
  recovery: "#A58BFF",
  rest: "#89949A",
};

export const globalRules = [
  "点餐标准：去皮鸡腿，米饭一拳，两份烫青菜，卤汁不拌饭。",
  "每日饮水 2400ml，22 点后不再进食，禁酒饮料宵夜。",
  "力量动作全部 4 组，组间休息 60 秒。",
  "力量课后有氧：坡度 6-7，时速 4.2，20 分钟。",
  "力量训练结束 30 分钟内：水煮蛋 2 个（2 蛋白 1 蛋黄）。",
  "有氧日晚间加餐：蛋清 1 个，舍弃蛋黄。",
  "全天蛋黄控制 ≤ 2 个。",
];

export const dailyHabits = [
  "如果后续感觉大便干涩，每天中午沙县的烫青菜多加一份，多喝水，基本可以替代酸奶益生菌的作用。",
  "如果哪天晚上特别想吃酸奶，一周可以安排 1-2 次，不要天天晚上喝即可。",
];

export const weekModifiers: Record<number, string> = {
  2: "第二周进阶：有氧时长 + 5 分钟，力量每组次数 + 2-3 次。",
  3: "第三周进阶：力量课后有氧提升至 25 分钟。",
  4: "第四周进阶：课后有氧 25-30 分钟。",
};

const weekOnePlans: DayPlan[] = [
  {
    week: 1,
    weekday: 1,
    title: "爬坡有氧日",
    type: "cardio",
    training: [
      "热身 5min → 爬坡 25min（12min + 休息 2min + 13min）→ 放松 5min",
      "平板支撑 20-25 秒 x 3 组",
    ],
    trainingTasks: [
      { id: "mon-warmup", label: "热身 5min", points: 10 },
      { id: "mon-climb", label: "爬坡 25min（12min + 休息 2min + 13min）", points: 55 },
      { id: "mon-cooldown", label: "放松 5min", points: 10 },
      { id: "mon-plank", label: "平板支撑 20-25 秒 x 3 组", points: 25 },
    ],
    meals: ["9:15 水煮鸡蛋 2 个", "12:20 鸡腿饭一拳米饭", "18:30 鸡腿饭一拳米饭", "21:10 蛋清 1 个"],
  },
  {
    week: 1,
    weekday: 2,
    title: "力量 + 课后有氧",
    type: "strength",
    training: [
      "靠墙俯卧撑 12-15 次、靠墙静蹲 40 秒、俯身扩肩 20 次、卷腹 15 次、仰卧抬腿 12 次，4 组",
      "课后慢爬坡 20 分钟",
      "练后：水煮蛋 2 个（2 蛋白 1 蛋黄）",
    ],
    trainingTasks: [
      { id: "tue-wall-pushup", label: "靠墙俯卧撑 12-15 次 x 4 组", points: 15 },
      { id: "tue-wall-squat", label: "靠墙静蹲 40 秒 x 4 组", points: 15 },
      { id: "tue-shoulder", label: "俯身扩肩 20 次 x 4 组", points: 15 },
      { id: "tue-crunch", label: "卷腹 15 次 x 4 组", points: 15 },
      { id: "tue-leg-raise", label: "仰卧抬腿 12 次 x 4 组", points: 15 },
      { id: "tue-post-cardio", label: "课后慢爬坡 20 分钟", points: 15 },
      { id: "tue-post-egg", label: "练后水煮蛋 2 个", points: 10 },
    ],
    meals: ["9:15 纯牛奶一盒", "12:20 鸡腿饭一拳米饭", "18:30 鸡腿饭 2/3 拳米饭"],
  },
  {
    week: 1,
    weekday: 3,
    title: "爬坡有氧日",
    type: "cardio",
    training: [
      "热身 5min → 爬坡 28min（14min + 休息 2min + 14min）→ 放松 5min",
      "平板支撑 30 秒 x 3 组",
    ],
    trainingTasks: [
      { id: "wed-warmup", label: "热身 5min", points: 10 },
      { id: "wed-climb", label: "爬坡 28min（14min + 休息 2min + 14min）", points: 55 },
      { id: "wed-cooldown", label: "放松 5min", points: 10 },
      { id: "wed-plank", label: "平板支撑 30 秒 x 3 组", points: 25 },
    ],
    meals: ["9:15 鸡蛋 2 个", "12:20 鸡腿饭一拳米饭", "18:30 鸡腿饭一拳米饭", "21:10 蛋清 1 个"],
  },
  {
    week: 1,
    weekday: 4,
    title: "力量 + 课后有氧",
    type: "strength",
    training: [
      "靠墙俯卧撑 15-18 次、俯身手臂平举 20 次、臀桥 20 次、俄罗斯转体 25 次，4 组",
      "课后慢爬坡 20 分钟",
      "练后：水煮蛋 2 个（2 蛋白 1 蛋黄）",
    ],
    trainingTasks: [
      { id: "thu-wall-pushup", label: "靠墙俯卧撑 15-18 次 x 4 组", points: 18 },
      { id: "thu-arm-raise", label: "俯身手臂平举 20 次 x 4 组", points: 18 },
      { id: "thu-glute-bridge", label: "臀桥 20 次 x 4 组", points: 18 },
      { id: "thu-russian-twist", label: "俄罗斯转体 25 次 x 4 组", points: 18 },
      { id: "thu-post-cardio", label: "课后慢爬坡 20 分钟", points: 18 },
      { id: "thu-post-egg", label: "练后水煮蛋 2 个", points: 10 },
    ],
    meals: ["9:15 纯牛奶一盒", "12:20 鸡腿饭一拳米饭", "18:30 鸡腿饭 2/3 拳米饭"],
  },
  {
    week: 1,
    weekday: 5,
    title: "爬坡有氧日",
    type: "cardio",
    training: ["热身 5min → 爬坡 33min 分段进行 → 放松 5min", "平板支撑 35 秒 x 3 组"],
    trainingTasks: [
      { id: "fri-warmup", label: "热身 5min", points: 10 },
      { id: "fri-climb", label: "爬坡 33min 分段进行", points: 55 },
      { id: "fri-cooldown", label: "放松 5min", points: 10 },
      { id: "fri-plank", label: "平板支撑 35 秒 x 3 组", points: 25 },
    ],
    meals: ["9:15 鸡蛋 2 个", "12:20 鸡腿饭一拳米饭", "18:30 鸡腿饭一拳米饭", "21:10 蛋清 1 个"],
  },
  {
    week: 1,
    weekday: 6,
    title: "轻有氧放松日",
    type: "recovery",
    training: ["坡度 7-8 慢爬坡 30 分钟", "腰腹拉伸 15 分钟"],
    trainingTasks: [
      { id: "sat-climb", label: "坡度 7-8 慢爬坡 30 分钟", points: 70 },
      { id: "sat-stretch", label: "腰腹拉伸 15 分钟", points: 30 },
    ],
    meals: ["9:15 纯牛奶一盒", "12:20 鸡腿饭", "18:30 鸡腿饭半拳米饭"],
  },
  {
    week: 1,
    weekday: 7,
    title: "休息日",
    type: "rest",
    training: ["可散步 40-60 分钟，不正式训练"],
    trainingTasks: [{ id: "sun-walk", label: "散步或主动恢复 40-60 分钟", points: 100 }],
    meals: ["9:15 鸡蛋 2 个", "12:20 鸡腿饭", "18:30 鸡腿饭半拳米饭"],
  },
];

export function clampPlanWeek(week: number) {
  return Math.min(Math.max(week, 1), 4);
}

export function getPlanForWeekday(week: number, weekday: number): DayPlan {
  const safeWeek = clampPlanWeek(week);
  const basePlan = weekOnePlans.find((plan) => plan.weekday === weekday) ?? weekOnePlans[0];
  const notes = [...(basePlan.notes ?? [])];

  if (weekModifiers[safeWeek]) {
    notes.push(weekModifiers[safeWeek]);
  }

  return {
    ...basePlan,
    week: safeWeek,
    notes,
  };
}

export function getWeekPlans(week: number) {
  return weekdayLabels.map((_, index) => getPlanForWeekday(week, index + 1));
}

export function getGeneratedDemoPlanDocument(profile: GeneratedPlanProfile): GeneratedPlanDocument {
  return {
    schemaVersion: "daily-training-plan/v1",
    source: "demo",
    durationWeeks: 4,
    profile,
    globalRules,
    dailyHabits,
    weeks: [1, 2, 3, 4].map((week) => ({
      week,
      theme: week === 1 ? "基础适应周" : `第 ${week} 周进阶`,
      modifier: weekModifiers[week] ?? "基础适应周",
      days: getWeekPlans(week),
    })),
  };
}
