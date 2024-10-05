"use client";

import UserTypeForm from "@/components/select-user-type-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

const UserType = () => {
  return (
    <>
        <h1 className="text-4xl font-bold text-center w-full">Registrarse</h1>
        <UserTypeForm />
        <a href="/auth/login" className="mx-auto">
        ¿Ya tienes una cuenta?{" "}
        <span className="text-success underline">Ingresa</span>
        </a>
  </>
  );
};

export default UserType;
