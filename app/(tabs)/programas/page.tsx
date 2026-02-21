"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { ProgramForm } from "@/components/program-form";
import { ClipboardList, ChevronRight, Zap, ZapOff } from "lucide-react";
import { DAYS_OF_WEEK } from "@/lib/constants";

export default function ProgramasPage() {
	const router = useRouter();
	const programs = useQuery(api.programs.list);
	const activate = useMutation(api.programs.activate);
	const deactivate = useMutation(api.programs.deactivate);

	function countTrainingDays(schedule: Record<string, string | null>) {
		return DAYS_OF_WEEK.filter((d) => schedule[d] !== null).length;
	}

	async function handleToggleActive(id: Id<"programs">, isActive: boolean) {
		try {
			if (isActive) {
				await deactivate({ id });
				toast.success("Programa desativado");
			} else {
				await activate({ id });
				toast.success("Programa ativado");
			}
		} catch {
			toast.error("Erro ao alterar programa");
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-lg font-semibold tracking-tight">
					Programas
				</h1>
				<ProgramForm
					onSuccess={(id) => router.push(`/programas/${id}`)}
				/>
			</div>

			{!programs ? (
				<div className="space-y-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-20 w-full" />
					))}
				</div>
			) : programs.length === 0 ? (
				<Empty className="flex-1 py-12">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<ClipboardList />
						</EmptyMedia>
						<EmptyTitle>Nenhum programa</EmptyTitle>
						<EmptyDescription>
							Crie seu primeiro programa de treino para começar.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<div className="space-y-3">
					{programs.map((program) => {
						const days = countTrainingDays(program.schedule);
						return (
							<Card
								key={program._id}
								className="cursor-pointer transition-colors hover:bg-muted/30"
								onClick={() =>
									router.push(`/programas/${program._id}`)
								}
							>
								<CardHeader>
									<div className="flex items-center gap-2">
										<CardTitle className="text-sm">
											{program.name}
										</CardTitle>
										{program.active && (
											<Badge
												variant="default"
												className="text-[10px]"
											>
												Ativo
											</Badge>
										)}
									</div>
									<CardDescription>
										{days > 0
											? `${days} dia${days > 1 ? "s" : ""} por semana`
											: "Nenhum dia configurado"}
									</CardDescription>
									<CardAction>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={(e) => {
													e.stopPropagation();
													handleToggleActive(
														program._id,
														program.active,
													);
												}}
												title={
													program.active
														? "Desativar"
														: "Ativar"
												}
											>
												{program.active ? (
													<ZapOff className="size-3.5" />
												) : (
													<Zap className="size-3.5" />
												)}
											</Button>
											<ChevronRight className="size-4 text-muted-foreground" />
										</div>
									</CardAction>
								</CardHeader>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
