"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/navbar";
import AttendanceService from "@/services/AttendanceService";
import CompanyService from "@/services/CompanyService";
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
  Save,
  ArrowLeft,
  Settings,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CompanyCheckinTime } from "@/interfaces/attendance.interface";

const RegisterAttendancePageContent = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [companyCheckinTime, setCompanyCheckinTime] =
    useState<CompanyCheckinTime | null>(null);
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
      } else {
        setError("No se encontró una empresa asociada a tu usuario");
      }
    } catch (err) {
      console.error("Error al cargar información de la empresa:", err);
      setError("Error al cargar la información de la empresa");
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      fetchCompanyInfo();
    }
  }, [currentUserId, fetchCompanyInfo]);

  useEffect(() => {
    if (employees.length === 1) {
      setSelectedEmployee(employees[0]);
    }
  }, [employees]);

  const fetchEmployees = async (companyId: string) => {
    try {
      setLoading(true);
      const response = await CompanyService.getEmployees(companyId, {
        status: "active",
      });
      setEmployees(response.data.data);
    } catch (err) {
      console.error("Error al cargar empleados:", err);
      setError("Error al cargar los empleados");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyCheckinTime = async () => {
    try {
      const response = await AttendanceService.getCompanyCheckinTime();
      setCompanyCheckinTime(response);
    } catch (err) {
      console.error("Error al obtener hora de check-in:", err);
      // No mostrar error si no existe configuración
    }
  };

  const handleRegisterAttendance = async () => {
    if (!selectedEmployee || !selectedEmployee.id) {
      setError("Por favor selecciona un empleado válido.");
      return;
    }
    if (!checkInTime) {
      setError("Por favor ingresa la hora de llegada");
      return;
    }
    if (!date) {
      setError("Por favor selecciona la fecha");
      return;
    }
    try {
      setLoadingRegister(true);

      // Determinar si el empleado llega tarde
      let isLate = false;
      if (companyCheckinTime && companyCheckinTime.checkInTime) {
        const [checkHour, checkMinute] = checkInTime.split(":").map(Number);
        const [limitHour, limitMinute] = companyCheckinTime.checkInTime
          .split(":")
          .map(Number);

        const checkTimeInMinutes = checkHour * 60 + checkMinute;
        const limitTimeInMinutes = limitHour * 60 + limitMinute;

        isLate = checkTimeInMinutes > limitTimeInMinutes;
      }

      await AttendanceService.registerAttendance(
        Number(selectedEmployee.id),
        checkInTime,
        new Date(date),
        false, // isAbsent
        isLate
          ? `Llegada tarde (límite: ${companyCheckinTime?.checkInTime})`
          : undefined,
      );

      const lateMessage = isLate ? " (marcado como tarde)" : "";
      setSuccess(`Asistencia registrada correctamente${lateMessage}`);
      setCheckInTime("");
      setTimeout(() => {
        setSuccess(null);
        router.push("/attendance");
      }, 3000);
    } catch (err) {
      setError("Error al registrar la asistencia");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoadingRegister(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    return (
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Función helper para determinar si la hora será tarde
  const isCheckInLate = (checkTime: string): boolean => {
    if (!companyCheckinTime || !companyCheckinTime.checkInTime || !checkTime) {
      return false;
    }

    const [checkHour, checkMinute] = checkTime.split(":").map(Number);
    const [limitHour, limitMinute] = companyCheckinTime.checkInTime
      .split(":")
      .map(Number);

    const checkTimeInMinutes = checkHour * 60 + checkMinute;
    const limitTimeInMinutes = limitHour * 60 + limitMinute;

    return checkTimeInMinutes > limitTimeInMinutes;
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
                    Registrar asistencia
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

              {/* Botón para volver a Mis Empleados */}
              <button
                onClick={() => router.push("/my-employees")}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium text-sm sm:text-base flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Mis Empleados</span>
                <span className="sm:hidden">Empleados</span>
              </button>
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
                Registrar Asistencia
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

              {/* Date and Time Selector */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="date"
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none flex-1 min-w-0"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="time"
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none flex-1 min-w-0"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Indicador de llegada tarde */}
              {checkInTime && companyCheckinTime && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg border ${
                    isCheckInLate(checkInTime)
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-green-50 border-green-200 text-green-800"
                  }`}
                >
                  {isCheckInLate(checkInTime) ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Llegada tarde</p>
                        <p className="text-xs">
                          La hora límite es {companyCheckinTime.checkInTime}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Llegada a tiempo</p>
                        <p className="text-xs">
                          Dentro del horario (límite:{" "}
                          {companyCheckinTime.checkInTime})
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
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

            {/* Loading State */}
            {loading ? (
              <div className="py-32 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Employees List */}
                <div className="lg:col-span-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#097EEC]" />
                    Empleados
                  </h2>
                  <div className="space-y-2 max-h-96 lg:max-h-none overflow-y-auto">
                    {filteredEmployees.map((employee) => (
                      <button
                        key={employee.id}
                        onClick={() => {
                          setSelectedEmployee(employee);
                        }}
                        className={`w-full text-left p-3 sm:p-4 rounded-lg transition-colors ${
                          selectedEmployee?.id === employee.id
                            ? "bg-[#097EEC] text-white"
                            : "bg-gray-50 hover:bg-gray-100"
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

                {/* Registration Form */}
                <div className="lg:col-span-2">
                  {selectedEmployee ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
                        Registrar asistencia
                      </h2>

                      <div className="space-y-4 sm:space-y-6">
                        {/* Employee Info */}
                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#097EEC]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-6 w-6 sm:h-8 sm:w-8 text-[#097EEC]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              {selectedEmployee.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              {selectedEmployee.email}
                            </p>
                          </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fecha
                            </label>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              <input
                                type="date"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none min-w-0"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Hora de Llegada
                            </label>
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              <input
                                type="time"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none min-w-0"
                                value={checkInTime}
                                onChange={(e) => setCheckInTime(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          onClick={handleRegisterAttendance}
                          disabled={
                            loadingRegister ||
                            !selectedEmployee ||
                            typeof selectedEmployee.id !== "number" ||
                            !checkInTime ||
                            !date
                          }
                          className="w-full bg-[#097EEC] text-white px-4 py-3 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                          {loadingRegister ? (
                            <>
                              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                              <span>Registrando...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                              <span>Registrar asistencia</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Selecciona un Empleado
                      </h3>
                      <p className="text-gray-500 text-sm sm:text-base">
                        Elige un empleado para registrar su asistencia
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const RegisterAttendancePage = () => {
  return (
    <RoleGuard allowedRoles={["ADMIN", "BUSINESS"]}>
      <RegisterAttendancePageContent />
    </RoleGuard>
  );
};

export default RegisterAttendancePage;
