import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal = ({ isOpen, onClose }: TermsModalProps) => {
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
                    Términos y Condiciones
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <div className="mt-4 max-h-[60vh] overflow-y-auto pr-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Fecha de entrada en vigencia: Julio 15 de 2025
                  </p>

                  <div className="space-y-6 text-gray-700">
                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">1. ACEPTACIÓN DE LOS TÉRMINOS</h4>
                      <p>Al acceder, registrarse o utilizar la plataforma SUAREC (incluyendo el sitio web y la aplicación móvil), usted acepta cumplir con estos Términos y Condiciones, los cuales constituyen un acuerdo legalmente vinculante entre usted y la empresa SUAREC S.A.S.</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">2. NATURALEZA DE LA PLATAFORMA</h4>
                      <p>SUAREC es una plataforma tecnológica que facilita la conexión entre personas naturales y empresas para la prestación de servicios laborales o la adquisición de productos. SUAREC no es empleador, contratante, ni prestador de los servicios o productos ofrecidos por los usuarios registrados.</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">3. REGISTRO Y OBLIGACIONES DEL USUARIO</h4>
                      <p>Los usuarios deben registrarse con información veraz y actualizada. Usted es responsable por el uso de su cuenta, la veracidad de la información compartida y las actividades realizadas dentro de SUAREC. Está prohibido el uso fraudulento o con fines ilegales.</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">4. INTERMEDIACIÓN Y LIMITACIÓN DE RESPONSABILIDAD</h4>
                      <p>SUAREC actúa como intermediario tecnológico. No garantiza la calidad, cumplimiento o legalidad de los servicios o productos ofrecidos por los usuarios. Cualquier relación contractual o comercial entre usuarios se realiza bajo su propia responsabilidad.</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">5. PAGOS Y COMISIONES</h4>
                      <p>SUAREC cobra comisiones por intermediación, suscripciones y/o publicidad, conforme a los valores informados en la plataforma. Las transacciones se procesan a través de pasarelas de pago autorizadas. SUAREC no almacena datos sensibles de tarjetas.</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">6. PROPIEDAD INTELECTUAL</h4>
                      <p>Todos los derechos sobre el diseño, el código, los contenidos y la marca SUAREC pertenecen a SUAREC S.A.S. Queda prohibida su reproducción total o parcial sin autorización escrita.</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">7. POLÍTICA DE TRATAMIENTO DE DATOS Y PRIVACIDAD</h4>
                      <p>SUAREC S.A.S., en cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas concordantes, garantiza la protección de los datos personales suministrados por los usuarios. Al usar la plataforma, usted acepta el tratamiento de sus datos conforme a las siguientes condiciones:</p>
                      <ul className="list-disc pl-6 mt-2 space-y-2">
                        <li>Finalidades del tratamiento: Efectuar gestiones relacionadas con el objeto social de SUAREC, procesar pagos, contactar usuarios, evaluar hojas de vida y facilitar conexiones laborales.</li>
                        <li>Datos tratados: Se recopilarán datos personales, sensibles, y de empresas conforme al uso de la plataforma.</li>
                        <li>Derechos de los titulares: Conocer, actualizar, corregir, suprimir y revocar autorización.</li>
                        <li>Medidas de seguridad: Se implementan medidas administrativas, físicas y técnicas para garantizar la seguridad.</li>
                      </ul>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">8. SUSPENSIÓN O TERMINACIÓN DE CUENTA</h4>
                      <p>SUAREC podrá suspender o cancelar cuentas de usuarios que incurran en conductas inapropiadas, fraudes, incumplimientos o violaciones de estos términos.</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">9. MODIFICACIONES A LOS TÉRMINOS</h4>
                      <p>SUAREC podrá modificar estos Términos en cualquier momento. Los cambios serán notificados en la plataforma y continuar usando SUAREC implica la aceptación de dichas modificaciones.</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">10. LEY APLICABLE Y JURISDICCIÓN</h4>
                      <p>Estos Términos se rigen por las leyes de la República de Colombia. Cualquier conflicto se resolverá ante los jueces de la ciudad de Cali, Valle del Cauca.</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">11. CONTACTO</h4>
                      <p>Para dudas o solicitudes relacionadas con estos Términos y Condiciones o el tratamiento de datos, puede escribir al correo contactosuarec@gmail.com o comunicarse al número 3146373088.</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">12. EXCLUSIÓN DE GARANTÍAS</h4>
                      <p>SUAREC no garantiza que el acceso a la plataforma sea ininterrumpido o libre de errores. La plataforma se proporciona "tal cual" y "según disponibilidad".</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">13. LIMITACIÓN DE RESPONSABILIDAD</h4>
                      <p>SUAREC no será responsable por daños directos, indirectos, incidentales, especiales o consecuenciales derivados del uso o imposibilidad de uso de la plataforma.</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">14. INDEMNIZACIÓN</h4>
                      <p>El usuario acepta indemnizar, defender y mantener indemne a SUAREC, sus representantes y aliados frente a cualquier reclamo derivado del mal uso de la plataforma.</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">15. CONTENIDO GENERADO POR EL USUARIO</h4>
                      <p>El usuario acepta no publicar contenido ofensivo, ilegal, difamatorio o que viole derechos de terceros.</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">16. ENLACES A TERCEROS</h4>
                      <p>La plataforma puede contener enlaces a sitios web o servicios de terceros. SUAREC no controla ni es responsable por el contenido de sitios ajenos.</p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">17. DURACIÓN Y TERMINACIÓN DEL ACUERDO</h4>
                      <p>Este acuerdo estará vigente mientras el usuario utilice la plataforma. SUAREC podrá darlo por terminado unilateralmente si detecta violación a estos Términos.</p>
                    </section>
                  </div>
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

export default TermsModal; 