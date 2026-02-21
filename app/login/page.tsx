"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Dumbbell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
	const { signIn } = useAuthActions();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		try {
			await signIn("password", { email, password, flow: "signIn" });
			router.push("/");
		} catch {
			toast.error("Email ou senha incorretos");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-dvh items-center justify-center px-4 py-12">
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
						<Dumbbell className="size-7 text-primary" />
					</div>
					<h1 className="text-2xl/8 font-semibold tracking-tight">
						Workout Tracker
					</h1>
					<p className="mt-1 text-sm/6 text-muted-foreground">
						Entre na sua conta
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="rounded-2xl bg-card p-8 ring-1 ring-border shadow-xl shadow-black/20"
				>
					<div className="space-y-5">
						<div>
							<label htmlFor="email" className="block text-sm/6 font-medium">
								Email
							</label>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="mt-2"
							/>
						</div>
						<div>
							<label htmlFor="password" className="block text-sm/6 font-medium">
								Senha
							</label>
							<Input
								id="password"
								type="password"
								autoComplete="current-password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="mt-2"
							/>
						</div>
					</div>

					<Button type="submit" disabled={loading} className="mt-6 w-full">
						{loading ? "Entrando..." : "Entrar"}
					</Button>
				</form>

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
