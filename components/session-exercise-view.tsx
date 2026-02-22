"use client";

import { useMutation, useQuery } from "convex/react";
import { Check } from "lucide-react";
import { useCallback, useState } from "react";
import { ProgressionSuggestion } from "@/components/progression-suggestion";
import { SessionSetInput } from "@/components/session-set-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { calculateSuggestion } from "@/lib/progression";

type WorkoutExercise = {
	exercise: Id<"exercises">;
	sets: number;
	repsMin: number;
	repsMax: number;
	restMin: number;
	restMax: number;
};

type SessionExerciseViewProps = {
	logId: Id<"exerciseLogs">;
	exerciseName: string;
	config: WorkoutExercise;
	existingSets?: { number: number; weight: number; reps: number }[];
	isCompleted?: boolean;
	onCompleted: () => void;
};

export function SessionExerciseView({
	logId,
	exerciseName,
	config,
	existingSets,
	isCompleted = false,
	onCompleted,
}: SessionExerciseViewProps) {
	const previousSets = useQuery(api.exerciseLogs.getPreviousWeight, {
		exercise: config.exercise,
	});
	const updateSets = useMutation(api.exerciseLogs.updateSets);

	const [sets, setSets] = useState<{ weight: string; reps: string }[]>(() => {
		if (existingSets && existingSets.length > 0) {
			return existingSets.map((s) => ({
				weight: s.weight > 0 ? String(s.weight) : "",
				reps: s.reps > 0 ? String(s.reps) : "",
			}));
		}
		return Array.from({ length: config.sets }, () => ({
			weight: "",
			reps: "",
		}));
	});
	const [saved, setSaved] = useState(isCompleted);

	const handleWeightChange = useCallback((index: number, value: string) => {
		setSets((prev) => {
			const next = [...prev];
			next[index] = { ...next[index], weight: value };
			return next;
		});
	}, []);

	const handleRepsChange = useCallback((index: number, value: string) => {
		setSets((prev) => {
			const next = [...prev];
			next[index] = { ...next[index], reps: value };
			return next;
		});
	}, []);

	const handleSave = async () => {
		const parsedSets = sets.map((s, i) => ({
			number: i + 1,
			weight: parseFloat(s.weight) || 0,
			reps: parseInt(s.reps, 10) || 0,
		}));

		await updateSets({ id: logId, sets: parsedSets });
		setSaved(true);
	};

	const suggestion =
		previousSets && previousSets.length > 0
			? calculateSuggestion(previousSets, config.repsMin, config.repsMax)
			: null;

	const allFilled = sets.every((s) => s.weight && s.reps);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{exerciseName}</CardTitle>
				<p className="text-xs text-muted-foreground">
					{config.sets}x {config.repsMin}-{config.repsMax} reps &middot;
					Descanso {config.restMin}-{config.restMax}s
				</p>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
					<span className="w-6 text-center">Set</span>
					<span className="text-center">Peso (kg)</span>
					<span className="text-center">Reps</span>
				</div>

				{sets.map((set, i) => (
					<SessionSetInput
						key={i}
						setNumber={i + 1}
						weight={set.weight}
						reps={set.reps}
						previousWeight={previousSets?.[i]?.weight}
						previousReps={previousSets?.[i]?.reps}
						onWeightChange={(v) => handleWeightChange(i, v)}
						onRepsChange={(v) => handleRepsChange(i, v)}
					/>
				))}

				{suggestion && (
					<ProgressionSuggestion
						type={suggestion.type}
						message={suggestion.message}
					/>
				)}

				<div className="flex gap-2 pt-2">
					{!saved ? (
						<Button
							className="flex-1"
							disabled={!allFilled}
							onClick={handleSave}
						>
							<Check className="size-4" />
							Salvar
						</Button>
					) : (
						<Button className="flex-1" onClick={onCompleted}>
							Próximo
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
