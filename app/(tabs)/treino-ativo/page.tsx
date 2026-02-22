import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TreinoAtivoView } from "./treino-ativo-view";

function LoadingSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-8 w-48" />
			<Skeleton className="h-64 w-full" />
		</div>
	);
}

export default function TreinoAtivoPage() {
	return (
		<Suspense fallback={<LoadingSkeleton />}>
			<TreinoAtivoView />
		</Suspense>
	);
}
