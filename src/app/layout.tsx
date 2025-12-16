import type { Metadata } from "next";
import { LayoutContent } from "@/components/LayoutContent";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "3周年記念サイト",
  description: "思い出を大切にするために作った！",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gradient-to-b from-pastel-lavender to-white min-h-screen">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
