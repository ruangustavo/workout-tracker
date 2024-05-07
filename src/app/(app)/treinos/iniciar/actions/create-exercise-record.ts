'use server'

import { omit } from '@/utils/omit';
import { z } from 'zod'

const schema = z.record(
  z.string().refine((key) => {
    const [prefix, suffix] = key.split('-');
    return ['reps', 'weight'].includes(prefix) && suffix !== undefined;
  }),
  z.coerce.number().min(1)
)

export async function createExerciseRecord(formData: FormData) {
  const data = omit(Object.fromEntries(formData), '$ACTION_ID');

  const parsedBody = schema.safeParse(data);

  if (parsedBody.success) {
    console.log('Valid data', parsedBody.data);
  } else {
    console.log('Invalid data', parsedBody.error);
  }
}