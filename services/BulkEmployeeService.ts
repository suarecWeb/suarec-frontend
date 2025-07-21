import api from "./axios_config";

const baseURL = '/suarec/companies';

export interface BulkEmployeeUploadResponse {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;
  createdEmployees: Array<{
    id: number;
    name: string;
    email: string;
  }>;
}

class BulkEmployeeService {
  // Subir archivo Excel con datos de empleados
  async uploadEmployees(companyId: string, file: File): Promise<BulkEmployeeUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<BulkEmployeeUploadResponse>(
      `${baseURL}/${companyId}/employees/bulk-upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  // Descargar plantilla Excel
  async downloadTemplate(companyId: string): Promise<void> {
    const response = await api.get(`${baseURL}/${companyId}/employees/template`, {
      responseType: 'blob',
    });

    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla-empleados.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export default new BulkEmployeeService(); 