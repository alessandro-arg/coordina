"use client";

import { LoaderCircle } from "lucide-react";
import { useLinkStatus } from "next/link";

export const NavigationPendingIndicator = () => {
  const { pending } = useLinkStatus();

  if (!pending) return null;

  return (
    <span role="status" aria-label="Navigating" className="ml-auto shrink-0">
      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
    </span>
  );
};
