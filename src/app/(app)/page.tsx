import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: workouts } = await supabase.from("workouts").select("*");

  return (
    <div className="space-y-4">
      {workouts &&
        workouts.map((workout) => (
          <div className="bg-white border border-muted rounded-md">
            <div className="p-2 sm:p-4">
              <h1 className="text-lg font-semibold tracking-tight">
                {workout.name}
              </h1>
            </div>
            <div className="p-2 sm:p-4 border-t border-t-muted text-center">
              <Link
                href={`/treinos/${workout.id}`}
                className={cn(buttonVariants({ variant: "link" }), "text-sm")}
              >
                Ir para o treino
              </Link>
            </div>
          </div>
        ))}
    </div>
  );
}
