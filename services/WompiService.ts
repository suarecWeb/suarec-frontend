import axios from "axios";

export class WompiService {
  static async getAcceptanceTokens(publicKey: string) {
    const env = process.env.NEXT_PUBLIC_WOMPI_ENV || "sandbox";
    const baseUrl =
      env === "production"
        ? "https://production.wompi.co/v1"
        : "https://sandbox.wompi.co/v1";
    const url = `${baseUrl}/merchants/${publicKey}`;
    const response = await axios.get(url);
    return response.data.data;
  }
}
