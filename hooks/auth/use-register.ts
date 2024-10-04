//import { authService } from "../../services";
import { createUser } from "@/actions/register";
import { RegisterSchema } from "@/schemas";
import Cookies from "js-cookie";

export const useRegister = () => {
    
  const register = async (name: string, password: string, email: string, cv_url: string,
    cellphone: string, genre: string, born_at: Date, role: string) => {
    
    // VALIDATE VALUES FROM REGISTER SCHEMA
    const validatedValues = RegisterSchema.safeParse({ name: name,
      password: password,
      email: email,
      cv_url: cv_url,
      cellphone: cellphone,
      genre: genre,
      born_at: born_at,
      role: role });

    if (!validatedValues.success) {
      console.log("error in validated values...");
      return {  error: validatedValues.error.errors[0].message }
    }

    try {
      console.log("calling create user action...");
      const user = await createUser(name, password, email, cv_url,
        cellphone, genre, born_at, role);

      if (user) {
        Cookies.remove("currentUser")
        return { success: "Usuario registrado correctamente." };
      }

      return user;
    } catch (error: any) {
      // Log more details about the error
      console.error("Error occurred while registering user:", error);

      // Check if the error has a response property
      if (error.response) {
        // Return the status code and the response data
        return {
          error: `Error ${error.response.status}: ${error.response.data.message || error.message}`,
        };
      }

      // If no response, return the generic error message
      return { error: error.message || "Ha ocurrido un error inesperado." };
    }

  };

  return { register };
  
};