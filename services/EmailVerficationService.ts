// services/EmailVerificationService.ts
import api from "./axios_config";

interface SendVerificationEmailRequest {
  userId: number;
  email: string;
}

interface VerifyEmailRequest {
  token: string;
}

interface ResendVerificationEmailRequest {
  email: string;
}

interface VerificationResponse {
  success: boolean;
  message: string;
}

const baseURL = "/email-verification";

// Enviar email de verificación
const sendVerificationEmail = (data: SendVerificationEmailRequest) => 
  api.post<{ message: string }>(`${baseURL}/send`, data);

// Verificar email con token
const verifyEmail = (data: VerifyEmailRequest) => 
  api.post<VerificationResponse>(`${baseURL}/verify`, data);

// Reenviar email de verificación
const resendVerificationEmail = (data: ResendVerificationEmailRequest) => 
  api.post<{ message: string }>(`${baseURL}/resend`, data);

// Obtener estado de verificación de un usuario
const getUserVerificationStatus = (userId: string) => 
  api.get<{ verified: boolean; email?: string }>(`${baseURL}/user/${userId}`);

const EmailVerificationService = {
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail,
  getUserVerificationStatus,
};

export default EmailVerificationService;