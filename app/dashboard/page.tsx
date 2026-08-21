"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** The section chooser lives at the root now — see app/page.tsx. */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
