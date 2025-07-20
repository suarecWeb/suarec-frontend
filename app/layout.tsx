// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import ConditionalFooter from "@/components/conditional-footer";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { Toaster } from "react-hot-toast";

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
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <NotificationProvider>
          <WebSocketProvider>
            <div className="flex-1 flex flex-col">{children}</div>
            <ConditionalFooter />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#fff",
                  color: "#333",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                },
                success: {
                  style: {
                    border: "1px solid #059669",
                    background: "#f0fdf4",
                  },
                  iconTheme: {
                    primary: "#059669",
                    secondary: "#f0fdf4",
                  },
                },
                error: {
                  style: {
                    border: "1px solid #dc2626",
                    background: "#fef2f2",
                  },
                  iconTheme: {
                    primary: "#dc2626",
                    secondary: "#fef2f2",
                  },
                },
                loading: {
                  style: {
                    border: "1px solid #097EEC",
                    background: "#f0f9ff",
                  },
                  iconTheme: {
                    primary: "#097EEC",
                    secondary: "#f0f9ff",
                  },
                },
              }}
            />
          </WebSocketProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
