import api from "./axios_config";

export interface WompiBank {
  id: string;
  name: string;
  code: string;
}

export interface BanksResponse {
  success: boolean;
  data?: WompiBank[];
  message?: string;
}

export class BanksService {
  // Obtener lista de bancos desde Wompi
  static async getBanks(): Promise<BanksResponse> {
    try {
      const response = await api.get("/suarec/banks");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error fetching banks:", error);

      // Fallback: usar lista local si la API falla
      return {
        success: true,
        data: this.getFallbackBanks(),
        message:
          "Se está usando la lista de bancos local debido a un error de conectividad",
      };
    }
  }

  private static getFallbackBanks(): WompiBank[] {
    return [
      { id: "001", name: "Bancolombia", code: "1007" },
      { id: "002", name: "Banco de Bogotá", code: "1001" },
      { id: "003", name: "Banco Popular", code: "1002" },
      { id: "004", name: "BBVA Colombia", code: "1013" },
      { id: "005", name: "Banco Davivienda", code: "1051" },
      { id: "006", name: "Banco de Occidente", code: "1023" },
      { id: "007", name: "Banco Caja Social", code: "1032" },
      { id: "008", name: "Banco AV Villas", code: "1052" },
      { id: "009", name: "Banco Santander", code: "1065" },
      { id: "010", name: "Banco Agrario", code: "1040" },
      { id: "011", name: "Banco Falabella", code: "1062" },
      { id: "012", name: "Banco Pichincha", code: "1060" },
      { id: "013", name: "Banco Serfinanza", code: "1069" },
      { id: "014", name: "Banco Mundo Mujer", code: "1047" },
      { id: "015", name: "Banco Cooperativo Coopcentral", code: "1066" },
      { id: "016", name: "Banco Credifinanciera", code: "1558" },
      { id: "017", name: "Banco GNB Sudameris", code: "1012" },
      { id: "018", name: "Banco Itaú", code: "1006" },
      { id: "019", name: "Banco Procredit", code: "1058" },
      { id: "020", name: "Banco W", code: "1053" },
      { id: "021", name: "Bancoomeva", code: "1061" },
      { id: "022", name: "CFA Cooperativa Financiera", code: "1292" },
      { id: "023", name: "Confiar Cooperativa Financiera", code: "1292" },
      { id: "024", name: "Coofinep Cooperativa Financiera", code: "1291" },
      { id: "025", name: "Finandina", code: "1120" },
      { id: "026", name: "Lulo Bank", code: "1080" },
      { id: "027", name: "Nequi", code: "1507" },
      { id: "028", name: "Rappipay", code: "1151" },
    ];
  }
}
