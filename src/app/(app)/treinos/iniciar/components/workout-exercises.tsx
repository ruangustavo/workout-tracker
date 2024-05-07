"use client";

import { useState } from "react";
import { ExerciseRecords } from "./exercise-records";
import { Button } from "@/components/ui/button";

type WorkoutExercisesProps = {
  exercises: {
    sets: number | null;
    min_reps: number | null;
    max_reps: number | null;
    exercises: {
      id: string;
      name: string;
    } | null;
  }[];
};

export function WorkoutExercises({ exercises }: WorkoutExercisesProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  function nextExercise() {
    setCurrentExerciseIndex((prev) => prev + 1);
  }

  function previousExercise() {
    setCurrentExerciseIndex((prev) => prev - 1);
  }

  const isFirstExercise = currentExerciseIndex === 0;
  const isLastExercise = currentExerciseIndex === exercises.length - 1;

  const { exercises: exercise, sets } = exercises[currentExerciseIndex];

  function handleExerciseRecorded() {
    if (isLastExercise) {
      console.log("Finished");
      return;
    }

    nextExercise();
  }

  return (
    <>
      <div className="grow space-y-4">
        <h1 className="uppercase font-semibold">{exercise?.name}</h1>
        {sets && (
          <ExerciseRecords
            sets={sets}
            onExerciseRecorded={handleExerciseRecorded}
          />
        )}
      </div>

      <div className="flex flex-col justify-between gap-2">
        <Button
          onClick={nextExercise}
          disabled={isLastExercise}
          className="w-full"
        >
          Ir para o próximo
        </Button>
        <Button
          onClick={previousExercise}
          disabled={isFirstExercise}
          className="w-full"
          variant="outline"
        >
          Voltar para o anterior
        </Button>
      </div>
    </>
  );
}
