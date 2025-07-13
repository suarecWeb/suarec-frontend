'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('transaction_id');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50">
      <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
        <h1 className="text-3xl font-bold text-yellow-700 mb-4">Pago pendiente</h1>
        <p className="text-lg text-gray-700 mb-2">Tu pago está siendo procesado.</p>
        <p className="text-md text-gray-600 mb-4">Te notificaremos cuando el pago sea confirmado.</p>
        {transactionId && (
          <p className="text-sm text-gray-500 mb-4">ID de transacción: <span className="font-mono">{transactionId}</span></p>
        )}
        <div className="flex gap-4">
          <a href="/contracts" className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">
            Volver a mis contrataciones
          </a>
          <a href="/payments" className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            Ver historial de pagos
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50">
        <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
          <h1 className="text-3xl font-bold text-yellow-700 mb-4">Pago pendiente</h1>
          <p className="text-lg text-gray-700 mb-2">Tu pago está siendo procesado.</p>
          <p className="text-md text-gray-600 mb-4">Te notificaremos cuando el pago sea confirmado.</p>
          <div className="flex gap-4">
            <a href="/contracts" className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">
              Volver a mis contrataciones
            </a>
            <a href="/payments" className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
              Ver historial de pagos
            </a>
          </div>
        </div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  );
}
