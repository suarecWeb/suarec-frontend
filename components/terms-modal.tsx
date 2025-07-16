import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X } from "lucide-react";

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

        <div className="fixed inset-0 overflow-y-auto modal-scrollbar">
          <div className="flex min-h-screen items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Términos y Condiciones
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4 max-h-[60vh] overflow-y-auto pr-4 modal-scrollbar">
                  <p className="text-sm text-gray-500 mb-4">
                    FECHA DE ENTRADA EN VIGENCIA: JULIO 15 DE 2025
                  </p>

                  <div className="space-y-6 text-gray-700">
                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        1. ACEPTACIÓN DE LOS TÉRMINOS
                      </h4>
                      <p>
                        Al acceder, registrarse o utilizar la plataforma SUAREC
                        (incluyendo el sitio web y la aplicación móvil), usted
                        acepta cumplir con estos Términos y Condiciones, los
                        cuales constituyen un acuerdo legalmente vinculante
                        entre usted y la empresa SUAREC S.A.S.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        2. NATURALEZA DE LA PLATAFORMA
                      </h4>
                      <p>
                        SUAREC es una plataforma tecnológica que facilita la
                        conexión entre personas naturales y empresas para la
                        prestación de servicios laborales o la adquisición de
                        productos. SUAREC no es empleador, contratante, ni
                        prestador de los servicios o productos ofrecidos por los
                        usuarios registrados.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        3. REGISTRO Y OBLIGACIONES DEL USUARIO
                      </h4>
                      <p>
                        Los usuarios deben registrarse con información veraz y
                        actualizada. Usted es responsable por el uso de su
                        cuenta, la veracidad de la información compartida y las
                        actividades realizadas dentro de SUAREC. Está prohibido
                        el uso fraudulento o con fines ilegales.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        4. INTERMEDIACIÓN Y LIMITACIÓN DE RESPONSABILIDAD
                      </h4>
                      <p>
                        SUAREC actúa como intermediario tecnológico. No
                        garantiza la calidad, cumplimiento o legalidad de los
                        servicios o productos ofrecidos por los usuarios.
                        Cualquier relación contractual o comercial entre
                        usuarios se realiza bajo su propia responsabilidad.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        5. PAGOS Y COMISIONES
                      </h4>
                      <p>
                        SUAREC cobra comisiones por intermediación,
                        suscripciones y/o publicidad, conforme a los valores
                        informados en la plataforma. Las transacciones se
                        procesan a través de pasarelas de pago autorizadas.
                        SUAREC no almacena datos sensibles de tarjetas.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        6. PROPIEDAD INTELECTUAL
                      </h4>
                      <p>
                        Todos los derechos sobre el diseño, el código, los
                        contenidos y la marca SUAREC pertenecen a SUAREC S.A.S.
                        Queda prohibida su reproducción total o parcial sin
                        autorización escrita.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        7. POLÍTICA DE TRATAMIENTO DE DATOS Y PRIVACIDAD
                      </h4>
                      <p>
                        SUAREC S.A.S., en cumplimiento de la Ley 1581 de 2012,
                        el Decreto 1377 de 2013 y demás normas concordantes,
                        garantiza la protección de los datos personales
                        suministrados por los usuarios. Al usar la plataforma,
                        usted acepta el tratamiento de sus datos conforme a las
                        siguientes condiciones:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-2">
                        <li>
                          Finalidades del tratamiento:
                          <ul className="list-disc pl-6 mt-1">
                            <li>
                              Efectuar gestiones relacionadas con el objeto
                              social de SUAREC.
                            </li>
                            <li>
                              Procesar pagos, suscripciones y transacciones.
                            </li>
                            <li>Contactar a los usuarios.</li>
                            <li>
                              Evaluar hojas de vida y facilitar conexiones
                              laborales.
                            </li>
                            <li>
                              Realizar encuestas, estudios de mercado y
                              estadísticas.
                            </li>
                            <li>
                              Cumplir con obligaciones legales y contractuales.
                            </li>
                            <li>
                              Garantizar seguridad operativa y tecnológica.
                            </li>
                          </ul>
                        </li>
                        <li>
                          Datos tratados: Se recopilarán datos personales,
                          sensibles, y de empresas conforme al uso de la
                          plataforma y formularios registrados. El tratamiento
                          se hará con base en consentimiento previo, expreso e
                          informado.
                        </li>
                        <li>
                          Derechos de los titulares:
                          <ul className="list-disc pl-6 mt-1">
                            <li>
                              Conocer, actualizar, corregir, suprimir y revocar
                              autorización.
                            </li>
                            <li>Acceder a los datos en cualquier momento.</li>
                            <li>
                              Solicitar prueba de la autorización otorgada.
                            </li>
                          </ul>
                        </li>
                        <li>
                          Medidas de seguridad: Se implementan medidas
                          administrativas, físicas y técnicas para garantizar la
                          seguridad y confidencialidad de los datos almacenados.
                        </li>
                        <li>
                          Transferencia y almacenamiento: Los datos podrán ser
                          compartidos con terceros aliados para operaciones
                          legítimas, bajo compromiso de cumplimiento legal.
                        </li>
                        <li>
                          Conservación: Los datos serán almacenados mientras
                          exista relación contractual o necesidad operativa.
                          Posteriormente se eliminarán conforme a la ley.
                        </li>
                      </ul>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        8. SUSPENSIÓN O TERMINACIÓN DE CUENTA
                      </h4>
                      <p>
                        SUAREC podrá suspender o cancelar cuentas de usuarios
                        que incurran en conductas inapropiadas, fraudes,
                        incumplimientos o violaciones de estos términos.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        9. MODIFICACIONES A LOS TÉRMINOS
                      </h4>
                      <p>
                        SUAREC podrá modificar estos Términos en cualquier
                        momento. Los cambios serán notificados en la plataforma
                        y continuar usando SUAREC implica la aceptación de
                        dichas modificaciones.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        10. LEY APLICABLE Y JURISDICCIÓN
                      </h4>
                      <p>
                        Estos Términos se rigen por las leyes de la República de
                        Colombia. Cualquier conflicto se resolverá ante los
                        jueces de la ciudad de Cali, Valle del Cauca.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        11. CONTACTO
                      </h4>
                      <p>
                        Para dudas o solicitudes relacionadas con estos términos
                        y condiciones o el tratamiento de datos, puede escribir
                        a soportesuarec@gmail.com
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        12. EXCLUSIÓN DE GARANTÍAS
                      </h4>
                      <p>
                        SUAREC no garantiza que el acceso a la plataforma sea
                        ininterrumpido o libre de errores. La plataforma se
                        proporciona &quot;tal cual&quot; y &quot;según
                        disponibilidad&quot;. SUAREC no ofrece garantías sobre
                        la precisión, confiabilidad o idoneidad de los servicios
                        o productos ofrecidos por los usuarios registrados.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        13. LIMITACIÓN DE RESPONSABILIDAD
                      </h4>
                      <p>
                        SUAREC no será responsable por daños directos,
                        indirectos, incidentales, especiales o consecuenciales,
                        incluyendo pero no limitado a pérdida de datos, lucro
                        cesante, interrupciones de negocio, fallas de seguridad
                        o cualquier otro daño derivado del uso o imposibilidad
                        de uso de la plataforma.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        14. INDEMNIZACIÓN
                      </h4>
                      <p>
                        El usuario acepta indemnizar, defender y mantener
                        indemne a SUAREC, sus representantes y aliados frente a
                        cualquier reclamo, pérdida, gasto o responsabilidad
                        (incluyendo honorarios legales) derivados del mal uso de
                        la plataforma, violación de estos Términos o de los
                        derechos de terceros.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        15. CONTENIDO GENERADO POR EL USUARIO
                      </h4>
                      <p>
                        El usuario acepta no publicar contenido ofensivo,
                        ilegal, difamatorio o que viole derechos de terceros.
                        SUAREC podrá eliminar dicho contenido sin previo aviso y
                        cancelar cuentas si lo considera necesario.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        16. ENLACES A TERCEROS
                      </h4>
                      <p>
                        La plataforma puede contener enlaces a sitios web o
                        servicios de terceros. SUAREC no controla ni es
                        responsable por el contenido, políticas o prácticas de
                        sitios ajenos.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        17. DURACIÓN Y TERMINACIÓN DEL ACUERDO
                      </h4>
                      <p>
                        Este acuerdo estará vigente mientras el usuario utilice
                        la plataforma. SUAREC podrá darlo por terminado
                        unilateralmente si detecta violación a estos Términos,
                        sin que ello genere derecho a indemnización alguna.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        18. TRATAMIENTO DE DATOS PARA VERIFICACIÓN DE
                        ANTECEDENTES
                      </h4>
                      <p>
                        Al registrarse y utilizar la plataforma SUAREC, el
                        usuario autoriza expresamente a SUAREC S.A.S. a
                        recopilar, almacenar, procesar y consultar información
                        personal, incluyendo pero no limitada a antecedentes
                        judiciales, disciplinarios, fiscales, contractuales,
                        comerciales y laborales, con el fin de verificar la
                        idoneidad y confiabilidad de los usuarios registrados,
                        ya sean personas naturales o jurídicas. Esta
                        verificación podrá realizarse a través de fuentes
                        públicas, bases de datos oficiales y alianzas con
                        terceros autorizados.
                      </p>
                      <p className="mt-2">
                        El tratamiento de estos datos se realiza en cumplimiento
                        de la legislación colombiana vigente en materia de
                        protección de datos personales (Ley 1581 de 2012 y demás
                        normas aplicables), garantizando la confidencialidad,
                        integridad y uso adecuado de la información. En todo
                        momento, el usuario podrá ejercer sus derechos de
                        consulta, actualización, rectificación o supresión de
                        sus datos personales, conforme a nuestra Política de
                        Tratamiento de Datos Personales.
                      </p>
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
