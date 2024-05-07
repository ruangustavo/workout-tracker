import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createExerciseRecord } from "../actions/create-exercise-record";
import { ArrowRight } from "lucide-react";
import { MutableRefObject, useRef } from "react";
import { useFormState } from "react-dom";

type ExerciseRecordsProps = {
  sets: number;
  onExerciseRecorded: () => void;
};

export function ExerciseRecords({
  sets,
  onExerciseRecorded,
}: ExerciseRecordsProps) {
  const padStartNumber = (number: number) => {
    return number.toString().padStart(2, "0");
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-9 gap-2 items-center">
        <span className="col-start-3 col-span-3 text-muted-foreground text-sm text-center">
          Séries
        </span>
        <span className="col-span-4 text-muted-foreground text-sm text-center">
          Repetições
        </span>
      </div>

      <form
        action={createExerciseRecord}
        onSubmit={onExerciseRecorded}
        className="space-y-2"
      >
        <input type="hidden" name="exerciseId" value="1" />

        {Array(sets)
          .fill(null)
          .map((_, index) => (
            <div key={index} className="grid grid-cols-9 gap-2 items-center">
              <span className="col-span-2 text-sm">
                Série {padStartNumber(index + 1)}
              </span>
              <Input
                name={`reps-${index + 1}`}
                type="number"
                className="col-span-3 text-center"
                required
                min="1"
              />
              <Input
                name={`weight-${index + 1}`}
                type="number"
                className="col-span-4 text-center"
                required
                min="1"
              />
            </div>
          ))}

        <Button type="submit" className="w-full">
          Salvar <ArrowRight className="ml-2 size-4" />
        </Button>
      </form>
    </div>
  );
}
