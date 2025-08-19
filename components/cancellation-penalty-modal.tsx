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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      Confirmar Cancelación de Contrato
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Estás a punto de cancelar{" "}
                        <strong>{contractTitle}</strong>. Esta acción no se
                        puede deshacer.
                      </p>

                      {requiresPenalty ? (
                        <>
                          {/* Penalización Info */}
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                              <DollarSign className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="text-sm font-medium text-red-800 mb-2">
                                  Penalización por Cancelación
                                </h4>
                                <div className="text-sm text-red-700 space-y-2">
                                  <p>
                                    <strong>Monto:</strong> $10,000 pesos
                                    colombianos
                                  </p>
                                  <p>
                                    <strong>Razón:</strong> Compensación por
                                    incumplimiento del acuerdo
                                  </p>
                                  <p>
                                    <strong>Proceso:</strong> Deberás pagar esta
                                    penalización antes de proceder con la
                                    cancelación
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Payment Process Info */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <CreditCard className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="text-sm font-medium text-blue-800 mb-2">
                                  Proceso de Pago
                                </h4>
                                <div className="text-sm text-blue-700 space-y-1">
                                  <p>
                                    1. Se generará un enlace de pago seguro con
                                    Wompi
                                  </p>
                                  <p>2. Completa el pago de la penalización</p>
                                  <p>
                                    3. Una vez confirmado, el contrato será
                                    cancelado
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Warning */}
                          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-amber-700">
                                <strong>Importante:</strong> El contrato solo se
                                cancelará después de que se confirme el pago de
                                la penalización.
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Sin Penalización Info */
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm font-medium text-green-800 mb-2">
                                Cancelación Sin Penalización
                              </h4>
                              <div className="text-sm text-green-700 space-y-2">
                                <p>
                                  <strong>Estado:</strong> Puedes cancelar el
                                  contrato sin penalización
                                </p>
                                <p>
                                  <strong>Razón:</strong>{" "}
                                  {penaltyMessage ||
                                    "El servicio está programado para más de 1 hora"}
                                </p>
                                <p>
                                  <strong>Proceso:</strong> El contrato se
                                  cancelará inmediatamente
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto"
                    onClick={onConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Procesando...
                      </div>
                    ) : (
                      <>
                        {requiresPenalty ? (
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
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    No, Mantener Contrato
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
