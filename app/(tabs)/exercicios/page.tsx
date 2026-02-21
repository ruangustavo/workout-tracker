"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { ExerciseForm } from "@/components/exercise-form";
import { ExerciseHistory } from "@/components/exercise-history";
import { ExerciseProgress } from "@/components/exercise-progress";
import { ChevronDown, Dumbbell, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExerciciosPage() {
	const exercises = useQuery(api.exercises.list, {});
	const [search, setSearch] = useState("");
	const [expandedId, setExpandedId] = useState<Id<"exercises"> | null>(null);

	const filtered = useMemo(() => {
		if (!exercises) return undefined;
		if (!search.trim()) return exercises;

		const term = search.toLowerCase();
		return exercises.filter(
			(e) =>
				e.name.toLowerCase().includes(term) ||
				e.muscleGroup.toLowerCase().includes(term),
		);
	}, [exercises, search]);

	const grouped = useMemo(() => {
		if (!filtered) return undefined;

		const sorted = [...filtered].sort((a, b) =>
			a.name.localeCompare(b.name, "pt-BR"),
		);

		const groups: Record<string, typeof sorted> = {};
		for (const exercise of sorted) {
			if (!groups[exercise.muscleGroup]) {
				groups[exercise.muscleGroup] = [];
			}
			groups[exercise.muscleGroup].push(exercise);
		}

		return Object.entries(groups).sort(([a], [b]) =>
			a.localeCompare(b, "pt-BR"),
		);
	}, [filtered]);

	const toggleExpand = (id: Id<"exercises">) => {
		setExpandedId((prev) => (prev === id ? null : id));
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-lg font-semibold tracking-tight">
					Exercícios
				</h1>
				<ExerciseForm />
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Buscar exercício..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-9"
				/>
			</div>

			{!grouped ? (
				<div className="space-y-3">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton key={i} className="h-10 w-full" />
					))}
				</div>
			) : grouped.length === 0 ? (
				<Empty className="flex-1 py-12">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Dumbbell />
						</EmptyMedia>
						<EmptyTitle>Nenhum exercício encontrado</EmptyTitle>
						<EmptyDescription>
							{search
								? "Tente buscar com outro termo."
								: "Adicione exercícios para começar."}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<div className="space-y-6">
					{grouped.map(([group, exercises]) => (
						<div key={group} className="space-y-2">
							<h2 className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
								{group}
							</h2>
							<div className="space-y-1">
								{exercises.map((exercise) => (
									<div key={exercise._id}>
										<button
											type="button"
											onClick={() =>
												toggleExpand(exercise._id)
											}
											className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
										>
											<span className="text-sm">
												{exercise.name}
											</span>
											<div className="flex items-center gap-2">
												{!exercise.isPreset && (
													<Badge
														variant="secondary"
														className="text-[10px]"
													>
														Personalizado
													</Badge>
												)}
												<ChevronDown
													className={cn(
														"size-4 text-muted-foreground transition-transform",
														expandedId ===
															exercise._id &&
															"rotate-180",
													)}
												/>
											</div>
										</button>
										{expandedId === exercise._id && (
											<div className="space-y-4 px-3 pb-3 pt-1">
												<ExerciseProgress
													exerciseId={exercise._id}
												/>
												<ExerciseHistory
													exerciseId={exercise._id}
												/>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
