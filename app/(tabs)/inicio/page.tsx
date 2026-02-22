import { MetricsSection } from "./metrics-section";
import { WorkoutSection } from "./workout-section";

export default function InicioPage() {
	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-lg font-semibold tracking-tight">Início</h1>
			<MetricsSection />
			<WorkoutSection />
		</div>
	);
}
