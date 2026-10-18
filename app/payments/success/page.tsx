"use client";
import { Suspense } from "react";

function PaymentSuccessContent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
        <h1 className="text-xl font-semibold text-gray-700">Procesando...</h1>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
          <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
            <h1 className="text-xl font-semibold text-gray-700">
              Procesando...
            </h1>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
