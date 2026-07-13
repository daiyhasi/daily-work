# Frontend Handoff: Connect Online Plan Generation

## 当前线上接口

后台已部署，前端 API Base URL：

```bash
EXPO_PUBLIC_PLAN_API_URL=http://121.41.23.136/daily-work-api
```

不要加尾部 `/`。当前前端会请求：

```ts
fetch(`${PLAN_API_URL}/plans/generate`, ...)
```

所以最终地址是：

```text
POST http://121.41.23.136/daily-work-api/plans/generate
```

健康检查：

```bash
curl http://121.41.23.136/daily-work-api/health
```

期望返回：

```json
{"ok":true}
```

## Expo 环境变量

在前端工程根目录创建本地环境文件：

```bash
cat > .env.local <<'EOF'
EXPO_PUBLIC_PLAN_API_URL=http://121.41.23.136/daily-work-api
EOF
```

然后重启 Expo：

```bash
npx expo start --clear
```

Expo 官方环境变量规则：只有 `EXPO_PUBLIC_` 前缀变量会进入客户端 JS bundle，`.env` / `.env.local` 会由 Expo CLI 加载。客户端内的 URL 属于公开配置，不要放服务端密钥。

参考：<https://docs.expo.dev/guides/environment-variables/>

## 现在前端已经具备的能力

已有调用链：

- `src/screens/PlanOverviewScreen.tsx`
- `src/api/planGeneration.ts`
- `src/data/planGenerationDemo.ts`
- `src/types/plan.ts`

点击「生成计划」时，`PlanOverviewScreen` 会：

1. 保存用户 prompt 到 `AsyncStorage`
2. 调用 `generatePlanFromPrompt(savedPrompt)`
3. 如果 `EXPO_PUBLIC_PLAN_API_URL` 存在，请求线上后台
4. 如果环境变量不存在，回退本地 mock plan

## 当前还没真正接入的地方

线上请求成功后，前端目前只显示：

```text
已从后台生成训练计划。
```

但是返回的 `GeneratedPlanDocument` 没有被持久化，也没有驱动日历和每日详情。

这些地方仍在使用本地固定计划：

- `App.tsx`：选中日期后仍调用 `getPlanForWeekday(...)`
- `src/screens/CalendarScreen.tsx`：今日卡片、周视图、月历标记仍调用 `getPlanForWeekday(...)`
- `src/screens/PlanOverviewScreen.tsx`：循环周预览使用 `getWeekPlansFromDocument(...)`
- `src/screens/DayPlanScreen.tsx`：规则提醒仍使用本地 `globalRules` / `dailyHabits`

## 推荐改造顺序

### 1. 新增计划存储

新增：

```text
src/storage/generatedPlan.ts
```

建议 API：

```ts
const GENERATED_PLAN_KEY = "daily-work:generated-plan";

export async function getGeneratedPlan(): Promise<GeneratedPlanDocument | null>;
export async function saveGeneratedPlan(plan: GeneratedPlanDocument): Promise<void>;
export async function clearGeneratedPlan(): Promise<void>;
```

读取时要 `try/catch JSON.parse`，格式不对直接返回 `null`。

### 2. 新增计划查询 helper

建议在 `src/data/trainingPlan.ts` 或新文件 `src/data/planDocument.ts` 增加：

```ts
export function getPlanForWeekdayFromDocument(
  document: GeneratedPlanDocument | null,
  week: number,
  weekday: number
): DayPlan;

export function getWeekPlansFromDocument(
  document: GeneratedPlanDocument | null,
  week: number
): DayPlan[];
```

逻辑：

- 如果存在 AI plan，就从 `document.weeks` 查对应 week/day
- 查不到时 fallback 到现有 `getPlanForWeekday(...)`
- 保留 demo 计划作为兜底，避免坏数据导致页面崩溃

### 3. App 顶层加载 active plan

`App.tsx` 增加状态：

```ts
const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlanDocument | null>(null);
```

启动时和 check-in 一起加载：

```ts
const [storedCycleStart, storedCheckIns, storedPlan] = await Promise.all([
  getOrCreateCycleStart(),
  getAllCheckIns(),
  getGeneratedPlan(),
]);
```

传给页面：

- `CalendarScreen generatedPlan={generatedPlan}`
- `PlanOverviewScreen generatedPlan={generatedPlan} onGeneratedPlan={setGeneratedPlan}`
- `DayPlanScreen` 的 `plan` 改用 helper 从 `generatedPlan` 取

### 4. 生成成功后保存并刷新 UI

`PlanOverviewScreen.handleGeneratePlan()` 里，拿到结果后：

```ts
await saveGeneratedPlan(result.plan);
onGeneratedPlan(result.plan);
```

然后循环周预览使用 `generatedPlan` 渲染，而不是固定 `getWeekPlans(week)`。

### 5. CalendarScreen 改为接收计划源

`CalendarScreen` props 增加：

```ts
generatedPlan: GeneratedPlanDocument | null;
```

所有 `getPlanForWeekday(position.week, position.weekday)` 改成：

```ts
getPlanForWeekdayFromDocument(generatedPlan, position.week, position.weekday)
```

### 6. DayPlanScreen 使用动态规则

现在 `DayPlanScreen` 直接引用本地：

```ts
globalRules
dailyHabits
```

建议改为 props：

```ts
globalRules: string[];
dailyHabits: string[];
```

从 `generatedPlan` 传入；没有 AI plan 时 fallback 本地规则。

## 注意事项

- 后台只需要生成 1 个完整循环周，前端会按自然周重复映射到后续日期。
- 生成新计划后，旧 check-in 的 `trainingTaskDone` 可能引用旧任务 id。简单方案是保留饮食/饮水/总训练完成状态，但新任务细项从空开始。
- `src/api/planGeneration.ts` 现在只用 status 抛错，建议后续解析后台 `{ message }`，展示更友好的错误。
- 线上 URL 是公开客户端配置；OpenAI key 只在服务器 `.env`，不要放进 Expo 环境变量。

## 最小验收

1. `.env.local` 配置 `EXPO_PUBLIC_PLAN_API_URL`
2. 重启 Expo
3. 打开「计划」Tab
4. 修改 prompt 后点「生成计划」
5. 生成成功后退出/重进 App，计划仍应显示 AI 返回内容
6. 日历今日卡片、月历标记、每日详情应全部使用同一份 AI plan
