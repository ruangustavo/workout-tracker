"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MUSCLE_GROUPS } from "@/lib/constants";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export function ExerciseForm() {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [muscleGroup, setMuscleGroup] = useState<string>("");
	const create = useMutation(api.exercises.create);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim() || !muscleGroup) return;

		try {
			await create({ name: name.trim(), muscleGroup });
			toast.success("Exercício criado");
			setName("");
			setMuscleGroup("");
			setOpen(false);
		} catch (error) {
			toast.error("Erro ao criar exercício");
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button size="sm" variant="outline">
						<Plus data-icon="inline-start" />
						Novo exercício
					</Button>
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Novo exercício</DialogTitle>
					<DialogDescription>
						Adicione um exercício personalizado à biblioteca.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="exercise-name">Nome</Label>
						<Input
							id="exercise-name"
							placeholder="Ex: Supino com halteres"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>Grupo muscular</Label>
						<Select
							value={muscleGroup}
							onValueChange={(v) => v && setMuscleGroup(v)}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Selecione" />
							</SelectTrigger>
							<SelectContent>
								{MUSCLE_GROUPS.map((group) => (
									<SelectItem key={group} value={group}>
										{group}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={!name.trim() || !muscleGroup}>
							Criar exercício
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
