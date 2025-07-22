"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/navbar";
import AttendanceService from "@/services/AttendanceService";
import { User } from "@/interfaces/user.interface";
import RoleGuard from "@/components/role-guard";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import {
  Users,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  User as UserIcon,
  Building2,
  Clock4,
  CalendarCheck,
  CalendarX,
  Timer,
  Pencil,
  Trash2,
  Save,
  X,
  ArrowLeft,
  Settings,
} from "lucide-react";
import CompanyService from "@/services/CompanyService";
import { useRouter } from "next/navigation";
import {
  CompanyCheckinTime,
  CompanyAttendanceStats,
} from "@/interfaces/attendance.interface";
import toast from "react-hot-toast";

interface AttendanceStats {
  totalDays: number;
  lateDays: number;
  absentDays: number;
  timeInCompany: number;
}

interface AttendanceRecord {
  id: number;
  date: Date;
  checkInTime: string;
  isLate: boolean;
  isAbsent: boolean;
  employee: User;
  notes?: string;
}

const AttendancePageContent = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [attendanceStats, setAttendanceStats] =
    useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 30)),
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [editCheckInTime, setEditCheckInTime] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);

  // Estados para configuración de hora de check-in
  const [companyCheckinTime, setCompanyCheckinTime] =
    useState<CompanyCheckinTime | null>(null);
  const [showCheckinConfig, setShowCheckinConfig] = useState(false);
  const [newCheckinTime, setNewCheckinTime] = useState("");
  const [updatingCheckinTime, setUpdatingCheckinTime] = useState(false);
  const [companyAttendanceStats, setCompanyAttendanceStats] =
    useState<CompanyAttendanceStats | null>(null);

  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setCurrentUserId(decoded.id);
      } catch (error) {
        console.error("Error al decodificar token:", error);
      }
    }
  }, []);

  const fetchCompanyAttendanceStats = useCallback(async () => {
    try {
      const response = await AttendanceService.getCompanyAttendanceStats(
        startDate,
        endDate,
      );

      setCompanyAttendanceStats(response);
    } catch (err) {
      console.error("Error al obtener estadísticas de la empresa:", err);
    }
  }, [startDate, endDate]);

  const fetchCompanyInfo = useCallback(async () => {
    try {
      const response = await CompanyService.getCompanies({
        page: 1,
        limit: 100,
      });
      const userCompany = response.data.data.find(
        (company) =>
          company.user && parseInt(company.user.id || "0") === currentUserId,
      );

      if (userCompany) {
        setCompanyInfo(userCompany);
        fetchEmployees(userCompany.id);
        fetchCompanyCheckinTime();
        fetchCompanyAttendanceStats();
      } else {
        toast.error("No se encontró una empresa asociada a tu usuario");
      }
    } catch (err) {
      toast.error("Error al cargar la información de la empresa");
    }
  }, [currentUserId, fetchCompanyAttendanceStats]);

  useEffect(() => {
    if (currentUserId) {
      fetchCompanyInfo();
    }
  }, [currentUserId, fetchCompanyInfo]);

  const fetchEmployees = async (companyId: string) => {
    try {
      setLoading(true);
      const response = await CompanyService.getEmployees(companyId, {
        status: "active",
      });
      setEmployees(response.data.data);
    } catch (err) {
      toast.error("Error al cargar los empleados");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeAttendance = async (employeeId: string) => {
    try {
      setLoadingAttendance(true);
      const [attendanceResponse, statsResponse] = await Promise.all([
        AttendanceService.getEmployeeAttendance(
          parseInt(employeeId),
          startDate,
          endDate,
        ),
        AttendanceService.getEmployeeAttendanceStats(parseInt(employeeId)),
      ]);
      setAttendanceRecords(attendanceResponse);
      setAttendanceStats(statsResponse);
    } catch (err) {
      toast.error("Error al cargar el registro de asistencia");
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleEmployeeSelect = (employee: User) => {
    if (!employee.id) {
      toast.error("ID de empleado no válido");
      return;
    }
    setSelectedEmployee(employee);
    fetchEmployeeAttendance(employee.id.toString());
  };

  const handleDateChange = (date: Date, isStartDate: boolean) => {
    if (isStartDate) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    if (selectedEmployee?.id) {
      fetchEmployeeAttendance(selectedEmployee.id.toString());
    }
    // Actualizar estadísticas de la empresa cuando cambie el rango de fechas
    setTimeout(() => {
      fetchCompanyAttendanceStats();
    }, 100);
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Funciones para manejo de configuración de hora de check-in
  const fetchCompanyCheckinTime = async () => {
    try {
      const response = await AttendanceService.getCompanyCheckinTime();
      setCompanyCheckinTime(response);
      setNewCheckinTime(response.checkInTime || "07:00");
    } catch (err) {
      toast.error("Error al obtener hora de check-in");
      // No mostrar error si no existe configuración
    }
  };

  const handleUpdateCheckinTime = async () => {
    if (!newCheckinTime) {
      toast.error("Por favor ingresa una hora válida");
      return;
    }

    try {
      setUpdatingCheckinTime(true);
      const response =
        await AttendanceService.updateCompanyCheckinTime(newCheckinTime);
      setCompanyCheckinTime(response);
      toast.success("Hora de check-in actualizada correctamente");
      setShowCheckinConfig(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      toast.error("Error al actualizar la hora de check-in");
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdatingCheckinTime(false);
    }
  };

  const startEditRecord = (record: AttendanceRecord) => {
    setEditingRecordId(record.id);
    setEditCheckInTime(record.checkInTime || "");
    setEditNotes((record as any).notes || "");
  };

  const cancelEditRecord = () => {
    setEditingRecordId(null);
    setEditCheckInTime("");
    setEditNotes("");
  };

  const saveEditRecord = async (record: AttendanceRecord) => {
    if (!record.employee?.id) {
      toast.error("No se puede actualizar: el empleado no tiene ID válido.");
      return;
    }
    try {
      await AttendanceService.updateAttendance(record.id.toString(), {
        checkInTime: editCheckInTime,
        notes: editNotes,
      });
      toast.success("Registro actualizado correctamente");
      setEditingRecordId(null);
      fetchEmployeeAttendance(record.employee.id.toString());
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      toast.error("Error al actualizar el registro");
      setTimeout(() => setError(null), 3000);
    }
  };

  const confirmDeleteRecord = (record: AttendanceRecord) => {
    setDeletingRecordId(record.id);
  };

  const deleteRecord = async (record: AttendanceRecord) => {
    if (!record.employee?.id) {
      toast.error("No se puede eliminar: el empleado no tiene ID válido.");
      return;
    }
    try {
      await AttendanceService.deleteAttendance(record.id.toString());
      toast.success("Registro eliminado correctamente");
      setDeletingRecordId(null);
      fetchEmployeeAttendance(record.employee.id.toString());
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      toast.error("Error al eliminar el registro");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRegisterAttendance = async (
    isAbsent: boolean = false,
    notes: string = "",
  ) => {
    if (!selectedEmployee || !selectedEmployee.id) {
      toast.error("Selecciona un empleado válido.");
      return;
    }
    if (!isAbsent && !editCheckInTime) {
      toast.error("Por favor ingresa la hora de llegada");
      return;
    }
    try {
      setLoadingAttendance(true);
      await AttendanceService.registerAttendance(
        Number(selectedEmployee.id),
        isAbsent ? "00:00" : editCheckInTime,
        new Date(),
        isAbsent,
        notes,
      );
      toast.success(
        isAbsent
          ? "Ausencia registrada correctamente"
          : "Asistencia registrada correctamente",
      );
      setEditCheckInTime("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      toast.error(
        isAbsent
          ? "Error al registrar la ausencia"
          : "Error al registrar la asistencia",
      );
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoadingAttendance(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12 pt-16">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-6 sm:py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4 flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold truncate">
                    Control de asistencia
                  </h1>
                  {companyInfo && (
                    <p className="mt-1 sm:mt-2 text-blue-100 text-sm sm:text-base truncate">
                      {companyInfo.name}
                    </p>
                  )}
                  {companyCheckinTime && (
                    <p className="mt-1 text-blue-200 text-xs sm:text-sm flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      Hora límite: {companyCheckinTime.checkInTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowCheckinConfig(true)}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium text-sm sm:text-base"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Configurar</span>
                </button>
                <button
                  onClick={() => router.push("/my-employees")}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium text-sm sm:text-base"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Mis Empleados</span>
                  <span className="sm:hidden">Empleados</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          {/* Breadcrumb */}
          <div className="bg-white rounded-t-lg px-4 sm:px-6 py-3 border-b border-gray-200">
            <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 overflow-x-auto">
              <button
                onClick={() => router.push("/my-employees")}
                className="hover:text-[#097EEC] transition-colors whitespace-nowrap"
              >
                Mis Empleados
              </button>
              <span>/</span>
              <span className="text-gray-900 font-medium whitespace-nowrap">
                Control de Asistencia
              </span>
            </nav>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-4 sm:p-6">
            {/* Search Bar */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar empleados..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Date Range Selector */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="date"
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none flex-1 min-w-0"
                    value={startDate.toISOString().split("T")[0]}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      handleDateChange(newDate, true);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="date"
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none flex-1 min-w-0"
                    value={endDate.toISOString().split("T")[0]}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      handleDateChange(newDate, false);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700 break-words">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-green-800 font-medium">Éxito</h3>
                  <p className="text-green-700 break-words">{success}</p>
                </div>
              </div>
            )}

            {/* Main Content */}
            {loading ? (
              <div className="py-32 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Employees List */}
                <div className="lg:col-span-1 lg:border-r lg:border-gray-100 lg:pr-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#097EEC]" />
                    Empleados
                  </h2>
                  <div className="space-y-2 max-h-96 lg:max-h-none overflow-y-auto">
                    {filteredEmployees.map((employee) => (
                      <button
                        key={employee.id}
                        onClick={() => handleEmployeeSelect(employee)}
                        className={`w-full text-left p-3 sm:p-4 rounded-lg transition-colors border ${
                          selectedEmployee?.id === employee.id
                            ? "bg-[#097EEC] text-white border-[#097EEC] shadow-lg"
                            : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm sm:text-base truncate">
                              {employee.name}
                            </h3>
                            <p className="text-xs sm:text-sm opacity-80 truncate">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attendance Details */}
                <div className="lg:col-span-2 transition-all duration-300">
                  {selectedEmployee ? (
                    <>
                      {/* Header con datos del empleado y acción rápida */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b pb-4">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#097EEC]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-6 w-6 sm:h-8 sm:w-8 text-[#097EEC]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                              {selectedEmployee.name}
                            </h2>
                            <p className="text-gray-500 text-sm sm:text-base truncate">
                              {selectedEmployee.email}
                            </p>
                          </div>
                        </div>
                        <button
                          className="bg-[#097EEC] hover:bg-[#0A6BC7] text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 shadow transition-colors text-sm sm:text-base flex-shrink-0"
                          onClick={() =>
                            router.push(
                              `/attendance/register?employeeId=${selectedEmployee.id}`,
                            )
                          }
                        >
                          <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Registrar asistencia</span>
                        </button>
                      </div>

                      {/* Employee Stats */}
                      {attendanceStats && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <CalendarCheck className="h-6 w-6 sm:h-8 sm:w-8 text-[#097EEC] flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-lg sm:text-2xl font-bold truncate">
                                  {attendanceStats.totalDays}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  Días Asistidos
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Clock4 className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-lg sm:text-2xl font-bold truncate">
                                  {attendanceStats.lateDays}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  Días Tardanza
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <CalendarX className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-lg sm:text-2xl font-bold truncate">
                                  {attendanceStats.absentDays}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  Días Ausente
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Timer className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-lg sm:text-2xl font-bold truncate">
                                  {attendanceStats.timeInCompany}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  Años en la Empresa
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Attendance Records */}
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Registro de Asistencia
                          </h3>
                          <button
                            onClick={() => {
                              if (!selectedEmployee?.id) return;
                              const today = new Date();
                              const isAlreadyRegistered =
                                attendanceRecords.some(
                                  (record) =>
                                    new Date(record.date).toDateString() ===
                                    today.toDateString(),
                                );
                              if (isAlreadyRegistered) {
                                toast.error("Ya existe un registro para hoy");
                                return;
                              }
                              handleRegisterAttendance(true, "Ausencia manual");
                            }}
                            className="text-red-600 hover:text-red-800 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-sm sm:text-base"
                          >
                            <CalendarX className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">
                              Marcar Ausente
                            </span>
                            <span className="sm:hidden">Ausente</span>
                          </button>
                        </div>
                        {loadingAttendance ? (
                          <div className="py-8 flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#097EEC]"></div>
                          </div>
                        ) : attendanceRecords.length === 0 ? (
                          <div className="py-12 text-center text-gray-500 px-4">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-sm sm:text-base">
                              No hay asistencias registradas para este empleado
                              en el rango seleccionado.
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200">
                            {attendanceRecords.map((record) => (
                              <div
                                key={record.id}
                                className={`p-4 hover:bg-gray-50 transition-colors ${record.isAbsent ? (record.notes === "Ausencia automática" ? "bg-red-50" : "bg-yellow-50") : ""}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div
                                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        record.isLate
                                          ? "bg-yellow-100"
                                          : record.isAbsent
                                            ? record.notes ===
                                              "Ausencia automática"
                                              ? "bg-red-200"
                                              : "bg-yellow-200"
                                            : "bg-green-100"
                                      }`}
                                    >
                                      {record.isLate ? (
                                        <Clock4 className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                                      ) : record.isAbsent ? (
                                        <CalendarX
                                          className={`h-4 w-4 sm:h-5 sm:w-5 ${record.notes === "Ausencia automática" ? "text-red-600" : "text-yellow-600"}`}
                                        />
                                      ) : (
                                        <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                                        {formatDate(record.date)}
                                      </p>
                                      <p className="text-xs sm:text-sm text-gray-500">
                                        {record.isAbsent ? (
                                          <>
                                            Ausente
                                            {record.notes ===
                                              "Ausencia automática" && (
                                              <span className="ml-2 text-xs text-red-500 font-semibold">
                                                (Automática)
                                              </span>
                                            )}
                                            {record.notes ===
                                              "Ausencia manual" && (
                                              <span className="ml-2 text-xs text-yellow-500 font-semibold">
                                                (Manual)
                                              </span>
                                            )}
                                          </>
                                        ) : (
                                          `Llegada: ${formatTime(record.checkInTime)}`
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                                    <button
                                      className="text-blue-600 hover:text-blue-800 p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                      onClick={() => startEditRecord(record)}
                                      disabled={editingRecordId === record.id}
                                    >
                                      <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </button>
                                    <button
                                      className="text-red-600 hover:text-red-800 p-1.5 sm:p-2 rounded-lg hover:bg-red-50 transition-colors"
                                      onClick={() =>
                                        confirmDeleteRecord(record)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </button>
                                  </div>
                                </div>
                                {editingRecordId === record.id && (
                                  <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="grid grid-cols-1 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Hora de llegada
                                        </label>
                                        <input
                                          type="time"
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                                          value={editCheckInTime}
                                          onChange={(e) =>
                                            setEditCheckInTime(e.target.value)
                                          }
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Notas
                                        </label>
                                        <input
                                          type="text"
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                                          placeholder="Notas adicionales"
                                          value={editNotes}
                                          onChange={(e) =>
                                            setEditNotes(e.target.value)
                                          }
                                        />
                                      </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                      <button
                                        className="bg-[#097EEC] hover:bg-[#0A6BC7] text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                                        onClick={() => saveEditRecord(record)}
                                      >
                                        <Save className="h-4 w-4 sm:h-5 sm:w-5" />{" "}
                                        Guardar
                                      </button>
                                      <button
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                                        onClick={cancelEditRecord}
                                      >
                                        <X className="h-4 w-4 sm:h-5 sm:w-5" />{" "}
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                )}
                                {deletingRecordId === record.id && (
                                  <div className="mt-4 p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                                    <p className="text-red-800 mb-4 text-sm sm:text-base">
                                      ¿Estás seguro de que deseas eliminar este
                                      registro?
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                      <button
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                                        onClick={() => deleteRecord(record)}
                                      >
                                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />{" "}
                                        Sí, eliminar
                                      </button>
                                      <button
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                                        onClick={() =>
                                          setDeletingRecordId(null)
                                        }
                                      >
                                        <X className="h-4 w-4 sm:h-5 sm:w-5" />{" "}
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-16 sm:py-24 text-center text-gray-500 transition-all duration-300 px-4">
                      <FileText className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-gray-300" />
                      <h3 className="text-xl sm:text-2xl font-semibold mb-2">
                        Selecciona un empleado
                      </h3>
                      <p className="mb-4 text-sm sm:text-base">
                        Haz clic en un empleado de la lista para ver su registro
                        de asistencia.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de configuración de hora de check-in */}
      {showCheckinConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="h-6 w-6 text-[#097EEC]" />
                Configurar Hora de Check-in
              </h2>
              <button
                onClick={() => setShowCheckinConfig(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora límite para las llegadas
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Los empleados que registren su llegada después de esta hora
                  serán marcados como tarde. El valor predeterminado es 07:00
                  AM.
                </p>
                <input
                  type="time"
                  value={newCheckinTime}
                  onChange={(e) => setNewCheckinTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateCheckinTime}
                disabled={updatingCheckinTime}
                className="flex-1 bg-[#097EEC] hover:bg-[#0A6BC7] text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updatingCheckinTime ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCheckinConfig(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AttendancePage = () => {
  return (
    <RoleGuard allowedRoles={["ADMIN", "BUSINESS"]}>
      <AttendancePageContent />
    </RoleGuard>
  );
};

export default AttendancePage;
