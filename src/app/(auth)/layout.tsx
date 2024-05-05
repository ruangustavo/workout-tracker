import { ReactNode } from "react";
import { siteConfig } from "../config/site";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="space-y-4 w-[400px]">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {siteConfig.title}
          </h1>
          <small className="text-sm text-muted-foreground">
            {siteConfig.description}
          </small>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
