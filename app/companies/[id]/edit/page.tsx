'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CompanyService from '@/services/CompanyService';
import { Company } from '@/interfaces/company.interface';
import Navbar from '@/components/navbar';
import CompanyLocationForm from '@/components/company-location-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditCompanyPage({ params }: { params: { id: string } }) {
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

  const handleLocationSave = () => {
    // Recargar los datos de la empresa después de guardar la ubicación
    router.refresh();
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
            <div className="mb-4">
              <Link href={`/companies/${params.id}`} className="inline-flex items-center text-[#097EEC] hover:text-[#0A6BC7] font-medium">
                <ArrowLeft className="h-5 w-5 mr-1" /> Volver a detalles de la empresa
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar Empresa</h1>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <CompanyLocationForm
                companyId={params.id}
                initialData={company}
                onSave={handleLocationSave}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 