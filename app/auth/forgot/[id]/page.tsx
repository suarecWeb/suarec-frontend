import ForgotForm from "@/components/forgot-form"

// Configuración para evitar prerenderización estática
export const dynamic = 'force-dynamic';

interface Props{
    params: {id:string}
}

const ForgotPage = ({params}:Props) => {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-800">Cambiar contraseña</h1>
                <p className="text-gray-500">Ingresa tu nueva contraseña para restablecer tu cuenta</p>
            </div>
            
            <ForgotForm id={params.id}/>
        </div>
    )
}

export default ForgotPage