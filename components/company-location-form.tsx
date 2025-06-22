'use client';

import { useState } from 'react';
import { Company } from '@/interfaces/company.interface';
import CompanyService from '@/services/CompanyService';

interface CompanyLocationFormProps {
  companyId: string;
  initialData?: Partial<Company>;
  onSave?: () => void;
}

export default function CompanyLocationForm({ 
  companyId, 
  initialData,
  onSave 
}: CompanyLocationFormProps) {
  const [formData, setFormData] = useState({
    latitude: initialData?.latitude || 3.3417,
    longitude: initialData?.longitude || -76.5306,
    address: initialData?.address || '',
    city: initialData?.city || '',
    country: initialData?.country || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await CompanyService.updateLocation(companyId, formData);
      setSuccess(true);
      onSave?.();
    } catch (err) {
      setError('Error al actualizar la ubicación');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Ubicación de la Empresa</h3>
        
        {/* Campos de dirección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Dirección
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#097EEC] focus:ring-[#097EEC] sm:text-sm"
              placeholder="Calle 18 #122-135"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              Ciudad
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#097EEC] focus:ring-[#097EEC] sm:text-sm"
              placeholder="Cali"
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              País
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#097EEC] focus:ring-[#097EEC] sm:text-sm"
              placeholder="Colombia"
            />
          </div>
        </div>

        {/* Coordenadas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
              Latitud
            </label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              step="any"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#097EEC] focus:ring-[#097EEC] sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
              Longitud
            </label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              step="any"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#097EEC] focus:ring-[#097EEC] sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Éxito</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Ubicación actualizada correctamente</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-[#097EEC] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#0A6BC7] focus:outline-none focus:ring-2 focus:ring-[#097EEC] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar Ubicación'}
        </button>
      </div>
    </form>
  );
} 