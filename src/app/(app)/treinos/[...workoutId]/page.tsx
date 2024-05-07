import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: { workoutId: string };
}) {
  const supabase = createClient();

  const workoutsExercisesQuery = await supabase
    .from("workouts_exercises")
    .select("sets, min_reps, max_reps, exercises ( id, name )")
    .eq("workout_id", params.workoutId);

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="grow divide-y divide-foreground/10">
        {workoutsExercisesQuery.data?.map(
          ({ exercises, min_reps: minReps, max_reps: maxReps, sets }) => (
            <div key={exercises?.id} className="p-2">
              <h1 className="uppercase">{exercises?.name}</h1>

              <div className="flex gap-4">
                <div className="space-x-2">
                  <span className="text-sm text-muted-foreground">Séries</span>
                  <span className="text-sm text-foreground">{sets}</span>
                </div>

                <div className="space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Repetições
                  </span>
                  <span className="text-sm text-foreground">{`${minReps}-${maxReps}`}</span>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <footer className="space-y-2">
        <Link
          href={`/treinos/iniciar/${params.workoutId}`}
          className={cn(
            buttonVariants({
              variant: "default",
            }),
            "w-full"
          )}
        >
          Iniciar treino
        </Link>

        <Link
          href="/"
          className={cn(
            buttonVariants({
              variant: "outline",
            }),
            "w-full"
          )}
        >
          Voltar
        </Link>
      </footer>
    </div>
  );
}
