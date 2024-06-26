"use client";

import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/entrar");
  }

  return (
    <Button variant="link" type="submit" onClick={handleSignOut}>
      <LogOut className="size-4 mr-2" />
    </Button>
  );
}
