"use client";

import { useQuery } from "convex/react";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

interface ExercisePickerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (exerciseId: Id<"exercises">, exerciseName: string) => void;
	excludeIds?: Id<"exercises">[];
}

export function ExercisePicker({
	open,
	onOpenChange,
	onSelect,
	excludeIds = [],
}: ExercisePickerProps) {
	const exercises = useQuery(api.exercises.list, {});
	const [search, setSearch] = useState("");

	const filtered = useMemo(() => {
		if (!exercises) return [];
		const excludeSet = new Set(excludeIds);
		let result = exercises.filter((e: Doc<"exercises">) => !excludeSet.has(e._id));

		if (search.trim()) {
			const term = search.toLowerCase();
			result = result.filter(
				(e: Doc<"exercises">) =>
					e.name.toLowerCase().includes(term) ||
					e.muscleGroup.toLowerCase().includes(term),
			);
		}

		return result.sort((a: Doc<"exercises">, b: Doc<"exercises">) => a.name.localeCompare(b.name, "pt-BR"));
	}, [exercises, search, excludeIds]);

	const grouped = useMemo(() => {
		const groups: Record<string, typeof filtered> = {};
		for (const exercise of filtered) {
			if (!groups[exercise.muscleGroup]) {
				groups[exercise.muscleGroup] = [];
			}
			groups[exercise.muscleGroup].push(exercise);
		}
		return Object.entries(groups).sort(([a], [b]) =>
			a.localeCompare(b, "pt-BR"),
		);
	}, [filtered]);

	function handleSelect(exerciseId: Id<"exercises">, exerciseName: string) {
		onSelect(exerciseId, exerciseName);
		setSearch("");
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="max-h-[85vh]">
				<DrawerHeader>
					<DrawerTitle>Adicionar exercício</DrawerTitle>
					<DrawerDescription>
						Selecione um exercício para adicionar ao treino.
					</DrawerDescription>
				</DrawerHeader>
				<div className="px-4 pb-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Buscar exercício..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9"
						/>
					</div>
				</div>
				<div className="flex-1 overflow-y-auto px-4 pb-4">
					{grouped.length === 0 ? (
						<p className="py-8 text-center text-xs text-muted-foreground">
							Nenhum exercício encontrado.
						</p>
					) : (
						<div className="space-y-4">
							{grouped.map(([group, exercises]) => (
								<div key={group} className="space-y-1">
									<h3 className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
										{group}
									</h3>
									{exercises.map((exercise: Doc<"exercises">) => (
										<button
											key={exercise._id}
											type="button"
											onClick={() => handleSelect(exercise._id, exercise.name)}
											className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted/50"
										>
											<Plus className="size-3.5 text-muted-foreground" />
											{exercise.name}
										</button>
									))}
								</div>
							))}
						</div>
					)}
				</div>
				<div className="border-t p-4">
					<DrawerClose asChild>
						<Button variant="outline" className="w-full">
							Fechar
						</Button>
					</DrawerClose>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
