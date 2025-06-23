// components/application-action-modal.tsx
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircle, XCircle, X, Loader2 } from 'lucide-react';

interface ApplicationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message?: string) => Promise<void>;
  action: 'ACCEPTED' | 'REJECTED';
  candidateName: string;
  publicationTitle: string;
}

const ApplicationActionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  action, 
  candidateName, 
  publicationTitle 
}: ApplicationActionModalProps) => {
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(message.trim() || undefined);
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error en la acción:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setMessage('');
      onClose();
    }
  };

  const isAccepting = action === 'ACCEPTED';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto hide-scrollbar">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="div" className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      isAccepting 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {isAccepting ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <XCircle className="h-6 w-6" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isAccepting ? 'Aceptar Aplicación' : 'Rechazar Aplicación'}
                    </h3>
                  </div>
                  
                  <button
                    onClick={handleClose}
                    disabled={isProcessing}
                    className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <div className="mt-4">
                <p className="text-gray-600 mb-4">
                  {isAccepting ? (
                    <>
                      ¿Estás seguro de que deseas <strong>aceptar</strong> la aplicación de{' '}
                      <strong>{candidateName}</strong> para la publicación{' '}
                      <strong>&quot;{publicationTitle}&quot;</strong>?
                    </>
                  ) : (
                    <>
                      ¿Estás seguro de que deseas <strong>rechazar</strong> la aplicación de{' '}
                      <strong>{candidateName}</strong> para la publicación{' '}
                      <strong>&quot;{publicationTitle}&quot;</strong>?
                    </>
                  )}
                </p>
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje opcional {isAccepting ? 'de bienvenida' : 'de retroalimentación'}:
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                      placeholder={
                        isAccepting 
                          ? "Ej: ¡Felicidades! Nos pondremos en contacto contigo pronto..." 
                          : "Ej: Gracias por tu interés. En esta ocasión hemos decidido..."
                      }
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors disabled:opacity-50"
                      onClick={handleClose}
                      disabled={isProcessing}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 ${
                        isAccepting
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      onClick={handleConfirm}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isAccepting ? 'Aceptando...' : 'Rechazando...'}
                        </>
                      ) : (
                        <>
                          {isAccepting ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Aceptar
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              Rechazar
                            </>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ApplicationActionModal;