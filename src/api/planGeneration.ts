import { buildPlanGenerationRequest, demoPlanProfile } from "../data/planGenerationDemo";
import { getGeneratedDemoPlanDocument } from "../data/trainingPlan";
import { GeneratedPlanDocument, PlanGenerationResult } from "../types/plan";

const PLAN_API_URL = process.env.EXPO_PUBLIC_PLAN_API_URL;

export async function generatePlanFromPrompt(userPrompt: string): Promise<PlanGenerationResult> {
  const requestBody = buildPlanGenerationRequest(userPrompt);

  if (!PLAN_API_URL) {
    return {
      plan: getGeneratedDemoPlanDocument(demoPlanProfile),
      usedMock: true,
    };
  }

  const response = await fetch(`${PLAN_API_URL}/plans/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(await getPlanGenerationErrorMessage(response));
  }

  const plan = (await response.json()) as GeneratedPlanDocument;
  assertGeneratedPlan(plan);

  return {
    plan,
    usedMock: false,
  };
}

async function getPlanGenerationErrorMessage(response: Response) {
  try {
    const error = (await response.json()) as { message?: string };
    return error.message ? `计划生成失败：${error.message}` : `计划生成失败：${response.status}`;
  } catch {
    return `计划生成失败：${response.status}`;
  }
}

function assertGeneratedPlan(plan: GeneratedPlanDocument) {
  if (plan.schemaVersion !== "daily-training-plan/v1") {
    throw new Error("计划格式不匹配");
  }

  if (!Array.isArray(plan.weeks) || plan.weeks.length === 0) {
    throw new Error("计划缺少周数据");
  }
}
