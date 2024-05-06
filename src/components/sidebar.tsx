import { siteConfig } from "@/app/config/site";
import { SignOutButton } from "./sign-out-button";
import { createClient } from "@/utils/supabase/server";

export async function Sidebar() {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("users")
    .select("name")
    .eq("user_id", userData.user?.id);

  const name = data && data[0].name;

  return (
    <aside className="flex flex-col justify-between border-r border-r-muted bg-background">
      <div className="p-4">
        <h1 className="text-lg font-semibold tracking-tight">
          {siteConfig.title}
        </h1>
      </div>
      <div className="p-4 border-t border-t-muted flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{name}</p>
        <SignOutButton />
      </div>
    </aside>
  );
}
