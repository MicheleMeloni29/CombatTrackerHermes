import type { Metadata } from "next";
import { Inter, MedievalSharp } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const medievalSharp = MedievalSharp({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-medieval-sharp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Combat Tracker - D&D",
  description:
    "Combat Tracker per Dungeons & Dragons - Gestisci iniziativa, HP e turni",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`h-full antialiased ${inter.variable} ${medievalSharp.variable}`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
