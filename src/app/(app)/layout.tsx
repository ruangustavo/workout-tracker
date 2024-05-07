import { Sidebar } from "@/components/sidebar";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="grow flex flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-[250px_1fr] flex-1">
        <Sidebar />
        <div className="bg-muted/50 h-full p-4">{children}</div>
      </div>
    </div>
  );
}
