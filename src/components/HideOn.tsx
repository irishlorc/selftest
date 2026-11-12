"use client";

import { usePathname } from "next/navigation";

/** Hides its children on the given routes (used to keep the questionnaire distraction-free). */
export function HideOn({ paths, children }: { paths: string[]; children: React.ReactNode }) {
  const pathname = usePathname();
  return paths.includes(pathname) ? null : <>{children}</>;
}
