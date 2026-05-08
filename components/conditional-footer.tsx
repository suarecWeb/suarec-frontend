"use client";
import { usePathname } from "next/navigation";
import Footer from "./footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const isHomePage = pathname === "/";

  if (isAuthPage) {
    return null;
  }

  return <Footer rounded={!isHomePage} />;
}
