import ForgotForm from "@/components/forgot-form"
import CheckForm from "@/components/check-form"
import { Container } from "@mui/material"
import Image from "next/image"
import Link from "next/link"

// Configuración para evitar prerenderización estática
export const dynamic = 'force-dynamic';

interface Props{
    params: {id:string}
}

const ForgotPage  = ({params}:Props) =>{
    return(
        <>
            <Container className="flex flex-col justify-center items-center w-full">
                <Link href="/" passHref>
                <Image
                src="/images/logo-no-slogan.png"
                alt="DMajorStore Logo"
                width={96}
                height={96}
                className="w-20 h-24 mx-auto"
                />
                </Link>
            </Container>

            <h1 className="text-4xl text-center w-full font-bold">Cambie su contraseña</h1>
            <ForgotForm id={params.id}/>
        </>
        

    )
}

export default ForgotPage