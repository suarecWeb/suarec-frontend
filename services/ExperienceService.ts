import api from "./axios_config";
import { Experience } from "@/interfaces/user.interface";

const baseURL = "/suarec/experiences";

export class ExperienceService {
  static async createExperience(
    experience: Omit<Experience, "id" | "created_at" | "updated_at">,
  ) {
    return api.post(baseURL, experience);
  }

  static async getUserExperiences(userId: number) {
    return api.get(`${baseURL}/user/${userId}`);
  }

  static async updateExperience(id: string, experience: Partial<Experience>) {
    return api.put(`${baseURL}/${id}`, experience);
  }

  static async deleteExperience(id: string) {
    return api.delete(`${baseURL}/${id}`);
  }
}
