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

export interface ApplicationStatusEmailRequest {
  email: string;
  candidateName: string;
  companyName: string;
  jobTitle: string;
  status: "INTERVIEW" | "ACCEPTED" | "REJECTED";
  customMessage?: string;
  customDescription?: string;
}

export interface ApplicationStatusEmailResponse {
  message: string;
}

const baseURL = "/suarec/email-verification";

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

// Enviar estado de aplicación de verificación de email
const sendApplicationStatusEmail = (data: ApplicationStatusEmailRequest) =>
  api.post<ApplicationStatusEmailResponse>(
    `${baseURL}/send-application-status`,
    data,
  );

const EmailVerificationService = {
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail,
  getUserVerificationStatus,
  sendApplicationStatusEmail,
};

export default EmailVerificationService;
