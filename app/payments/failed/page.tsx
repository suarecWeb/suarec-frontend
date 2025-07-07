'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('transaction_id');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
        <h1 className="text-3xl font-bold text-red-700 mb-4">Pago fallido</h1>
        <p className="text-lg text-gray-700 mb-2">Tu pago no pudo ser procesado o fue rechazado.</p>
        {transactionId && (
          <p className="text-sm text-gray-500">ID de transacción: <span className="font-mono">{transactionId}</span></p>
        )}
        <a href="/contracts" className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Volver a mis contrataciones</a>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
          <h1 className="text-3xl font-bold text-red-700 mb-4">Pago fallido</h1>
          <p className="text-lg text-gray-700 mb-2">Tu pago no pudo ser procesado o fue rechazado.</p>
          <a href="/contracts" className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Volver a mis contrataciones</a>
        </div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
} 