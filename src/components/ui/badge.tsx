import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.ComponentProps<"span"> & {
  tone?: "neutral" | "success" | "warn" | "danger" | "primary";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-muted text-muted-foreground",
        tone === "success" && "bg-accent text-success",
        tone === "warn" && "bg-secondary text-warn",
        tone === "danger" && "bg-destructive/10 text-destructive",
        tone === "primary" && "bg-primary/10 text-primary",
        className,
      )}
      {...props}
    />
  );
}
