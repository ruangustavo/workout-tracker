import { ExerciseForm } from "@/components/exercise-form";
import { ExerciseList } from "./exercise-list";

export default function ExerciciosPage() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-lg font-semibold tracking-tight">Exercícios</h1>
				<ExerciseForm />
			</div>
			<ExerciseList />
		</div>
	);
}
