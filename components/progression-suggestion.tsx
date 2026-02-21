"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type ProgressionSuggestionProps = {
	type: "increase" | "decrease";
	message: string;
};

export function ProgressionSuggestion({
	type,
	message,
}: ProgressionSuggestionProps) {
	return (
		<Alert>
			{type === "increase" ? (
				<TrendingUp className="size-4" />
			) : (
				<TrendingDown className="size-4" />
			)}
			<AlertTitle>
				{type === "increase" ? "Hora de subir!" : "Ajuste de carga"}
			</AlertTitle>
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	);
}
