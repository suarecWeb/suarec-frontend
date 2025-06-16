import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal = ({ isOpen, onClose }: PrivacyModalProps) => {
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-4"
                >
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Política de privacidad
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
                    POLÍTICA DE PRIVACIDAD DE SUAREC S.A.S.<br/>
                    Última actualización: Junio 15, 2025
                  </p>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">¿Qué información recopilamos?</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <span className="font-semibold">a) Datos que nos proporcionas directamente:</span>
                        <ul className="list-disc pl-6 mt-1">
                          <li>Registro y perfil: nombre completo, correo electrónico, teléfono, contraseña, tipo de usuario (persona o empresa), cargo, dirección ciudad y país.</li>
                          <li>Interacciones: mensajes, comentarios, solicitudes de soporte, feedback y encuestas.</li>
                        </ul>
                      </li>
                      <li>
                        <span className="font-semibold">b) Datos que recolectamos automáticamente:</span>
                        <ul className="list-disc pl-6 mt-1">
                          <li>Actividad en la plataforma: páginas vistas, visitas, historial de uso, tiempo en ciertas secciones.</li>
                          <li>Datos técnicos: dirección IP, tipo de navegador, sistema operativo, dispositivo usado, identificadores únicos (UID), hora de acceso.</li>
                        </ul>
                      </li>
                      <li>
                        <span className="font-semibold">c) Datos de terceros:</span>
                        <ul className="list-disc pl-6 mt-1">
                          <li>Información de terceros cuando usas servicios externos (p.ej., redes sociales, Google, Meta, plataformas de pago).</li>
                        </ul>
                      </li>
                    </ul>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">¿Para qué usamos tus datos?</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border border-gray-200 mb-4">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 py-1 border-b border-gray-200">Finalidad</th>
                            <th className="px-2 py-1 border-b border-gray-200">Datos utilizados</th>
                            <th className="px-2 py-1 border-b border-gray-200">Base legal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-2 py-1 border-b border-gray-200">Crear y gestionar tu cuenta</td>
                            <td className="px-2 py-1 border-b border-gray-200">Registro y perfil</td>
                            <td className="px-2 py-1 border-b border-gray-200">Contrato/servicio</td>
                          </tr>
                          <tr>
                            <td className="px-2 py-1 border-b border-gray-200">Seguridad y autenticación</td>
                            <td className="px-2 py-1 border-b border-gray-200">Datos técnicos, IU descubiertas</td>
                            <td className="px-2 py-1 border-b border-gray-200">Interés legítimo</td>
                          </tr>
                          <tr>
                            <td className="px-2 py-1 border-b border-gray-200">Prestación de servicios</td>
                            <td className="px-2 py-1 border-b border-gray-200">Actividades, uso de la plataforma</td>
                            <td className="px-2 py-1 border-b border-gray-200">Contrato/servicio</td>
                          </tr>
                          <tr>
                            <td className="px-2 py-1 border-b border-gray-200">Atención al usuario</td>
                            <td className="px-2 py-1 border-b border-gray-200">Mensajes, feedback</td>
                            <td className="px-2 py-1 border-b border-gray-200">Contrato/servicio</td>
                          </tr>
                          <tr>
                            <td className="px-2 py-1 border-b border-gray-200">Marketing y comunicaciones</td>
                            <td className="px-2 py-1 border-b border-gray-200">E‑mail, teléfono</td>
                            <td className="px-2 py-1 border-b border-gray-200">Consentimiento</td>
                          </tr>
                          <tr>
                            <td className="px-2 py-1 border-b border-gray-200">Publicidad personalizada</td>
                            <td className="px-2 py-1 border-b border-gray-200">Behavior y cookies</td>
                            <td className="px-2 py-1 border-b border-gray-200">Consentimiento</td>
                          </tr>
                          <tr>
                            <td className="px-2 py-1 border-b border-gray-200">Mejora y análisis</td>
                            <td className="px-2 py-1 border-b border-gray-200">Datos técnicos, uso de la plataforma</td>
                            <td className="px-2 py-1 border-b border-gray-200">Interés legítimo</td>
                          </tr>
                          <tr>
                            <td className="px-2 py-1 border-b border-gray-200">Cumplimiento legal y fiscal</td>
                            <td className="px-2 py-1 border-b border-gray-200">Datos de registro, facturación</td>
                            <td className="px-2 py-1 border-b border-gray-200">Obligación legal</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">¿Cómo protegemos tu información?</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Uso de protocolos de seguridad (HTTPS/TLS) y cifrado en tránsito</li>
                      <li>Almacenamiento cifrado y acceso restringido a personal autorizado</li>
                      <li>Copias de respaldo periódicas</li>
                      <li>Políticas internas y formación continua sobre privacidad</li>
                      <li>Evaluación de riesgos y procedimientos de reporte para incidentes</li>
                    </ul>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">¿Con quién compartimos tus datos?</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Proveedores operativos: hosting, mantenimiento, soporte técnico</li>
                      <li>Plataformas de publicidad: Google Ads, Facebook Ads (bajo consentimiento)</li>
                      <li>Redes sociales: cuando te integras con estas plataformas</li>
                      <li>Autorizaciones legales: autoridades judiciales, fiscales o reguladores</li>
                      <li>Empresas afiliadas: grupos de SUAREC para administrar cuentas o facturación</li>
                    </ul>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">¿Dónde se almacenan tus datos?</h4>
                    <p>Tus datos se almacenan en servidores seguros ubicados dentro de Colombia y/o en la región Andina, o en servidores en la nube con medidas de seguridad equivalentes conforme a normas de protección de datos.</p>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">Derechos que tienes</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Conocer, actualizar y rectificar tu información personal</li>
                      <li>Solicitar prueba de autorización (en casos aplicables)</li>
                      <li>Revocar el consentimiento cuando el tratamiento se base en este</li>
                      <li>Solicitar supresión, total o parcial</li>
                      <li>Oponerte al tratamiento por motivos legítimos</li>
                      <li>Acceder a tus datos de forma fácil y gratuita</li>
                    </ul>
                    <p className="mt-2">Para ejercer estos derechos, escríbenos a <span className="font-semibold">contactosuarec@gmail.com</span>, indicando claramente:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Nombre completo</li>
                      <li>Identificación (tipo y número)</li>
                      <li>Dirección de contacto</li>
                      <li>Petición detallada</li>
                      <li>Soportes probatorios si aplica</li>
                    </ul>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">Conservación de datos</h4>
                    <p>Conservamos tu información mientras exista la relación contractual o acuerdo. Luego de su terminación, mantenemos datos para obligaciones legales y fiscales por los plazos que exige la normatividad (generalmente 5 años).</p>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">Cambios en esta Política</h4>
                    <p>Podemos actualizar esta Política cuando sea necesario. Te notificaremos a través de la plataforma o correo, indicando la fecha de la nueva versión. Tu continuación en SUAREC implica aceptación de los cambios.</p>
                  </section>
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">Contacto</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Correo electrónico: contactosuarec@gmail.com</li>
                      <li>Dirección: Cali, Valle del Cauca, Colombia</li>
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

export default PrivacyModal; 