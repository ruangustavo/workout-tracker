import { siteConfig } from "@/app/config/site";
import { SignOutButton } from "./sign-out-button";
import { NavLink } from "./nav-link";
import { Dumbbell, Table2 } from "lucide-react";

export async function Sidebar() {
  // TODO: get user name from session
  const name = "Ruan Gustavo";

  return (
    <aside className="hidden sm:flex flex-col justify-between border-r border-r-muted bg-background">
      <div className="p-4 space-y-4">
        <h1 className="text-lg font-semibold tracking-tight">
          {siteConfig.title}
        </h1>

        <nav>
          <ul className="space-y-2">
            <li>
              <NavLink href="/treinos">
                <Table2 className="size-4 text-primary" />
                Treinos
              </NavLink>
            </li>
            <li>
              <NavLink href="/exercicios">
                <Dumbbell className="size-4 text-primary" />
                Exercícios
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className="p-4 border-t border-t-muted flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{name}</p>
        <SignOutButton />
      </div>
    </aside>
  );
}
