import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  return (
    <div className="bg-muted h-full p-4">
      <h1 className="text-xl font-semibold tracking-tight">Exercícios</h1>
    </div>
  );
}
