import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { ClipboardList } from "lucide-react";

export default async function Page() {
  const supabase = createClient();

  const { count } = await supabase.from("exercises").select("*");

  const hasExercises = count && count > 0;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-9 gap-4">
      <Button variant="outline">
        <ClipboardList className="size-4 mr-2 text-primary" />
        Treinos
      </Button>

      {!hasExercises && (
        <p className="text-sm text-muted-foreground">
          Você não tem nenhum exercício cadastrado. Entre em contato com o seu
          personal
        </p>
      )}
    </div>
  );
}
