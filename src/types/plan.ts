export type PlanType = "cardio" | "strength" | "recovery" | "rest";

export type TrainingTask = {
  id: string;
  label: string;
  points: number;
};

export type DayPlan = {
  week: number;
  weekday: number;
  title: string;
  type: PlanType;
  training: string[];
  trainingTasks: TrainingTask[];
  meals: string[];
  notes?: string[];
};

export type CheckIn = {
  date: string;
  trainingDone: boolean;
  trainingTaskDone?: Record<string, boolean>;
  dietDone: boolean;
  waterDone: boolean;
  note?: string;
};

export type CheckInMap = Record<string, CheckIn>;

export type AppTab = "calendar" | "plan";

export type GeneratedPlanProfile = {
  heightCm: number;
  weightJin: number;
  bodyNotes: string[];
  abilityNotes: string[];
  goal: string;
  currentDiet: string;
};

export type GeneratedPlanWeek = {
  week: number;
  theme: string;
  modifier?: string;
  days: DayPlan[];
};

export type GeneratedPlanDocument = {
  schemaVersion: "daily-training-plan/v1";
  source: "demo" | "ai";
  durationWeeks: number;
  profile: GeneratedPlanProfile;
  globalRules: string[];
  dailyHabits: string[];
  weeks: GeneratedPlanWeek[];
};

export type PlanGenerationRequest = {
  userPrompt: string;
  hiddenInstructions: string[];
  responseSchema: string;
};

export type PlanGenerationResult = {
  plan: GeneratedPlanDocument;
  usedMock: boolean;
};
