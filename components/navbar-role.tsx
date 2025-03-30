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

    const currentUser = Cookies.get("currentUser");

    const handleLogOutClick = () => {
        logOut();
    }

  return (
    <>
        {section == 'logIn' && currentUser ?
            <>
                <Link href="/" className="nav-link">Perfil</Link>
                <Link href="/auth/login" className="nav-link" onClick={handleLogOutClick}>Log Out</Link>
            </> : <></>
        }

        {section == 'logIn' && !currentUser ?
            <Link href="/auth/login" className="nav-link">Iniciar Sesión</Link> : <></>
        }
    </>
  );
};