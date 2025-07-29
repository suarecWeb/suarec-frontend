export interface AttendanceRecord {
  id: number;
  date: Date;
  checkInTime: string;
  isLate: boolean;
  isAbsent: boolean;
  deleted_at?: Date;
  employee: {
    id: number;
    name: string;
    email: string;
  };
  notes?: string;
}

export interface AttendanceStats {
  totalDays: number;
  lateDays: number;
  absentDays: number;
  timeInCompany: number;
}

export interface CompanyCheckinTime {
  id: string;
  checkInTime: string;
  companyId: string;
}

export interface CompanyAttendanceStats {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  totalAttendanceDays: number;
  averageAttendanceRate: number;
  employeeStats: {
    employeeId: number;
    employeeName: string;
    attendanceDays: number;
    lateDays: number;
    absentDays: number;
    attendanceRate: number;
  }[];
}
