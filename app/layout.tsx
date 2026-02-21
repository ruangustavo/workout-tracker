import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Toaster } from "sonner";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-sans",
});

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Workout Tracker",
	description: "Acompanhe seus treinos de musculação",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ConvexAuthNextjsServerProvider>
			<html lang="pt-BR" className={cn(jetbrainsMono.variable, "dark")}>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				>
					<ConvexClientProvider>{children}</ConvexClientProvider>
					<Toaster />
				</body>
			</html>
		</ConvexAuthNextjsServerProvider>
	);
}
