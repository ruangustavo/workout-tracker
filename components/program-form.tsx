"use client";

import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface ProgramFormProps {
	editId?: Id<"programs">;
	editName?: string;
	trigger?: React.ReactNode;
	onSuccess?: (id: Id<"programs">) => void;
}

export function ProgramForm({
	editId,
	editName,
	trigger,
	onSuccess,
}: ProgramFormProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(editName ?? "");
	const create = useMutation(api.programs.create);
	const update = useMutation(api.programs.update);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim()) return;

		try {
			if (editId) {
				await update({ id: editId, name: name.trim() });
				toast.success("Programa atualizado");
			} else {
				const id = await create({ name: name.trim() });
				toast.success("Programa criado");
				onSuccess?.(id);
			}
			setName("");
			setOpen(false);
		} catch {
			toast.error(
				editId ? "Erro ao atualizar programa" : "Erro ao criar programa",
			);
		}
	}

	function handleOpenChange(next: boolean) {
		setOpen(next);
		if (next && editName) {
			setName(editName);
		}
		if (!next) {
			setName("");
		}
	}

	return (
		<Drawer open={open} onOpenChange={handleOpenChange}>
			<DrawerTrigger asChild>
				{trigger ?? (
					<Button size="sm" variant="outline">
						<Plus data-icon="inline-start" />
						Novo programa
					</Button>
				)}
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>
						{editId ? "Editar programa" : "Novo programa"}
					</DrawerTitle>
					<DrawerDescription>
						{editId
							? "Altere o nome do programa."
							: "Crie um novo programa de treino."}
					</DrawerDescription>
				</DrawerHeader>
				<form onSubmit={handleSubmit} className="px-4">
					<div className="space-y-2">
						<Label htmlFor="program-name">Nome</Label>
						<Input
							id="program-name"
							placeholder="Ex: Push/Pull/Legs"
							value={name}
							onChange={(e) => setName(e.target.value)}
							autoFocus
						/>
					</div>
				</form>
				<DrawerFooter>
					<Button
						onClick={handleSubmit as unknown as React.MouseEventHandler}
						disabled={!name.trim()}
					>
						{editId ? "Salvar" : "Criar programa"}
					</Button>
					<DrawerClose asChild>
						<Button variant="outline">Cancelar</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
