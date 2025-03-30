'use client';

import React from "react";
import styles from "./navbar.module.css";
import Link from "next/link";
import toast from "react-hot-toast";
import { logOut } from "@/actions/log-out";
import Cookies from "js-cookie";

interface NavbarRoleProps {
    isMobile: boolean;
    section: string;
}

const handleNoLogin = () => {
    toast.error('Necesitas estar logueado para realizar esta acción.')
}

export const NavbarRole: React.FC<NavbarRoleProps> = ({isMobile, section }: NavbarRoleProps) => {

    const token = Cookies.get("token");

    const handleLogOutClick = () => {
        logOut();
    }

  return (
    <>
        {section == 'logIn' && token ?
            <>
                <Link href="/" className="nav-link">Perfil</Link>
                <Link href="/auth/login" className="nav-link" onClick={handleLogOutClick}>Log Out</Link>
            </> : <></>
        }

        {section == 'logIn' && !token ?
            <Link href="/auth/login" className="nav-link">Iniciar Sesión</Link> : <></>
        }
    </>
  );
};