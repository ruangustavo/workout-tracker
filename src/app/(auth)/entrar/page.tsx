import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signIn } from "../actions/sign-in";

export default async function Page() {
  const supabase = createClient();

  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/");
  }

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="ruan@gmail.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>

      <div className="flex items-center gap-2 justify-end">
        <Link
          href="/cadastro"
          className={buttonVariants({
            variant: "link",
          })}
        >
          Criar uma conta
        </Link>
        <Button formAction={signIn}>Fazer login</Button>
      </div>
    </form>
  );
}
