"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import CompanyService from "@/services/CompanyService";
import { Company } from '@/interfaces/company.interface';
import Navbar from "@/components/navbar";
import { MapPin, Edit, ArrowLeft } from 'lucide-react';
import Link from "next/link";

export default function CompanyDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                    <Link 
                      href={`/companies/${company.id}/edit`}
                      className="inline-flex items-center text-[#097EEC] hover:text-[#0A6BC7]"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      <span>Editar ubicación</span>
                    </Link>
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
          </div>
        </div>
      </div>
    </>
  );
}