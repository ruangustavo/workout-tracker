"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { AtSign } from "lucide-react";

export function SignInButton() {
  async function handleSignIn() {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  return (
    <Button
      variant="outline"
      className="w-full text-base"
      onClick={handleSignIn}
    >
      <AtSign className="size-4 mr-2" />
      Entrar com Google
    </Button>
  );
}
