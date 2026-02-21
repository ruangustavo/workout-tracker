"use client";

import { Input } from "@/components/ui/input";

type SessionSetInputProps = {
	setNumber: number;
	weight: string;
	reps: string;
	previousWeight?: number;
	previousReps?: number;
	onWeightChange: (value: string) => void;
	onRepsChange: (value: string) => void;
};

export function SessionSetInput({
	setNumber,
	weight,
	reps,
	previousWeight,
	previousReps,
	onWeightChange,
	onRepsChange,
}: SessionSetInputProps) {
	return (
		<div className="grid grid-cols-[auto_1fr_1fr] items-center gap-2">
			<span className="w-6 text-center text-xs text-muted-foreground">
				{setNumber}
			</span>
			<Input
				type="number"
				inputMode="decimal"
				placeholder={previousWeight ? `${previousWeight}kg` : "kg"}
				value={weight}
				onChange={(e) => onWeightChange(e.target.value)}
				className="h-9 text-center"
			/>
			<Input
				type="number"
				inputMode="numeric"
				placeholder={previousReps ? `${previousReps}` : "reps"}
				value={reps}
				onChange={(e) => onRepsChange(e.target.value)}
				className="h-9 text-center"
			/>
		</div>
	);
}
