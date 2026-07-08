import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "passed ≠ true",
  description: "When an action reports success, success isn't truth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 antialiased">{children}</body>
    </html>
  );
}
