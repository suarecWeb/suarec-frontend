// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Suarec",
  description: "Plataforma de empleo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <NotificationProvider>
          <WebSocketProvider>
            {children}
          </WebSocketProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
