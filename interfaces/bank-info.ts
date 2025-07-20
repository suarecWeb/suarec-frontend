export enum DocumentType {
  CC = "CC", // Cédula de Ciudadanía
  NIT = "NIT", // Número de Identificación Tributaria
  CE = "CE", // Cédula de Extranjería
  TI = "TI", // Tarjeta de Identidad
  PAS = "PAS", // Pasaporte
}

export enum AccountType {
  AHORROS = "AHORROS",
  CORRIENTE = "CORRIENTE",
}

export interface BankInfo {
  id: string;
  accountHolderName: string;
  documentType: DocumentType;
  documentNumber: string;
  bankName: string;
  accountType: AccountType;
  accountNumber: string;
  contactEmail: string;
  contactPhone: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBankInfoRequest {
  accountHolderName: string;
  documentType: DocumentType;
  documentNumber: string;
  bankName: string;
  accountType: AccountType;
  accountNumber: string;
  contactEmail: string;
  contactPhone: string;
}

export interface UpdateBankInfoRequest extends CreateBankInfoRequest {}

export interface BankInfoResponse {
  success: boolean;
  data?: BankInfo;
  message?: string;
}

// Opciones para los selectores
export const DOCUMENT_TYPE_OPTIONS = [
  { value: DocumentType.CC, label: "Cédula de Ciudadanía (CC)" },
  { value: DocumentType.NIT, label: "NIT" },
  { value: DocumentType.CE, label: "Cédula de Extranjería (CE)" },
  { value: DocumentType.TI, label: "Tarjeta de Identidad (TI)" },
  { value: DocumentType.PAS, label: "Pasaporte" },
];

export const ACCOUNT_TYPE_OPTIONS = [
  { value: AccountType.AHORROS, label: "Cuenta de Ahorros" },
  { value: AccountType.CORRIENTE, label: "Cuenta Corriente" },
];

// Los bancos ahora se cargan dinámicamente desde Wompi
// Ver services/banks.service.ts para obtener la lista actualizada
