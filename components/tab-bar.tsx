"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Calendar,
	Dumbbell,
	ClipboardList,
	Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
	{ href: "/inicio", label: "Início", icon: Calendar },
	{ href: "/treino-ativo", label: "Treino", icon: Dumbbell },
	{ href: "/programas", label: "Programas", icon: ClipboardList },
	{ href: "/exercicios", label: "Exercícios", icon: Search },
] as const;

export function TabBar() {
	const pathname = usePathname();

	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
			<div className="mx-auto flex max-w-md items-center justify-around">
				{tabs.map((tab) => {
					const isActive = pathname.startsWith(tab.href);
					const Icon = tab.icon;

					return (
						<Link
							key={tab.href}
							href={tab.href}
							className={cn(
								"flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors duration-200",
								isActive
									? "text-primary"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<Icon className="size-5" />
							<span className="text-[10px] font-medium">
								{tab.label}
							</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
