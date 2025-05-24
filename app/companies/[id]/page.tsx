"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import CompanyService from "@/services/CompanyService";
import { Company } from '@/interfaces/company.interface';
import Navbar from "@/components/navbar";
import StartChatButton from "@/components/start-chat-button";
import ApplyCompanyButton from "@/components/apply-company-button";
import { MapPin, Edit, ArrowLeft, Users, MessageSquare, Briefcase } from 'lucide-react';
import Link from "next/link";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";

export default function CompanyDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setCurrentUserId(decoded.id);
        setUserRoles(decoded.roles.map(role => role.name));
      } catch (error) {
        console.error("Error al decodificar token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await CompanyService.getCompanyById(params.id);
        setCompany(response.data);
      } catch (err) {
        setError('Error al cargar la empresa');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [params.id]);

  const isOwnerOrAdmin = () => {
    if (!company || !currentUserId) return false;
    return company.user?.id === currentUserId.toString() || userRoles.includes("ADMIN");
  };

  const canApply = () => {
    if (!currentUserId || !company) return false;
    return userRoles.includes("PERSON") && company.user?.id !== currentUserId.toString();
  };

  const canChat = () => {
    console.log(company)
    if (!currentUserId || !company) return false;
    return company.user?.id !== currentUserId.toString();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !company) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error || 'No se pudo cargar la empresa'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Botón de volver */}
            <div className="mb-4">
              <Link href="/companies" className="inline-flex items-center text-[#097EEC] hover:text-[#0A6BC7] font-medium">
                <ArrowLeft className="h-5 w-5 mr-1" /> Volver a compañías
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">{company.name}</h1>
                  
                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>
                      <div className="space-y-3">
                        <p><span className="font-medium">NIT:</span> {company.nit}</p>
                        <p><span className="font-medium">Email:</span> {company.email}</p>
                        <p><span className="font-medium">Teléfono:</span> {company.cellphone}</p>
                        <p><span className="font-medium">Fecha de fundación:</span> {new Date(company.born_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {/* Ubicación */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Ubicación</h2>
                        {isOwnerOrAdmin() && (
                          <Link 
                            href={`/companies/${company.id}/edit`}
                            className="inline-flex items-center text-[#097EEC] hover:text-[#0A6BC7]"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            <span>Editar ubicación</span>
                          </Link>
                        )}
                      </div>
                      {company.latitude && company.longitude ? (
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div>
                              <p className="text-gray-900">{company.address}</p>
                              <p className="text-gray-600">{company.city}, {company.country}</p>
                              <p className="text-sm text-gray-500">
                                Coordenadas: {typeof company.latitude === "number" && typeof company.longitude === "number"
                                  ? `${company.latitude.toFixed(4)}, ${company.longitude.toFixed(4)}`
                                  : "No disponible"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">No hay ubicación registrada</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 md:min-w-[200px]">
                  {isOwnerOrAdmin() && (
                    <>
                      <Link href={`/companies/${company.id}/employees`}>
                        <button className="w-full bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Gestionar Empleados</span>
                        </button>
                      </Link>
                      
                      <Link href={`/companies/${company.id}/edit`}>
                        <button className="w-full border border-[#097EEC] text-[#097EEC] px-4 py-2 rounded-lg hover:bg-[#097EEC]/5 transition-colors flex items-center justify-center gap-2">
                          <Edit className="h-4 w-4" />
                          <span>Editar Empresa</span>
                        </button>
                      </Link>
                    </>
                  )}

                  {canApply() && (
                    <ApplyCompanyButton
                      companyId={company.id!}
                      companyName={company.name}
                      companyUserId={parseInt(company.id)}
                      className="w-full"
                    />
                  )}

                  {canChat() && company.user && (
                    <StartChatButton
                      recipientId={parseInt(company.user.id || '2')}
                      recipientName={company.user.name || company.name}
                      className="w-full"
                    />
                  )}

                  {currentUserId && (
                    <Link href={`/companies/${company.id}/employees`}>
                      <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Ver Empleados</span>
                      </button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Company Stats/Info Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#097EEC]">
                      {company.user ? "1" : "0"}
                    </div>
                    <div className="text-sm text-gray-600">Administrador</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#097EEC]">
                      {/* Este número se podría obtener del endpoint de empleados */}
                      -
                    </div>
                    <div className="text-sm text-gray-600">Empleados</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#097EEC]">
                      {new Date(company.created_at).getFullYear()}
                    </div>
                    <div className="text-sm text-gray-600">Año de registro</div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {company.user && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Administrador: {company.user.name}</p>
                        <p className="text-sm text-gray-600">{company.user.email}</p>
                      </div>
                      
                      {canChat() && (
                        <div className="flex gap-2">
                          <StartChatButton
                            recipientId={parseInt(company.user?.id || '2')}
                            recipientName={company.user.name || company.name}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Call to Action for non-logged users */}
              {!currentUserId && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="text-center bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Interesado en esta empresa?</h3>
                    <p className="text-gray-600 mb-4">Inicia sesión para poder postularte o contactar con la empresa</p>
                    <div className="flex justify-center gap-3">
                      <Link href="/auth/login">
                        <button className="bg-[#097EEC] text-white px-6 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors">
                          Iniciar Sesión
                        </button>
                      </Link>
                      <Link href="/auth/select-type">
                        <button className="border border-[#097EEC] text-[#097EEC] px-6 py-2 rounded-lg hover:bg-[#097EEC]/5 transition-colors">
                          Registrarse
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}