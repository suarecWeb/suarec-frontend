import FormLogin from "@/components/form-login";
import Link from "next/link";
import { ArrowRight } from 'lucide-react';

const Login = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">Iniciar sesión</h1>
        <p className="text-gray-500">Accede a tu cuenta para continuar</p>
      </div>
      
      <FormLogin />
      
      <div className="text-center pt-2">
        <p className="text-gray-600">
          ¿Aún no tienes cuenta?{" "}
          <Link 
            href="/auth/select-type" 
            className="text-[#097EEC] font-medium hover:text-[#082D50] transition-colors inline-flex items-center"
          >
            Registrarse
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
