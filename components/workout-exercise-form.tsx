"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export interface WorkoutExerciseData {
	exerciseId: string;
	exerciseName: string;
	sets: number;
	repsMin: number;
	repsMax: number;
	restMin: number;
	restMax: number;
}

interface WorkoutExerciseFormProps {
	data: WorkoutExerciseData;
	onChange: (data: WorkoutExerciseData) => void;
	onRemove: () => void;
}

export function WorkoutExerciseForm({
	data,
	onChange,
	onRemove,
}: WorkoutExerciseFormProps) {
	function handleChange(field: keyof WorkoutExerciseData, value: string) {
		const num = parseInt(value, 10);
		if (isNaN(num) || num < 0) return;
		onChange({ ...data, [field]: num });
	}

	return (
		<div className="space-y-3 rounded-lg border border-border/50 p-3">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">{data.exerciseName}</span>
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={onRemove}
					title="Remover exercício"
				>
					<Trash2 className="size-3.5 text-muted-foreground" />
				</Button>
			</div>
			<div className="grid grid-cols-3 gap-2">
				<div className="space-y-1">
					<Label className="text-[10px] text-muted-foreground">
						Séries
					</Label>
					<Input
						type="number"
						min={1}
						value={data.sets}
						onChange={(e) => handleChange("sets", e.target.value)}
					/>
				</div>
				<div className="space-y-1">
					<Label className="text-[10px] text-muted-foreground">
						Reps mín
					</Label>
					<Input
						type="number"
						min={1}
						value={data.repsMin}
						onChange={(e) =>
							handleChange("repsMin", e.target.value)
						}
					/>
				</div>
				<div className="space-y-1">
					<Label className="text-[10px] text-muted-foreground">
						Reps máx
					</Label>
					<Input
						type="number"
						min={1}
						value={data.repsMax}
						onChange={(e) =>
							handleChange("repsMax", e.target.value)
						}
					/>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<div className="space-y-1">
					<Label className="text-[10px] text-muted-foreground">
						Descanso mín (s)
					</Label>
					<Input
						type="number"
						min={0}
						step={15}
						value={data.restMin}
						onChange={(e) =>
							handleChange("restMin", e.target.value)
						}
					/>
				</div>
				<div className="space-y-1">
					<Label className="text-[10px] text-muted-foreground">
						Descanso máx (s)
					</Label>
					<Input
						type="number"
						min={0}
						step={15}
						value={data.restMax}
						onChange={(e) =>
							handleChange("restMax", e.target.value)
						}
					/>
				</div>
			</div>
		</div>
	);
}
