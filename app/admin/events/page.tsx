"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/role-guard";

const EventsRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/boleteria");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#097EEC] border-t-transparent" />
    </div>
  );
};

const EventsPage = () => (
  <RoleGuard allowedRoles={["ADMIN"]}>
    <EventsRedirect />
  </RoleGuard>
);

export default EventsPage;
