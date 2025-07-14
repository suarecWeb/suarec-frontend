"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PaymentRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');
  const [message, setMessage] = useState('Procesando resultado del pago...');

  const transactionId = params.transactionId as string;

  useEffect(() => {
    if (!transactionId) {
      setStatus('error');
      setMessage('ID de transacción no válido');
      return;
    }

    const handleRedirect = async () => {
      try {
        setStatus('redirecting');
        setMessage('Obteniendo información del pago...');

        // Obtener los parámetros de Wompi si existen
        const wompiId = searchParams.get('id');
        const env = searchParams.get('env');
        const wompiStatus = searchParams.get('status');

        console.log('📋 Parámetros de redirección:', {
          transactionId,
          wompiId,
          env,
          wompiStatus
        });

        // Hacer una petición al backend para obtener el estado actual de la transacción
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/suarec/payments/${transactionId}`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}` || ''
          }
        });

        if (!response.ok) {
          throw new Error('No se pudo obtener información de la transacción');
        }

        const transaction = await response.json();
        console.log('💳 Estado de la transacción:', transaction.status);

        // Redirigir según el estado de la transacción
        switch (transaction.status) {
          case 'COMPLETED':
          case 'FINISHED':
            router.replace(`/payments/success?transaction_id=${transactionId}`);
            break;
          case 'FAILED':
          case 'DECLINED':
          case 'ERROR':
            router.replace(`/payments/failed?transaction_id=${transactionId}`);
            break;
          case 'PENDING':
          case 'PROCESSING':
          default:
            router.replace(`/payments/pending?transaction_id=${transactionId}`);
            break;
        }
      } catch (error) {
        console.error('❌ Error al procesar redirección:', error);
        setStatus('error');
        setMessage('Error al procesar el resultado del pago');
        
        // Redirigir a página de error después de 3 segundos
        setTimeout(() => {
          router.replace(`/payments/failed?transaction_id=${transactionId}&error=redirect_error`);
        }, 3000);
      }
    };

    handleRedirect();
  }, [transactionId, searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <Loader2 className="h-12 w-12 text-[#097EEC] animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' && 'Cargando...'}
            {status === 'redirecting' && 'Redirigiendo...'}
            {status === 'error' && 'Error'}
          </h1>
          <p className="text-gray-600">
            {message}
          </p>
        </div>

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
            <h3 className="text-red-800 font-medium mb-2">Información de depuración:</h3>
            <ul className="text-red-700 text-sm space-y-1">
              <li>ID de transacción: {transactionId}</li>
              <li>Parámetros URL: {searchParams.toString()}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
