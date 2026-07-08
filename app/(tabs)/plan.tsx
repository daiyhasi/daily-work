import { PlanOverviewScreen } from "../../src/screens/PlanOverviewScreen";
import { AppLoadingView, useAppData } from "../../src/state/AppDataContext";

export default function PlanRoute() {
  const { generatedPlan, activateGeneratedPlan, loading } = useAppData();

  if (loading) {
    return <AppLoadingView />;
  }

  return <PlanOverviewScreen generatedPlan={generatedPlan} onActivateGeneratedPlan={activateGeneratedPlan} />;
}
