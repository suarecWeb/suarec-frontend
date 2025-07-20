import {
  BankInfo,
  CreateBankInfoRequest,
  UpdateBankInfoRequest,
  BankInfoResponse,
} from "@/interfaces/bank-info";
import api from "./axios_config";

export class BankInfoService {
  // Crear información bancaria
  static async createBankInfo(
    userId: number,
    data: CreateBankInfoRequest,
  ): Promise<BankInfoResponse> {
    try {
      const response = await api.post(
        `/suarec/users/${userId}/bank-info`,
        data,
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error creating bank info:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error al crear información bancaria",
      };
    }
  }

  // Obtener información bancaria de un usuario
  static async getBankInfo(userId: number): Promise<BankInfoResponse> {
    try {
      console.log(
        `Solicitando información bancaria para usuario ID: ${userId}`,
      );
      const response = await api.get(`/suarec/users/${userId}/bank-info`);
      console.log("Respuesta exitosa del backend:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error en getBankInfo:", error);
      console.error("Status del error:", error.response?.status);
      console.error("Data del error:", error.response?.data);

      if (error.response?.status === 404) {
        console.log("404: No se encontró información bancaria");
        return {
          success: true,
          data: undefined,
          message: "No se encontró información bancaria",
        };
      }
      if (error.response?.status === 403) {
        console.log("403: Sin permisos para acceder");
        return {
          success: false,
          message: "Sin permisos para acceder a esta información",
        };
      }
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error al obtener información bancaria",
      };
    }
  }

  // Actualizar información bancaria
  static async updateBankInfo(
    userId: number,
    data: UpdateBankInfoRequest,
  ): Promise<BankInfoResponse> {
    try {
      const response = await api.put(`/suarec/users/${userId}/bank-info`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error updating bank info:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error al actualizar información bancaria",
      };
    }
  }

  // Eliminar información bancaria
  static async deleteBankInfo(userId: number): Promise<BankInfoResponse> {
    try {
      await api.delete(`/suarec/users/${userId}/bank-info`);
      return {
        success: true,
        message: "Información bancaria eliminada exitosamente",
      };
    } catch (error: any) {
      console.error("Error deleting bank info:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error al eliminar información bancaria",
      };
    }
  }

  // Obtener información bancaria como admin
  static async getBankInfoAsAdmin(userId: number): Promise<BankInfoResponse> {
    try {
      const response = await api.get(`/suarec/users/${userId}/bank-info/admin`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          success: true,
          data: undefined,
          message: "No se encontró información bancaria",
        };
      }
      console.error("Error fetching bank info as admin:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error al obtener información bancaria",
      };
    }
  }
}
