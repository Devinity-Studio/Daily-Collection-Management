import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
