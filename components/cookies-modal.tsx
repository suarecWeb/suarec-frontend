import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';

interface CookiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CookiesModal = ({ isOpen, onClose }: CookiesModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-4"
                >
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Política de cookies
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <div className="mt-4 max-h-[60vh] overflow-y-auto pr-4 text-gray-700 space-y-6">
                  <p className="text-sm text-gray-500 mb-4">
                    POLÍTICA DE COOKIES DE SUAREC<br/>
                    Fecha de última actualización: 16 de junio de 2025.
                  </p>
                  <section>
                    <p>En SUAREC S.A.S. (en adelante "SUAREC"), utilizamos cookies para garantizar el correcto funcionamiento de nuestra plataforma web y app, mejorar la experiencia del usuario, ofrecer contenido personalizado y analizar el comportamiento de navegación con fines estadísticos y de mejora continua.</p>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">1. ¿Qué son las cookies?</h4>
                    <p>Las cookies son pequeños archivos que se almacenan en el dispositivo del usuario (ordenador, smartphone o tableta) al acceder a nuestro sitio web o app. Estas permiten recordar información sobre su visita, como el idioma preferido, la sesión iniciada o los servicios más utilizados.</p>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">2. Tipos de cookies utilizadas</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><span className="font-semibold">Cookies técnicas o necesarias:</span> esenciales para la navegación y el uso adecuado de las funciones básicas, como acceder a secciones seguras del sitio.</li>
                      <li><span className="font-semibold">Cookies de personalización:</span> permiten recordar información para adaptar la experiencia del usuario (idioma, ciudad de búsqueda, perfil de usuario).</li>
                      <li><span className="font-semibold">Cookies analíticas:</span> nos permiten conocer el comportamiento de los usuarios en la plataforma para mejorar nuestros servicios. Por ejemplo, saber cuántas personas visitan una sección específica.</li>
                      <li><span className="font-semibold">Cookies publicitarias:</span> utilizadas para mostrar anuncios relevantes y medir su efectividad. Incluyen cookies de plataformas como Meta (Facebook, Instagram) y Google Ads.</li>
                    </ul>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">3. Cookies propias y de terceros</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><span className="font-semibold">Cookies propias:</span> son gestionadas directamente por SUAREC.</li>
                      <li><span className="font-semibold">Cookies de terceros:</span> son gestionadas por otras entidades que tratan los datos en nuestro nombre, como Google, Meta o proveedores de analítica.</li>
                    </ul>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">4. Consentimiento del usuario</h4>
                    <p>Cuando accedes por primera vez a nuestra plataforma, te solicitamos tu consentimiento para el uso de cookies, excepto aquellas que son estrictamente necesarias para el funcionamiento del sistema. Puedes configurar o rechazar el uso de cookies en cualquier momento desde el panel de configuración.</p>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">5. Cómo desactivar o eliminar cookies</h4>
                    <p>Puedes configurar tu navegador para restringir, bloquear o eliminar cookies. A continuación te compartimos enlaces a los procedimientos según el navegador:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Google Chrome</li>
                      <li>Mozilla Firefox</li>
                      <li>Microsoft Edge</li>
                      <li>Safari</li>
                    </ul>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">6. Actualizaciones de esta política</h4>
                    <p>SUAREC puede modificar esta Política de Cookies en cualquier momento para adaptarla a cambios normativos o a mejoras en la plataforma. Te recomendamos revisar esta página periódicamente.</p>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">7. Contacto</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Correo: soportesuarec@gmail.com</li>
                      <li>Teléfono: +57 314 637 3088</li>
                    </ul>
                  </section>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-[#097EEC] px-4 py-2 text-sm font-medium text-white hover:bg-[#0A6BC7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#097EEC] focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CookiesModal; 