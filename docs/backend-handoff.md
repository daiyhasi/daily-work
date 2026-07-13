# Backend Handoff: AI Training Plan Generation

## Summary

The mobile app currently supports local calendar check-in, fixed demo training plans, editable user prompts, and a mock plan-generation flow.

Backend v1 only needs to provide one endpoint that accepts a user prompt plus hidden formatting instructions, calls an AI model, validates the result, and returns a structured plan document matching `daily-training-plan/v1`.

Frontend integration point:

```ts
EXPO_PUBLIC_PLAN_API_URL=https://your-api-domain.com
POST /plans/generate
```

If `EXPO_PUBLIC_PLAN_API_URL` is not set, the app uses a local mock plan.

## Required Endpoint

### `POST /plans/generate`

Generate a 1-week training and diet plan from a user prompt. The frontend maps future dates by repeating this week as a weekly loop.

Request body:

```ts
type PlanGenerationRequest = {
  userPrompt: string;
  hiddenInstructions: string[];
  responseSchema: string;
};
```

Expected behavior:

- Use `userPrompt` as the editable user input.
- Treat `hiddenInstructions` and `responseSchema` as system/developer constraints.
- Return JSON only, with no markdown wrapper.
- Return a complete `GeneratedPlanDocument`.
- Ensure every training day includes `trainingTasks` whose `points` total exactly `100`.

Success response:

```ts
type GeneratedPlanDocument = {
  schemaVersion: "daily-training-plan/v1";
  source: "ai";
  durationWeeks: number;
  profile: GeneratedPlanProfile;
  globalRules: string[];
  dailyHabits: string[];
  weeks: GeneratedPlanWeek[];
};

type GeneratedPlanProfile = {
  heightCm: number;
  weightJin: number;
  bodyNotes: string[];
  abilityNotes: string[];
  goal: string;
  currentDiet: string;
};

type GeneratedPlanWeek = {
  week: number;
  theme: string;
  modifier?: string;
  days: DayPlan[];
};

type DayPlan = {
  week: number;
  weekday: number;
  title: string;
  type: "cardio" | "strength" | "recovery" | "rest";
  training: string[];
  trainingTasks: TrainingTask[];
  meals: string[];
  notes?: string[];
};

type TrainingTask = {
  id: string;
  label: string;
  points: number;
};
```

Minimal example:

```json
{
  "schemaVersion": "daily-training-plan/v1",
  "source": "ai",
  "durationWeeks": 1,
  "profile": {
    "heightCm": 174,
    "weightJin": 156,
    "bodyNotes": ["肚子大", "手臂细"],
    "abilityNotes": ["力量小", "耐力小", "跑步机爬坡 20 分钟吃力"],
    "goal": "健身锻炼身体",
    "currentDiet": "每天两顿沙县鸡腿饭"
  },
  "globalRules": ["每日饮水 2400ml。"],
  "dailyHabits": ["训练后记录完成情况。"],
  "weeks": [
    {
      "week": 1,
      "theme": "循环基础周",
      "modifier": "从低强度开始，每周循环重复。",
      "days": [
        {
          "week": 1,
          "weekday": 1,
          "title": "爬坡有氧日",
          "type": "cardio",
          "training": ["热身 5min -> 爬坡 15min -> 放松 5min"],
          "trainingTasks": [
            { "id": "w1d1-warmup", "label": "热身 5min", "points": 15 },
            { "id": "w1d1-climb", "label": "爬坡 15min", "points": 70 },
            { "id": "w1d1-cooldown", "label": "放松 5min", "points": 15 }
          ],
          "meals": ["12:20 去皮鸡腿饭，米饭一拳，两份青菜"],
          "notes": ["如果爬坡吃力，拆成 8min + 休息 2min + 7min。"]
        }
      ]
    }
  ]
}
```

## Validation Rules

Backend should validate before returning:

- `schemaVersion` must be `daily-training-plan/v1`.
- `source` must be `ai`.
- `durationWeeks` should be `1` for v1.
- `weeks.length` should be `1`; do not expand week 2-4.
- The single week should contain 7 days.
- `weekday` must be `1` to `7`, Monday first.
- `type` must be one of `cardio`, `strength`, `recovery`, `rest`.
- Every `trainingTasks` array must be non-empty.
- `trainingTasks[].points` must sum to exactly `100` per day.
- `trainingTasks[].id` should be stable and unique within the day.
- Text fields should be Chinese for the current app.

If AI output fails validation, backend should retry once with a repair prompt. If it still fails, return an error.

## Error Contract

Recommended error response:

```json
{
  "code": "PLAN_GENERATION_FAILED",
  "message": "计划生成失败，请稍后重试。"
}
```

Recommended status codes:

- `400`: invalid request body or empty prompt
- `429`: rate limit
- `500`: AI call failed
- `502`: AI returned invalid structure after repair

The frontend currently treats non-2xx responses as generation failure and displays the error message if available later.

## Backend Responsibilities

Required for v1:

- Expose `POST /plans/generate`.
- Call AI model with the user prompt and hidden formatting constraints.
- Parse AI output as JSON.
- Validate and repair output.
- Return `GeneratedPlanDocument`.
- Add basic timeout, retry, and rate limiting.
- Log request id, latency, model, validation result, and error code.

Optional later:

- Persist generated plans per user.
- Add user auth.
- Add plan history and regenerate-by-week.
- Add streaming generation.
- Add moderation/safety checks for extreme diet or unsafe exercise suggestions.
- Add admin prompt versioning.

## Frontend Notes

Current frontend API client:

```ts
src/api/planGeneration.ts
```

Current request builder:

```ts
src/data/planGenerationDemo.ts
```

To connect real backend, set:

```bash
EXPO_PUBLIC_PLAN_API_URL=https://your-api-domain.com
```

No frontend code change should be required if the backend follows this contract.
