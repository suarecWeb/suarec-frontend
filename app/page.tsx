import Image from "next/image";
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link";
import buildingImage from "@/public/building.jpg"; // Asegúrate de tener esta imagen en tu carpeta public
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <>
    <Navbar/>
    <main className="bg-secondary">
      <div className="relative h-screen">
        <div className="absolute inset-0">
          <Image 
            src={buildingImage}
            alt="Edificios"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center h-full text-white text-center">
          <h1 className="text-6xl font-bold">SUAREC</h1>
        </div>
      </div>
      <div className="p-8">
        <div className="max-w-3xl mx-auto text-xl space-y-4">
          <h2 className="text-2xl font-semibold">Subtítulo 1</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <h2 className="text-2xl font-semibold">Subtítulo 2</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <h2 className="text-2xl font-semibold">Subtítulo 3</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </div>
      </div>
    </main>
    </>
  );
}
