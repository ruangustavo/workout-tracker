import { TailwindIndicator } from "@/components/tailwind-indicator";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { siteConfig } from "./config/site";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={GeistSans.className}>
      <body className="antialiased min-h-dvh flex flex-col">
        {children}
        <TailwindIndicator />
      </body>
    </html>
  );
}
