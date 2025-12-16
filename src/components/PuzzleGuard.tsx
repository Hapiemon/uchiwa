"use client";

import { usePathname } from "next/navigation";

export function PuzzleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ルートページ（パズル画面）の場合はそのまま表示
  if (pathname === "/") {
    return <>{children}</>;
  }

  // その他のページもそのまま表示（認証はNextAuthが担当）
  return <>{children}</>;
}
