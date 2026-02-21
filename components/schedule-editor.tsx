"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id, Doc } from "@/convex/_generated/dataModel";
import { DAYS_OF_WEEK, DAY_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface ScheduleEditorProps {
	programId: Id<"programs">;
	schedule: Record<string, string | null>;
	workouts: Doc<"workouts">[];
}

export function ScheduleEditor({
	programId,
	schedule,
	workouts,
}: ScheduleEditorProps) {
	const updateSchedule = useMutation(api.programs.updateSchedule);

	async function handleChange(day: string, value: string) {
		try {
			await updateSchedule({
				id: programId,
				day,
				workoutId:
					value === "rest"
						? null
						: (value as Id<"workouts">),
			});
		} catch {
			toast.error("Erro ao atualizar cronograma");
		}
	}

	return (
		<div className="space-y-2">
			<h2 className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
				Cronograma semanal
			</h2>
			<div className="space-y-1.5">
				{DAYS_OF_WEEK.map((day) => {
					const workoutId = schedule[day];
					return (
						<div
							key={day}
							className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/30"
						>
							<span className="w-16 text-xs font-medium text-muted-foreground">
								{DAY_LABELS[day]}
							</span>
							<Select
								value={workoutId ?? "rest"}
								onValueChange={(v) => v && handleChange(day, v)}
							>
								<SelectTrigger className="flex-1">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="rest">
										Descanso
									</SelectItem>
									{workouts.map((w) => (
										<SelectItem
											key={w._id}
											value={w._id}
										>
											{w.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					);
				})}
			</div>
		</div>
	);
}
