import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Combat Tracker - D&D",
  description: "Combat Tracker per Dungeons & Dragons - Gestisci iniziativa, HP e turni",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-stone-950 text-stone-100">
        {children}
      </body>
    </html>
  );
}
