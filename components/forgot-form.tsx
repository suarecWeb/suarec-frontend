"use client"
import AuthService from "@/services/AuthService"
import { UserService } from "@/services/UsersService"
import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { User } from "@/interfaces/user.interface"

interface ForgotProps {
    id:string
}

const ForgotForm: React.FC<ForgotProps> = ({id}) =>{

    const router = useRouter();
    const [isPending, startTransition] = useTransition()
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [user, setUser] = useState<User>()

    useEffect(()=>{
        const fetchData = async() =>{
            const res = await UserService.getUserById(+id)
            setUser(res.data)
        }

        fetchData();
    },[])


    const handleChange = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!password || !confirmPassword) {
            toast.error('Por favor completa todos los campos')
            return
        }
        
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden')
            return
        }
        
        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres')
            return
        }
        
        startTransition(async () => {
            try { 
                await AuthService.changePassword(id, password)
                toast.success('Contraseña cambiada correctamente')
                router.push('/auth/login')
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Error al cambiar la contraseña")
            }
        })
    }

    return (
        <form className="space-y-6" onSubmit={handleChange}>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Nueva contraseña
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    placeholder="••••••••"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors"
                    disabled={isPending}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                    Confirmar contraseña
                </label>
                <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={confirmPassword}
                    placeholder="••••••••"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors"
                    disabled={isPending}
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
                
            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#097EEC] text-white font-medium py-3 px-4 rounded-lg hover:bg-[#0A6BC7] transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
            </button>
        </form>
    )
}

export default ForgotForm