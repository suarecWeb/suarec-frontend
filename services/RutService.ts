import api from "./axios_config";

export interface RutDocument {
  id: number;
  file_url: string;
  file_path: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  user_id: number;
  reviewed_by?: number;
  reviewedBy?: {
    id: number;
    name: string;
  };
}

export const RutService = {
  async getUserRutById(userId: number | string): Promise<RutDocument[]> {
    const { data } = await api.get(`/suarec/users/${userId}/rut`);
    return data;
  },

  async reviewRut(
    rutId: number,
    status: "approved" | "rejected",
    description?: string,
  ): Promise<RutDocument> {
    const { data } = await api.patch(`/suarec/users/rut/${rutId}/review`, {
      status,
      description,
    });
    return data;
  },
};
