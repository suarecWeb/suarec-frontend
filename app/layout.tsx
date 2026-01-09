// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import ConditionalFooter from "@/components/conditional-footer";
import { FloatingMailbox } from "@/components/FloatingMailbox";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "SUAREC - Conectamos talento excepcional con oportunidades extraordinarias",
  description:
    "SUAREC es la plataforma líder que conecta profesionales talentosos con las mejores empresas. Encuentra oportunidades laborales exclusivas, empresas verificadas y una comunidad activa de profesionales. Únete a miles de profesionales que ya han encontrado el trabajo de sus sueños.",
  keywords:
    "empleo, trabajo, profesionales, empresas, oportunidades laborales, talento, carrera, reclutamiento",
  authors: [{ name: "SUAREC Team" }],
  openGraph: {
    title:
      "SUAREC - Conectamos talento excepcional con oportunidades extraordinarias",
    description:
      "Plataforma líder que conecta profesionales talentosos con las mejores empresas. Encuentra oportunidades laborales exclusivas y empresas verificadas.",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "SUAREC - Conectamos talento excepcional con oportunidades extraordinarias",
    description:
      "Plataforma líder que conecta profesionales talentosos con las mejores empresas.",
  },
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
            <FloatingMailbox />
          </WebSocketProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
