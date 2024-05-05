import { siteConfig } from "@/app/config/site";

export function Sidebar() {
  return (
    <aside className="sticky p-4 flex justify-between border-r border-r-muted bg-background">
      <h1 className="text-lg font-semibold tracking-tight">
        {siteConfig.title}
      </h1>
    </aside>
  );
}
