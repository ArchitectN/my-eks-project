import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PawDays — Animal Daycare",
  description: "Premium daycare for your beloved companions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream-50">{children}</body>
    </html>
  );
}
