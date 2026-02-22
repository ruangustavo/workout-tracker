"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignupForm() {
	const { signIn } = useAuthActions();
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		try {
			await signIn("password", { email, password, flow: "signUp", name });
			router.push("/");
		} catch {
			toast.error("Não foi possível criar a conta. Tente outro email.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-card p-8 ring-1 ring-border shadow-xl shadow-black/20"
		>
			<div className="space-y-5">
				<div>
					<label htmlFor="name" className="block text-sm/6 font-medium">
						Nome
					</label>
					<Input
						id="name"
						type="text"
						autoComplete="name"
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="mt-2"
					/>
				</div>
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
						autoComplete="new-password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="mt-2"
					/>
				</div>
			</div>

			<Button type="submit" disabled={loading} className="mt-6 w-full">
				{loading ? "Criando conta..." : "Criar conta"}
			</Button>
		</form>
	);
}
