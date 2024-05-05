import { Button } from "@/components/ui/button";
import { siteConfig } from "./config/site";
import { AtSign } from "lucide-react";

export default function Page() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="space-y-4 w-[400px]">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {siteConfig.title}
          </h1>
          <small className="text-sm text-muted-foreground">
            {siteConfig.description}
          </small>
        </div>

        <Button variant="outline" className="w-full text-base">
          <AtSign className="size-4 mr-2" />
          Entrar com Google
        </Button>
      </div>
    </div>
  );
}
