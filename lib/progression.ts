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
		return {
			type: "increase",
			weight: suggested,
			message: `Você completou todas as séries acima da faixa! Considere aumentar para ${suggested}kg na próxima sessão.`,
		};
	}

	if (allBelowMin) {
		const decrement = currentWeight * 0.025;
		const suggested = roundToNearest2(currentWeight - decrement);
		return {
			type: "decrease",
			weight: suggested,
			message: `Você ficou abaixo da faixa em todas as séries. Considere diminuir para ${suggested}kg na próxima sessão.`,
		};
	}

	return null;
}
