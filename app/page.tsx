import Image from "next/image";
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-5 p-24">
      <p>Selecciona una de las secciones a donde deseas ir:</p>
      <div className="w-full max-w-5xl items-center gap-3 justify-center text-sm lg:flex">
        <Link href="/comment" className={buttonVariants({ variant: "default" })}>Comentarios</Link>
        <Link href="/company" className={buttonVariants({ variant: "default" })}>Compañías</Link>
        <Link href="/publication" className={buttonVariants({ variant: "default" })}>Publicaciones</Link>
        <Link href="/user" className={buttonVariants({ variant: "default" })}>Usuarios</Link>
      </div>
    </main>
  );
}
