import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vocca — Dictation, Instantly",
  description: "Press a key, say what you want, and it shows up on screen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fafafa] text-[#111] antialiased">
        {children}
      </body>
    </html>
  );
}
