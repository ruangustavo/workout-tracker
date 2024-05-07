import { createClient } from "@/utils/supabase/server";
import { WorkoutExercises } from "../components/workout-exercises";

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
    <div className="flex flex-col h-full">
      {workoutsExercisesQuery.data && (
        <WorkoutExercises
          workoutId={params.workoutId}
          exercises={workoutsExercisesQuery.data}
        />
      )}
    </div>
  );
}
