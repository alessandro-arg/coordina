import { LoaderCircle } from "lucide-react";

export default function WorkspaceLoading() {
  return (
    <div
      className="flex min-h-[50vh] w-full items-center justify-center"
      role="status"
      aria-label="Loading page"
    >
      <LoaderCircle
        className="size-6 animate-spin text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}
