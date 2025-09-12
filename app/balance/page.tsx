"use client";

import { BalanceCard } from "@/components/BalanceCard";
import { BalanceHistory } from "@/components/BalanceHistory";

import Navbar from "@/components/navbar";

export default function BalancePage() {
  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#097EEC] to-[#0A6BC7] text-white py-12 pt-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Balance de Cuenta</h1>
            <p className="text-blue-100 text-lg">
              Gestiona tu saldo y revisa el historial de transacciones
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-6 pb-12">
          {/* Balance Card */}
          <div className="mb-8">
            <BalanceCard />
          </div>

          {/* Balance History */}
          <div>
            <BalanceHistory />
          </div>
        </div>
      </div>
    </>
  );
}
