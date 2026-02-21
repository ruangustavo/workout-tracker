import { TabBar } from "@/components/tab-bar";

export default function TabsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-dvh flex-col">
			<main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-16 pt-6">
				{children}
			</main>
			<TabBar />
		</div>
	);
}
