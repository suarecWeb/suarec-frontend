import { TokenPayload } from '@/interfaces/auth.interface';
import api from './axios_config';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from "next/navigation";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/suarec`;

class AttendanceService {
  async registerAttendance(employeeId: number, checkInTime: string, date: Date, isAbsent: boolean = false, notes?: string) {
    const token = Cookies.get('token');
    const payload: any = { employeeId, checkInTime, date, isAbsent };
    if (notes) payload.notes = notes;
    const response = await api.post(
      '/suarec/attendance/register',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  async getEmployeeAttendance(employeeId: number, startDate: Date, endDate: Date) {
    const token = Cookies.get('token');
    const response = await api.get(`/suarec/attendance/employee/${employeeId}`, {
      params: {
        startDate,
        endDate,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getEmployeeAttendanceStats(employeeId: number) {
    const token = Cookies.get('token');
    const response = await api.get(`/suarec/attendance/employee/${employeeId}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async generateAttendanceReport(startDate: Date, endDate: Date) {
    const token = Cookies.get('token');
    const response = await api.get(`/suarec/attendance/report`, {
      params: {
        startDate,
        endDate,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getAttendanceById(id: string) {
    const token = Cookies.get('token');
    const response = await api.get(`/suarec/attendance/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async updateAttendance(id: string, data: Partial<{ checkInTime: string; isLate: boolean; isAbsent: boolean; notes: string; date: Date }>) {
    const token = Cookies.get('token');
    const response = await api.put(`/suarec/attendance/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async deleteAttendance(id: string) {
    const token = Cookies.get('token');
    const response = await api.delete(`/suarec/attendance/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getCompanyCheckinTime() {
    const token = Cookies.get('token');
    const response = await api.get('/suarec/companies/me/checkin-time', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async updateCompanyCheckinTime(checkInTime: string) {
    const token = Cookies.get('token');
    const response = await api.patch('/suarec/companies/me/checkin-time', {
      checkInTime,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getCompanyAttendanceStats(startDate: Date, endDate: Date) {
    const token = Cookies.get('token');
    const response = await api.get('/suarec/companies/me/attendance-stats', {
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
}

export default new AttendanceService();