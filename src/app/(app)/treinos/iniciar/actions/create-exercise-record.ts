'use server'

import { omit } from '@/utils/omit';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod'

const createWeightAndRepsSchema = (sets: number) => {
  // NOTE: For some reason Zod doesn't support merge object validation shapes
  // with "record" ones, so we need to create the schema manually
  return Array(sets)
    .fill(null)
    .reduce((acc, _, index) => {
      return {
        ...acc,
        [`reps-${index + 1}`]: z.coerce.number().min(1),
        [`weight-${index + 1}`]: z.coerce.number().min(1),
      };
    }, {});
}

const setsSchema = z.object({
  sets: z.coerce.number().int().positive()
})

export async function createExerciseRecord(formData: FormData) {
  const data = omit(Object.fromEntries(formData), '$ACTION_ID');

  const parsedSets = setsSchema.safeParse(data)

  if (!parsedSets.success) {
    console.log('Invalid sets', parsedSets.error);
    return;
  }

  const { sets } = parsedSets.data;

  const schema = z.object({
    workoutId: z.string().uuid(),
    exerciseId: z.string().uuid(),
    ...createWeightAndRepsSchema(sets),
  })

  const parsedBody = schema.safeParse(data);

  if (!parsedBody.success) {
    console.log('Invalid data', parsedBody.error);
    return
  }

  const { workoutId, exerciseId, ...exerciseRecords } = parsedBody.data

  const supabase = createClient()

  const totalRecords = Object.keys(exerciseRecords).length / 2

  const createRecordPromises = []

  for (let i = 0; i < totalRecords; i++) {
    const reps = exerciseRecords[`reps-${i + 1}`]
    const weight = exerciseRecords[`weight-${i + 1}`]

    const promise = supabase.from('workouts_exercises_records').insert({
      reps,
      weight,
      exercise_id: exerciseId,
      workout_id: workoutId,
    })

    createRecordPromises.push(promise)
  }

  await Promise.all(createRecordPromises)
}