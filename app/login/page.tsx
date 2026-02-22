import { Dumbbell } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
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
						Entre na sua conta
					</p>
				</div>
				<LoginForm />
				<p className="mt-6 text-center text-sm/6 text-muted-foreground">
					Não tem conta?{" "}
					<Link
						href="/cadastro"
						className="font-medium text-foreground underline-offset-4 hover:underline"
					>
						Criar conta
					</Link>
				</p>
			</div>
		</div>
	);
}
