import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noticias IA",
  description:
    "Dashboard y API de noticias de IA, robótica y hardware/manufacturing",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-6">
          <AppHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
