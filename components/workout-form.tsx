"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
	DrawerFooter,
	DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	WorkoutExerciseForm,
	type WorkoutExerciseData,
} from "@/components/workout-exercise-form";
import { ExercisePicker } from "@/components/exercise-picker";
import { Plus } from "lucide-react";

interface WorkoutFormProps {
	programId: Id<"programs">;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editId?: Id<"workouts">;
	editName?: string;
	editExercises?: WorkoutExerciseData[];
}

export function WorkoutForm({
	programId,
	open,
	onOpenChange,
	editId,
	editName,
	editExercises,
}: WorkoutFormProps) {
	const [name, setName] = useState(editName ?? "");
	const [exercises, setExercises] = useState<WorkoutExerciseData[]>(
		editExercises ?? [],
	);
	const [pickerOpen, setPickerOpen] = useState(false);

	const createWorkout = useMutation(api.workouts.create);
	const updateWorkout = useMutation(api.workouts.update);
	const updateExercises = useMutation(api.workouts.updateExercises);

	function handleOpenChange(next: boolean) {
		onOpenChange(next);
		if (next) {
			setName(editName ?? "");
			setExercises(editExercises ?? []);
		}
	}

	const handleExerciseSelect = useCallback(
		(exerciseId: Id<"exercises">, exerciseName: string) => {
			setPickerOpen(false);
			setExercises((prev) => [
				...prev,
				{
					exerciseId,
					exerciseName,
					sets: 3,
					repsMin: 8,
					repsMax: 12,
					restMin: 60,
					restMax: 90,
				},
			]);
		},
		[],
	);

	function handleExerciseChange(index: number, data: WorkoutExerciseData) {
		setExercises((prev) =>
			prev.map((e, i) => (i === index ? data : e)),
		);
	}

	function handleExerciseRemove(index: number) {
		setExercises((prev) => prev.filter((_, i) => i !== index));
	}

	async function handleSave() {
		if (!name.trim()) return;

		try {
			const exerciseData = exercises.map((e) => ({
				exercise: e.exerciseId as Id<"exercises">,
				sets: e.sets,
				repsMin: e.repsMin,
				repsMax: e.repsMax,
				restMin: e.restMin,
				restMax: e.restMax,
			}));

			if (editId) {
				await updateWorkout({ id: editId, name: name.trim() });
				await updateExercises({
					id: editId,
					exercises: exerciseData,
				});
				toast.success("Treino atualizado");
			} else {
				const id = await createWorkout({
					name: name.trim(),
					program: programId,
				});
				if (exerciseData.length > 0) {
					await updateExercises({
						id,
						exercises: exerciseData,
					});
				}
				toast.success("Treino criado");
			}
			onOpenChange(false);
		} catch {
			toast.error("Erro ao salvar treino");
		}
	}

	const excludeIds = exercises.map(
		(e) => e.exerciseId as Id<"exercises">,
	);

	return (
		<>
			<Drawer open={open} onOpenChange={handleOpenChange}>
				<DrawerContent className="max-h-[90vh]">
					<DrawerHeader>
						<DrawerTitle>
							{editId ? "Editar treino" : "Novo treino"}
						</DrawerTitle>
						<DrawerDescription>
							{editId
								? "Altere o treino e seus exercícios."
								: "Configure o treino e adicione exercícios."}
						</DrawerDescription>
					</DrawerHeader>
					<div className="flex-1 space-y-4 overflow-y-auto px-4">
						<div className="space-y-2">
							<Label htmlFor="workout-name">Nome do treino</Label>
							<Input
								id="workout-name"
								placeholder="Ex: Peito e Tríceps"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label>Exercícios</Label>
								<Button
									variant="ghost"
									size="xs"
									onClick={() => setPickerOpen(true)}
								>
									<Plus data-icon="inline-start" />
									Adicionar
								</Button>
							</div>

							{exercises.length === 0 ? (
								<p className="py-4 text-center text-xs text-muted-foreground">
									Nenhum exercício adicionado.
								</p>
							) : (
								<div className="space-y-2">
									{exercises.map((exercise, index) => (
										<WorkoutExerciseForm
											key={`${exercise.exerciseId}-${index}`}
											data={exercise}
											onChange={(data) =>
												handleExerciseChange(
													index,
													data,
												)
											}
											onRemove={() =>
												handleExerciseRemove(index)
											}
										/>
									))}
								</div>
							)}
						</div>
					</div>
					<DrawerFooter>
						<Button onClick={handleSave} disabled={!name.trim()}>
							{editId ? "Salvar" : "Criar treino"}
						</Button>
						<DrawerClose asChild>
							<Button variant="outline">Cancelar</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
			<ExercisePicker
				open={pickerOpen}
				onOpenChange={setPickerOpen}
				onSelect={handleExerciseSelect}
				excludeIds={excludeIds}
			/>
		</>
	);
}
