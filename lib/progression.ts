type SetData = { weight: number; reps: number };

type Suggestion = {
	type: "increase" | "decrease";
	weight: number;
	message: string;
};

function roundToNearest2(value: number): number {
	return Math.round(value / 2) * 2;
}

export function calculateSuggestion(
	sets: SetData[],
	repsMin: number,
	repsMax: number,
): Suggestion | null {
	if (sets.length === 0) return null;

	const currentWeight = sets[0].weight;
	if (currentWeight === 0) return null;

	const allAboveMax = sets.every((s) => s.reps > repsMax);
	const allBelowMin = sets.every((s) => s.reps < repsMin);

	if (allAboveMax) {
		const increment = currentWeight * 0.05;
		const suggested = roundToNearest2(currentWeight + increment);
		const maxReps = Math.max(...sets.map((s) => s.reps));
		return {
			type: "increase",
			weight: suggested,
			message: `Na última sessão você fez ${maxReps} reps (máx. ${repsMax}). Considere aumentar para ${suggested}kg.`,
		};
	}

	if (allBelowMin) {
		const decrement = currentWeight * 0.025;
		const suggested = roundToNearest2(currentWeight - decrement);
		const minReps = Math.min(...sets.map((s) => s.reps));
		return {
			type: "decrease",
			weight: suggested,
			message: `Na última sessão você fez apenas ${minReps} reps (mín. ${repsMin}). Considere diminuir para ${suggested}kg.`,
		};
	}

	return null;
}
