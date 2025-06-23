"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

const RegisterAttendancePageContent = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setCurrentUserId(decoded.id);
      } catch (error) {
        console.error('Error al decodificar token:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchCompanyInfo();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (employees.length === 1) {
      setSelectedEmployee(employees[0]);
    }
  }, [employees]);

  const fetchCompanyInfo = async () => {
    try {
      const response = await CompanyService.getCompanies({ page: 1, limit: 100 });
      const userCompany = response.data.data.find(company => 
        company.user && parseInt(company.user.id || '0') === currentUserId
      );
      
      if (userCompany) {
        setCompanyInfo(userCompany);
        fetchEmployees(userCompany.id);
      } else {
        setError("No se encontró una empresa asociada a tu usuario");
      }
    } catch (err) {
      console.error("Error al cargar información de la empresa:", err);
      setError("Error al cargar la información de la empresa");
    }
  };

  const fetchEmployees = async (companyId: string) => {
    try {
      setLoading(true);
      const response = await CompanyService.getEmployees(companyId);
      setEmployees(response.data.data);
    } catch (err) {
      console.error("Error al cargar empleados:", err);
      setError("Error al cargar los empleados");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAttendance = async () => {
    console.log("Empleado para registrar (register):", selectedEmployee);
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
      await AttendanceService.registerAttendance(
        Number(selectedEmployee.id),
        checkInTime,
        new Date(date)
      );
      setSuccess("Asistencia registrada correctamente");
      setCheckInTime("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Error al registrar la asistencia");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoadingRegister(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    console.log("Empleado en lista (register):", employee);
    return (
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12 pt-20">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <Building2 className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Registrar asistencia</h1>
                {companyInfo && (
                  <p className="mt-2 text-blue-100">
                    {companyInfo.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
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
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-green-800 font-medium">Éxito</h3>
                  <p className="text-green-700">{success}</p>
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
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="h-6 w-6 text-[#097EEC]" />
                    Empleados
                  </h2>
                  <div className="space-y-2">
                    {filteredEmployees.map((employee) => (
                      <button
                        key={employee.id}
                        onClick={() => {
                          console.log("Empleado seleccionado (register):", employee);
                          setSelectedEmployee(employee);
                        }}
                        className={`w-full text-left p-4 rounded-lg transition-colors ${
                          selectedEmployee?.id === employee.id
                            ? "bg-[#097EEC] text-white"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{employee.name}</h3>
                            <p className="text-sm opacity-80">{employee.email}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Registration Form */}
                <div className="lg:col-span-2">
                  {selectedEmployee ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-6">
                        Registrar asistencia
                      </h2>
                      
                      <div className="space-y-6">
                        {/* Employee Info */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 bg-[#097EEC]/10 rounded-full flex items-center justify-center">
                            <UserIcon className="h-8 w-8 text-[#097EEC]" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{selectedEmployee.name}</h3>
                            <p className="text-sm text-gray-500">{selectedEmployee.email}</p>
                          </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fecha
                            </label>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-gray-400" />
                              <input
                                type="date"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
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
                              <Clock className="h-5 w-5 text-gray-400" />
                              <input
                                type="time"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
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
                          className="w-full bg-[#097EEC] text-white px-4 py-3 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingRegister ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Registrando...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-5 w-5" />
                              <span>Registrar asistencia</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">Selecciona un Empleado</h3>
                      <p className="text-gray-500">Elige un empleado para registrar su asistencia</p>
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