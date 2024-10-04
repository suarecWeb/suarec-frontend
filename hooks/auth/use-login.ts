//import { authService } from "../../services";
import { authApi } from "@/API";
import { signIn } from "@/actions/log-in";
import { LoginSchema } from "@/schemas";
import Cookies from "js-cookie";

export const useLogin = () => {
    
  const login = async (username: string, password: string) => {
    
    const validatedValues = LoginSchema.safeParse({ email: username, password: password });

    if (!validatedValues.success) {
      return {  error: validatedValues.error.errors[0].message }
    }
    
    try {
      const res:any = await signIn(username, password);

      console.log(res)

      const token = res.data.token;
      const userId = res.data.id;

      // Guardar el token en una cookie
      Cookies.set("token", token, { /*secure: true,*/ sameSite: 'strict', expires: 1 });  // Expira en 1 día
      Cookies.set("currentUser", userId, { /*secure: true,*/ sameSite: 'strict', expires: 1 });

      console.log("respuesta de login ",res)
      console.log("cookies seteadas")
      return res.data;
    } catch (error: any) {
      if (error.response) {
        return { error: "Usuario no registrado, por favor registrate" };
      }
      
      console.log(error)
      return { error: "Ocurrió un error inesperado" };
    }

  };

  return { login };
  
};