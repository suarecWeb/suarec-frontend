import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AlertTriangle, X, DollarSign, CreditCard, Info } from "lucide-react";

interface CancellationPenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contractTitle?: string;
  isLoading?: boolean;
  requiresPenalty?: boolean;
  penaltyMessage?: string;
}

export default function CancellationPenaltyModal({
  isOpen,
  onClose,
  onConfirm,
  contractTitle = "este contrato",
  isLoading = false,
  requiresPenalty = true,
  penaltyMessage,
}: CancellationPenaltyModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-60 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all w-full max-w-lg">
              {/* Close Button */}
              <div className="absolute right-4 top-4">
                <button
                  type="button"
                  className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Cerrar</span>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Header */}
              <div className="flex flex-col items-center px-6 pt-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  Confirmar Cancelación de Contrato
                </Dialog.Title>
                <p className="mt-2 text-sm text-gray-500">
                  Estás a punto de cancelar <strong>{contractTitle}</strong>.
                  Esta acción no se puede deshacer.
                </p>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {requiresPenalty ? (
                  <div className="space-y-4">
                    {/* Penalización */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex gap-3">
                        <DollarSign className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="text-sm">
                          <h4 className="font-medium text-red-800 mb-2">
                            Penalización por Cancelación
                          </h4>
                          <ul className="text-red-700 space-y-1">
                            <li>
                              <strong>Monto:</strong> $10,000 pesos colombianos
                            </li>
                            <li>
                              <strong>Razón:</strong> Compensación por
                              incumplimiento del acuerdo
                            </li>
                            <li>
                              <strong>Proceso:</strong> Deberás pagar esta
                              penalización antes de proceder con la cancelación
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Proceso de Pago */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex gap-3">
                        <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <h4 className="font-medium text-blue-800 mb-2">
                            Proceso de Pago
                          </h4>
                          <ol className="list-decimal list-inside text-blue-700 space-y-1">
                            <li>
                              Se generará un enlace de pago seguro con Wompi
                            </li>
                            <li>Completa el pago de la penalización</li>
                            <li>
                              Una vez confirmado, el contrato será cancelado
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* Importante */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex gap-2">
                        <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                        <p className="text-xs text-amber-700">
                          <strong>Importante:</strong> El contrato solo se
                          cancelará después de que se confirme el pago de la
                          penalización.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <h4 className="font-medium text-green-800 mb-2">
                          Cancelación Sin Penalización
                        </h4>
                        <ul className="text-green-700 space-y-1">
                          <li>
                            <strong>Estado:</strong> Puedes cancelar el contrato
                            sin penalización
                          </li>
                          <li>
                            <strong>Razón:</strong>{" "}
                            {penaltyMessage ||
                              "El servicio está programado para más de 1 hora"}
                          </li>
                          <li>
                            <strong>Proceso:</strong> El contrato se cancelará
                            inmediatamente
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex flex-col-reverse sm:flex-row sm:justify-center sm:gap-3">
                <button
                  type="button"
                  className="mt-3 inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  No, Mantener Contrato
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:w-auto"
                  onClick={onConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Procesando...
                    </div>
                  ) : requiresPenalty ? (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Pagar Penalización y Cancelar
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Confirmar Cancelación
                    </>
                  )}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
