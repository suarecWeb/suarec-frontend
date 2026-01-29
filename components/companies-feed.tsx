"use client";
import { Company } from "@/interfaces/company.interface";
import { Building2, MapPin, Calendar, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { maskNit } from "@/components/utils/maskNit";
import { maskPhone } from "@/components/utils/maskPhone";
import { maskEmail } from "@/components/utils/maskEmail";
import { useNitVisibility } from "@/hooks/useNitVisibility";

interface CompaniesFeedProps {
  companies: Company[];
  limit?: number;
}

export default function CompaniesFeed({
  companies,
  limit = 5,
}: CompaniesFeedProps) {
  const { getNitVisibilityOptions } = useNitVisibility();

  // Ordenar para que SUAREC aparezca primero
  const sortedCompanies = [...companies].sort((a, b) => {
    // Normalizar nombres: quitar espacios y puntos, convertir a mayúsculas
    const normalizeA = a.name.toUpperCase().replace(/[\s.]/g, "");
    const normalizeB = b.name.toUpperCase().replace(/[\s.]/g, "");

    // Verificar si contiene SUAREC
    const aIsSuarec = normalizeA.includes("SUAREC");
    const bIsSuarec = normalizeB.includes("SUAREC");

    if (aIsSuarec && !bIsSuarec) return -1;
    if (!aIsSuarec && bIsSuarec) return 1;
    return 0;
  });

  // Limitar el número de empresas a mostrar
  const displayedCompanies = sortedCompanies.slice(0, limit);

  if (displayedCompanies.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-xl font-jakarta font-bold text-gray-900">
          Empresas Destacadas
        </h2>
        <Link
          href="/companies"
          className="text-sm text-[#097EEC] hover:text-[#0A6BC7] font-jakarta font-medium"
        >
          Ver más
        </Link>
      </div>

      <div
        className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {displayedCompanies.map((company) => (
          <Link
            key={company.id}
            href={`/companies/${company.id}`}
            className="flex-shrink-0 w-72 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg hover:border-[#097EEC]/30 hover:-translate-y-1 transition-all duration-300 group snap-start"
          >
            <div className="flex items-start gap-3 mb-3">
              {company.user?.profile_image ? (
                <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden ring-2 ring-white shadow-md group-hover:ring-[#097EEC]/30 transition-all">
                  <Image
                    src={company.user.profile_image}
                    alt={company.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized={true}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-[#097EEC] to-[#0A6BC7] rounded-lg flex items-center justify-center group-hover:from-[#0A6BC7] group-hover:to-[#085aa8] transition-all shadow-md">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-jakarta font-semibold text-gray-900 truncate group-hover:text-[#097EEC] transition-colors">
                  {company.name}
                </h3>
                <p className="text-xs text-gray-500 font-jakarta mt-1">
                  NIT:{" "}
                  {maskNit(company.nit, {
                    ...getNitVisibilityOptions(),
                    companyOwnerId: company.user?.id
                      ? parseInt(company.user.id.toString())
                      : undefined,
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              {company.email && (
                <p className="text-xs text-gray-600 truncate font-jakarta">
                  {maskEmail(company.email, {
                    ...getNitVisibilityOptions(),
                    companyOwnerId: company.user?.id
                      ? parseInt(company.user.id.toString())
                      : undefined,
                  })}
                </p>
              )}

              {company.cellphone && (
                <p className="text-xs text-gray-600 font-jakarta">
                  {maskPhone(company.cellphone, {
                    ...getNitVisibilityOptions(),
                    companyOwnerId: company.user?.id
                      ? parseInt(company.user.id.toString())
                      : undefined,
                  })}
                </p>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-jakarta">
                  {new Date(company.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#097EEC] font-jakarta font-medium">
                <Eye className="h-3.5 w-3.5" />
                <span>Ver detalles</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
