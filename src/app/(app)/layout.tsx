import { Sidebar } from "@/components/sidebar";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="grow flex flex-col">
      <div className="grid grid-cols-[250px_1fr] flex-1">
        <Sidebar />
        {children}
      </div>
    </div>
  );
}
