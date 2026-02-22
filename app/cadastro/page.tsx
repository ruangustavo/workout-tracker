import { Dumbbell } from "lucide-react";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function CadastroPage() {
	return (
		<div className="flex min-h-dvh items-center justify-center px-4 py-12">
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center bg-primary/10 ring-1 ring-primary/20">
						<Dumbbell className="size-7 text-primary" />
					</div>
					<h1 className="text-2xl/8 font-semibold tracking-tight">
						Workout Tracker
					</h1>
					<p className="mt-1 text-sm/6 text-muted-foreground">
						Crie sua conta gratuitamente
					</p>
				</div>

				<SignupForm />

				<p className="mt-6 text-center text-sm/6 text-muted-foreground">
					Já tem conta?{" "}
					<Link
						href="/login"
						className="font-medium text-foreground underline-offset-4 hover:underline"
					>
						Entrar
					</Link>
				</p>
			</div>
		</div>
	);
}
