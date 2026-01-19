"use client";

import { Briefcase, Users, FileText } from "lucide-react";
import React from "react";

interface Contract {
  id: string;
}

interface KPIsProps {
  contracts: {
    asClient: Contract[];
    asProvider: Contract[];
  };
  activeTab: "client" | "provider" | "all";
  setActiveTab: (tab: "client" | "provider" | "all") => void;
  clientContent?: React.ReactNode;
  providerContent?: React.ReactNode;
  allContent?: React.ReactNode;
}

export function KPIs({
  contracts,
  activeTab,
  setActiveTab,
  clientContent,
  providerContent,
  allContent,
}: KPIsProps) {
  return (
    <div className="flex flex-col gap-6 mb-8 mt-8">
      {/* Contrataciones Solicitadas Card */}
      <div>
        <button
          onClick={() => setActiveTab("client")}
          className={`w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 text-left hover:shadow-md hover:-translate-y-1 ${
            activeTab === "client"
              ? "border-blue-200 bg-blue-50"
              : "hover:border-gray-200"
          }`}
        >
          <div className="flex items-center gap-4 mb-3">
            <div
              className={`p-3 rounded-lg transition-all duration-200 ${
                activeTab === "client"
                  ? "bg-[#097EEC] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Contrataciones Solicitadas
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {contracts.asClient.length}
              </p>
            </div>
          </div>
          {activeTab === "client" && (
            <div className="bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-700 font-semibold">
                Sección activa
              </div>
            </div>
          )}
        </button>
        {/* Contenido de Contrataciones Solicitadas - aparece debajo de esta KPI */}
        {activeTab === "client" && clientContent && (
          <div className="mt-4">{clientContent}</div>
        )}
      </div>

      {/* Servicios Ofrecidos Card */}
      <div>
        <button
          onClick={() => setActiveTab("provider")}
          className={`w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 text-left hover:shadow-md hover:-translate-y-1 ${
            activeTab === "provider"
              ? "border-blue-200 bg-blue-50"
              : "hover:border-gray-200"
          }`}
        >
          <div className="flex items-center gap-4 mb-3">
            <div
              className={`p-3 rounded-lg transition-all duration-200 ${
                activeTab === "provider"
                  ? "bg-[#097EEC] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Servicios Ofrecidos
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {contracts.asProvider.length}
              </p>
            </div>
          </div>
          {activeTab === "provider" && (
            <div className="bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-700 font-semibold">
                Sección activa
              </div>
            </div>
          )}
        </button>
        {/* Contenido de Servicios Ofrecidos - aparece debajo de esta KPI */}
        {activeTab === "provider" && providerContent && (
          <div className="mt-4">{providerContent}</div>
        )}
      </div>

      {/* Total de Contratos Card */}
      <div>
        <button
          onClick={() => setActiveTab("all")}
          className={`w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 text-left hover:shadow-md hover:-translate-y-1 ${
            activeTab === "all"
              ? "border-blue-200 bg-blue-50"
              : "hover:border-gray-200"
          }`}
        >
          <div className="flex items-center gap-4 mb-3">
            <div
              className={`p-3 rounded-lg transition-all duration-200 ${
                activeTab === "all"
                  ? "bg-[#097EEC] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Total de Contratos
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {contracts.asClient.length + contracts.asProvider.length}
              </p>
            </div>
          </div>
          {activeTab === "all" && (
            <div className="bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-700 font-semibold">
                Sección activa
              </div>
            </div>
          )}
        </button>
        {/* Contenido de Total de Contratos - muestra tanto clientContent como providerContent */}
        {activeTab === "all" && (
          <div className="mt-4">
            {clientContent}
            {providerContent}
          </div>
        )}
      </div>
    </div>
  );
}
