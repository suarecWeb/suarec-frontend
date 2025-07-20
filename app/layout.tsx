// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import ConditionalFooter from "@/components/conditional-footer";
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
    <html lang="en">
      <body className={inter.className}>
        <NotificationProvider>
          <WebSocketProvider>
            <div className="flex-1 flex flex-col">{children}</div>
            <ConditionalFooter />
          </WebSocketProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
