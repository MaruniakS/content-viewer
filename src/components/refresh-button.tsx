"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RefreshButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      className="text-sm font-medium text-blue-700 hover:underline disabled:opacity-60"
    >
      {pending ? "Refreshing…" : children}
    </button>
  );
}
