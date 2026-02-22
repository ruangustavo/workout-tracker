"use client";

import { useQuery } from "convex/react";
import { ChevronDown, Dumbbell, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ExerciseHistory } from "@/components/exercise-history";
import { ExerciseProgress } from "@/components/exercise-progress";
import { Badge } from "@/components/ui/badge";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export function ExerciseList() {
	const exercises = useQuery(api.exercises.list, {});
	const [search, setSearch] = useState("");
	const [expandedId, setExpandedId] = useState<Id<"exercises"> | null>(null);

	const filtered = useMemo(() => {
		if (!exercises) return undefined;
		if (!search.trim()) return exercises;

		const term = search.toLowerCase();
		return exercises.filter(
			(e: Doc<"exercises">) =>
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
		<>
			<InputGroup>
				<InputGroupAddon>
					<Search />
				</InputGroupAddon>
				<InputGroupInput
					placeholder="Buscar exercício..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</InputGroup>

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
											onClick={() => toggleExpand(exercise._id)}
											className="flex w-full items-center justify-between px-3 py-2.5 hover:bg-muted/50"
										>
											<span className="text-sm">{exercise.name}</span>
											<div className="flex items-center gap-2">
												{!exercise.isPreset && (
													<Badge variant="secondary" className="text-[10px]">
														Personalizado
													</Badge>
												)}
												<ChevronDown
													className={cn(
														"size-4 text-muted-foreground transition-transform",
														expandedId === exercise._id && "rotate-180",
													)}
												/>
											</div>
										</button>
										{expandedId === exercise._id && (
											<div className="space-y-4 px-3 pb-3 pt-1">
												<ExerciseProgress exerciseId={exercise._id} />
												<ExerciseHistory exerciseId={exercise._id} />
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}
		</>
	);
}
