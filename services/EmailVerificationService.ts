// services/EmailVerificationService.ts
import api from "./axios_config";

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
}

export interface EmailVerificationStatus {
  verified: boolean;
  email?: string;
}

const baseURL = "/email-verification";

// Enviar email de verificación
const sendVerificationEmail = (userId: number, email: string) => 
  api.post<{ message: string }>(`${baseURL}/send`, { userId, email });

// Verificar email con token
const verifyEmail = (token: string) => 
  api.post<EmailVerificationResponse>(`${baseURL}/verify`, { token });

// Reenviar email de verificación
const resendVerificationEmail = (email: string) => 
  api.post<{ message: string }>(`${baseURL}/resend`, { email });

// Obtener estado de verificación de un usuario (solo admin)
const getUserVerificationStatus = (userId: string) => 
  api.get<EmailVerificationStatus>(`${baseURL}/user/${userId}`);

const EmailVerificationService = {
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail,
  getUserVerificationStatus,
};

export default EmailVerificationService;