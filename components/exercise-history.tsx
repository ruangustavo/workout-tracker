"use client";

import { useQuery } from "convex/react";
import { format } from "date-fns";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type ExerciseHistoryProps = {
	exerciseId: Id<"exercises">;
};

export function ExerciseHistory({ exerciseId }: ExerciseHistoryProps) {
	const history = useQuery(api.exerciseLogs.getHistory, {
		exercise: exerciseId,
	});

	if (history === undefined) {
		return <Skeleton className="h-32 w-full" />;
	}

	if (history.length === 0) {
		return (
			<p className="py-4 text-center text-xs text-muted-foreground">
				Sem histórico ainda.
			</p>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Data</TableHead>
					<TableHead>Treino</TableHead>
					<TableHead>Peso</TableHead>
					<TableHead>Reps</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{history.map((entry: Doc<"exerciseLogs"> & { startedAt: number; workoutName: string }) => {
					const maxWeight = Math.max(
						...entry.sets.map((s: { number: number; weight: number; reps: number }) => s.weight),
						0,
					);
					const totalReps = entry.sets.reduce(
						(sum: number, s: { number: number; weight: number; reps: number }) => sum + s.reps,
						0,
					);
					return (
						<TableRow key={entry._id}>
							<TableCell>
								{format(
									new Date(entry.startedAt),
									"dd/MM/yy",
								)}
							</TableCell>
							<TableCell>{entry.workoutName}</TableCell>
							<TableCell>{maxWeight}kg</TableCell>
							<TableCell>{totalReps}</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
