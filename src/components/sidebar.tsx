import { siteConfig } from "@/app/config/site";
import { SignOutButton } from "./sign-out-button";

export function Sidebar() {
  return (
    <aside className="sticky p-4 flex flex-col justify-between border-r border-r-muted bg-background">
      <h1 className="text-lg font-semibold tracking-tight">
        {siteConfig.title}
      </h1>
      <div className="w-full">
        <SignOutButton />
      </div>
    </aside>
  );
}
