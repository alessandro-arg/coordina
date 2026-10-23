import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

export const PageLoader = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn("flex items-center justify-center h-screen", className)}
      role="status"
      aria-label="Loading page"
    >
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
};
