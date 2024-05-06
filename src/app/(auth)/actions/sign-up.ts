'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
  const supabase = createClient()

  const body = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
  })

  if (error) {
    console.log(error)
  }

  const { error: errorUserCreation } = await supabase.from('users').insert({
    name: body.name, user_id: data.user?.id
  })

  if (errorUserCreation) {
    console.log(errorUserCreation)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}