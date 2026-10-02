"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Recinto, RecintoFiguraForma } from "@/interfaces/recinto.interface";
import {
  FiguraEditor,
  COLOR_PALCO,
  claveNueva,
  figurasDelRecinto,
  nombreParaMostrar,
  limitarAlLienzo,
  ordenDeDibujo,
  siguienteNombrePalco,
  validarFiguras,
} from "./figuras";
import {
  Alineacion,
  Distribucion,
  Orden,
  alinearFiguras,
  distribuirFiguras,
  ajustarACuadricula,
} from "./acomodar";
import { useCuadricula } from "./hooks/useCuadricula";
import { useVistaLienzo } from "./hooks/useVistaLienzo";
import { useFiguras } from "./hooks/useFiguras";
import { useSeleccion } from "./hooks/useSeleccion";
import { usePortapapeles } from "./hooks/usePortapapeles";
import { useAtajosTeclado } from "./hooks/useAtajosTeclado";
import { useBorradorRecinto } from "./hooks/useBorradorRecinto";
import { useGuardarDibujo } from "./hooks/useGuardarDibujo";
import BarraHerramientas from "./barra/BarraHerramientas";
import AvisosEditor from "./barra/AvisosEditor";
import Lienzo from "./lienzo/Lienzo";
import PanelPropiedades from "./panel/PanelPropiedades";

// Zoom de los botones, centrado en la pantalla
const FACTOR_BOTON = 1.25;

interface RecintoEditorProps {
  recinto: Recinto;
}

// Editor del recinto: guarda los datos (el dibujo, la seleccion, lo
// guardado) y arma las piezas de la pantalla: barra arriba, lienzo al
// centro y panel a la derecha. Se carga con next/dynamic y ssr:false
export default function RecintoEditor({ recinto }: RecintoEditorProps) {
  const ajustadoInicial = useRef(false);
  const [pantalla, setPantalla] = useState({ ancho: 0, alto: 0 });
  // Vista previa de "Repetir" (fila o abanico): copias fantasma
  const [vistaPrevia, setVistaPrevia] = useState<FiguraEditor[] | null>(null);
  const { seleccion, setSeleccion, alPresionar, alHacerClic, limpiar } =
    useSeleccion();

  const lienzo = useMemo(
    () => ({ ancho: recinto.lienzoAncho, alto: recinto.lienzoAlto }),
    [recinto.lienzoAncho, recinto.lienzoAlto],
  );
  const { vista, zoomRelativo, ajustar, zoomEn, mover, aPuntoLogico } =
    useVistaLienzo(lienzo, pantalla);
  const cuadricula = useCuadricula(lienzo);

  // Lo que esta guardado en el sistema y su version (updatedAt). Es la base
  // para saber si hay cambios, para el borrador y para guardar sin pisar
  // a otro admin. Cambia cada vez que se guarda
  const [base, setBase] = useState(() => ({
    version: recinto.updatedAt,
    figuras: figurasDelRecinto(recinto),
  }));
  const {
    figuras,
    agregar,
    agregarVarias,
    actualizar,
    actualizarVarias,
    ordenar,
    borrarVarias,
    reemplazar,
    deshacer,
    rehacer,
    puedeDeshacer,
    puedeRehacer,
  } = useFiguras(() => base.figuras);
  const borrador = useBorradorRecinto(recinto.id, figuras, base.figuras);
  const { hayCopia, copiar, pegar, duplicar } = usePortapapeles(
    figuras,
    lienzo,
    agregarVarias,
  );
  const guardado = useGuardarDibujo(recinto.id);
  const hayCambios = useMemo(
    () => JSON.stringify(figuras) !== JSON.stringify(base.figuras),
    [figuras, base.figuras],
  );

  const recuperarBorrador = () => {
    const figurasBorrador = borrador.recuperar();
    if (figurasBorrador) {
      reemplazar(figurasBorrador);
      limpiar();
    }
  };
  // Los del editor mandan; los del backend (del ultimo intento de guardar)
  // se muestran hasta que se vuelve a tocar el dibujo
  const errores = useMemo(
    () => ({
      ...guardado.erroresPorFigura,
      ...validarFiguras(figuras, lienzo),
    }),
    [figuras, guardado.erroresPorFigura, lienzo],
  );
  const { limpiarErrores } = guardado;
  useEffect(() => limpiarErrores(), [figuras, limpiarErrores]);

  // Si se intenta cerrar o recargar con cambios sin guardar, el navegador
  // pregunta (el borrador de la pestana igual los respalda)
  useEffect(() => {
    if (!hayCambios) return;
    const avisar = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [hayCambios]);

  // La primera vez que se conoce el tamano, el lienzo entra completo.
  // useLayoutEffect: se ajusta antes de pintar, sin un cuadro a escala 1
  useLayoutEffect(() => {
    if (!ajustadoInicial.current && pantalla.ancho > 0 && pantalla.alto > 0) {
      ajustar();
      ajustadoInicial.current = true;
    }
  }, [pantalla, ajustar]);

  const guardarDibujo = async () => {
    const recintoGuardado = await guardado.guardar(figuras, base.version);
    if (!recintoGuardado) return;
    // Las nuevas vuelven con su id: el dibujo guardado es la nueva base
    const figurasGuardadas = figurasDelRecinto(recintoGuardado);
    reemplazar(figurasGuardadas);
    setBase({ version: recintoGuardado.updatedAt, figuras: figurasGuardadas });
    limpiar();
    toast.success("Recinto guardado");
  };

  const figurasEnOrden = useMemo(() => ordenDeDibujo(figuras), [figuras]);
  const seleccionadas = useMemo(
    () => figuras.filter((f) => seleccion.includes(f.clave)),
    [figuras, seleccion],
  );
  // El panel de propiedades completo, solo con UNA
  const figuraSeleccionada =
    seleccionadas.length === 1 ? seleccionadas[0] : null;
  // El recuadro y Ctrl/Cmd+A ignoran las bloqueadas (como Canva): se pueden
  // seleccionar palcos encima de una tarima bloqueada sin arrastrarla
  const clavesLibres = useMemo(
    () => figuras.filter((f) => !f.bloqueada).map((f) => f.clave),
    [figuras],
  );

  // ─── ACCIONES SOBRE LA SELECCION ────────────────────────────────────────

  const borrarSeleccion = useCallback(() => {
    if (seleccionadas.length === 0) return;
    const libres = seleccionadas.filter((f) => !f.bloqueada);
    const bloqueadas = seleccionadas.filter((f) => f.bloqueada);
    if (libres.length > 0) borrarVarias(libres.map((f) => f.clave));
    if (bloqueadas.length > 0) {
      toast(
        bloqueadas.length === 1
          ? `${nombreParaMostrar(bloqueadas[0])} está bloqueada: desbloquéala para borrarla`
          : `${bloqueadas.length} figuras bloqueadas no se borraron`,
        { icon: "🔒" },
      );
    }
    // Quedan elegidas solo las que no se pudieron borrar
    setSeleccion(bloqueadas.map((f) => f.clave));
  }, [seleccionadas, borrarVarias, setSeleccion]);

  // Bloquear o desbloquear lo seleccionado (una o un grupo)
  const bloquearSeleccion = useCallback(
    (bloquear: boolean) => {
      seleccionadas.forEach((f) =>
        actualizar(f.clave, { bloqueada: bloquear }),
      );
    },
    [seleccionadas, actualizar],
  );

  // Alinear: varias entre ellas, o una contra el lienzo. Un solo paso
  const alinearSeleccion = useCallback(
    (modo: Alineacion) =>
      actualizarVarias(alinearFiguras(seleccionadas, modo, lienzo)),
    [seleccionadas, lienzo, actualizarVarias],
  );

  // Repetir en fila o abanico: todas las copias en un solo paso y quedan
  // elegidas junto con la original (para moverlas, alinearlas, etc.)
  const repetirFigura = useCallback(
    (copias: FiguraEditor[]) => {
      if (!figuraSeleccionada || copias.length === 0) return;
      agregarVarias(copias);
      setSeleccion([figuraSeleccionada.clave, ...copias.map((c) => c.clave)]);
      setVistaPrevia(null);
      toast.success(
        copias.length === 1
          ? "1 copia creada"
          : `${copias.length} copias creadas`,
        { duration: 1500 },
      );
    },
    [figuraSeleccionada, agregarVarias, setSeleccion],
  );

  // Distribuir: mismo espacio entre las elegidas, en un solo paso
  const distribuirSeleccion = useCallback(
    (eje: Distribucion) =>
      actualizarVarias(distribuirFiguras(seleccionadas, eje, lienzo)),
    [seleccionadas, lienzo, actualizarVarias],
  );

  // Capas: las bloqueadas no cambian de lugar (las demas si pasan por
  // encima o por debajo de ellas)
  const ordenarSeleccion = useCallback(
    (modo: Orden) =>
      ordenar(
        seleccionadas.filter((f) => !f.bloqueada).map((f) => f.clave),
        modo,
      ),
    [seleccionadas, ordenar],
  );

  // Donde esta la figura elegida dentro de su grupo (para el panel)
  const grupoDeLaElegida = figuraSeleccionada
    ? figuras.filter((f) => f.tipo === figuraSeleccionada.tipo)
    : [];

  const copiarSeleccion = useCallback(() => {
    if (seleccionadas.length === 0) return;
    copiar(seleccionadas);
    toast.success(
      seleccionadas.length === 1
        ? `Copiada: ${nombreParaMostrar(seleccionadas[0])}`
        : `Copiadas: ${seleccionadas.length} figuras`,
      { duration: 1500 },
    );
  }, [seleccionadas, copiar]);

  // Las copias pegadas quedan seleccionadas, como en Canva
  const pegarCopia = useCallback(() => {
    const nuevas = pegar();
    if (nuevas.length > 0) setSeleccion(nuevas.map((f) => f.clave));
  }, [pegar, setSeleccion]);

  const duplicarSeleccion = useCallback(() => {
    const nuevas = duplicar(seleccionadas);
    if (nuevas.length > 0) setSeleccion(nuevas.map((f) => f.clave));
  }, [seleccionadas, duplicar, setSeleccion]);

  // Mientras se guarda, el dibujo no se toca: al terminar, el editor pasa
  // a mostrar lo guardado y lo editado en el medio se perderia
  const guardando = guardado.guardando;

  useAtajosTeclado({
    bloqueado: guardando,
    haySeleccion: seleccionadas.length > 0,
    hayCopia,
    onBorrar: borrarSeleccion,
    onQuitarSeleccion: limpiar,
    onSeleccionarTodo: () => setSeleccion(clavesLibres),
    onCopiar: copiarSeleccion,
    onPegar: pegarCopia,
    onDuplicar: duplicarSeleccion,
    onDeshacer: deshacer,
    onRehacer: rehacer,
    onOrdenar: ordenarSeleccion,
  });

  const centroPantalla = { x: pantalla.ancho / 2, y: pantalla.alto / 2 };

  // Nueva figura en el centro de lo que se esta viendo (o en el borde del
  // lienzo si la vista esta corrida afuera), ya seleccionada. Tamano
  // relativo al lienzo, para que sirva igual en una discoteca o un estadio
  const agregarFigura = (forma: RecintoFiguraForma) => {
    const centro = limitarAlLienzo(aPuntoLogico(centroPantalla), lienzo);
    const tamanoBase = Math.round(Math.min(lienzo.ancho, lienzo.alto) * 0.08);
    const nueva: FiguraEditor = {
      clave: claveNueva(),
      tipo: "PALCO",
      forma,
      nombre: siguienteNombrePalco(figuras),
      x: centro.x,
      y: centro.y,
      ancho: forma === "CIRCULO" ? Math.round(tamanoBase * 0.75) : tamanoBase,
      alto:
        forma === "CIRCULO"
          ? Math.round(tamanoBase * 0.75)
          : Math.round(tamanoBase * 0.625),
      rotacion: 0,
      color: COLOR_PALCO,
      etiquetaRotada: false,
      bloqueada: false,
    };
    // Con la cuadrícula prendida, la nueva tambien queda pegada a sus lineas
    const posicion = cuadricula.paso
      ? limitarAlLienzo(
          ajustarACuadricula(nueva, nueva, cuadricula.paso),
          lienzo,
        )
      : { x: nueva.x, y: nueva.y };
    agregar({ ...nueva, ...posicion });
    setSeleccion([nueva.clave]);
  };

  // ─── GUARDAR ────────────────────────────────────────────────────────────

  const totalPalcos = figuras.filter((f) => f.tipo === "PALCO").length;
  const totalErrores = Object.keys(errores).length;
  const puedeGuardar =
    hayCambios &&
    totalErrores === 0 &&
    !guardado.guardando &&
    !borrador.pendiente;
  const motivoGuardar = borrador.pendiente
    ? "Primero decide qué hacer con el borrador"
    : totalErrores > 0
      ? "Corrige las figuras en rojo"
      : !hayCambios
        ? "No hay cambios por guardar"
        : "Guardar el dibujo en el sistema";

  return (
    <div className="flex flex-col gap-3">
      <BarraHerramientas
        lienzo={lienzo}
        zoomRelativo={zoomRelativo}
        hayCopia={hayCopia}
        puedeDeshacer={puedeDeshacer}
        puedeRehacer={puedeRehacer}
        cuadriculaActiva={cuadricula.activa}
        tamanoCuadricula={cuadricula.tamano}
        onAlternarCuadricula={cuadricula.alternar}
        onCambiarTamanoCuadricula={cuadricula.setTamano}
        guardando={guardando}
        puedeGuardar={puedeGuardar}
        motivoGuardar={motivoGuardar}
        onAgregar={agregarFigura}
        onPegar={pegarCopia}
        onDeshacer={deshacer}
        onRehacer={rehacer}
        onAlejar={() => zoomEn(centroPantalla, 1 / FACTOR_BOTON)}
        onAcercar={() => zoomEn(centroPantalla, FACTOR_BOTON)}
        onAjustar={ajustar}
        onGuardar={guardarDibujo}
      />

      <AvisosEditor
        borradorPendiente={borrador.pendiente}
        borradorGuardadoEn={borrador.guardadoEn}
        hayCambios={hayCambios}
        erroresGenerales={guardado.erroresGenerales}
        onRecuperar={recuperarBorrador}
        onDescartar={borrador.descartar}
      />

      <div className="relative flex gap-3 h-[calc(100vh-360px)] min-h-[480px]">
        <Lienzo
          lienzo={lienzo}
          pantalla={pantalla}
          onCambiarPantalla={setPantalla}
          vista={vista}
          zoomEn={zoomEn}
          mover={mover}
          aPuntoLogico={aPuntoLogico}
          figuras={figurasEnOrden}
          errores={errores}
          cuadricula={cuadricula.paso}
          fantasmas={vistaPrevia}
          seleccionadas={seleccionadas}
          clavesLibres={clavesLibres}
          onPresionar={alPresionar}
          onClic={alHacerClic}
          onCambiar={actualizar}
          onSeleccionar={setSeleccion}
          onLimpiarSeleccion={limpiar}
        />

        {/* disabled: tampoco se llega a los campos del panel con Tab */}
        <fieldset disabled={guardando} className="contents">
          <PanelPropiedades
            figura={figuraSeleccionada}
            // Las que existen: tras deshacer, una seleccionada puede ya no
            // estar en el dibujo
            totalSeleccionadas={seleccionadas.length}
            error={
              figuraSeleccionada ? errores[figuraSeleccionada.clave] : undefined
            }
            lienzoAncho={lienzo.ancho}
            lienzoAlto={lienzo.alto}
            totalPalcos={totalPalcos}
            totalReferencias={figuras.length - totalPalcos}
            totalErrores={totalErrores}
            // Escribir en un campo (ej: el nombre letra por letra) es un
            // solo paso para deshacer
            onCambiar={(cambios) =>
              figuraSeleccionada &&
              actualizar(
                figuraSeleccionada.clave,
                cambios,
                `panel:${figuraSeleccionada.clave}:${Object.keys(cambios).sort().join(",")}`,
              )
            }
            onCopiar={copiarSeleccion}
            onDuplicar={duplicarSeleccion}
            onBorrar={borrarSeleccion}
            bloqueadasEnSeleccion={
              seleccionadas.filter((f) => f.bloqueada).length
            }
            onBloquear={bloquearSeleccion}
            onAlinear={alinearSeleccion}
            onDistribuir={distribuirSeleccion}
            figuras={figuras}
            onVistaPrevia={setVistaPrevia}
            onRepetir={repetirFigura}
            onOrdenar={ordenarSeleccion}
            esLaDeArriba={
              grupoDeLaElegida[grupoDeLaElegida.length - 1] ===
              figuraSeleccionada
            }
            esLaDeAbajo={grupoDeLaElegida[0] === figuraSeleccionada}
          />
        </fieldset>

        {guardando && (
          <div
            role="status"
            className="absolute inset-0 z-10 rounded-xl bg-white/60 backdrop-blur-[1px] flex items-center justify-center cursor-wait"
          >
            <p className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow text-sm font-medium text-gray-700">
              <Loader2 className="h-4 w-4 animate-spin text-[#097EEC]" />
              Guardando el dibujo…
            </p>
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-400">
        Rueda: zoom · Arrastrar el fondo: mover la vista · Shift + arrastrar:
        seleccionar varias (sus esquinas agrandan o achican el grupo) · Shift +
        clic: agregar o quitar · Supr: borrar · Esc: quitar selección · Ctrl/Cmd
        + A, C, V, D: todo, copiar, pegar, duplicar · Ctrl/Cmd + Z: deshacer ·
        Ctrl/Cmd + Shift + Z: rehacer · Ctrl/Cmd + ↑/↓: subir o bajar una capa
        (con Shift: al frente o al fondo) · Cuadrícula: las figuras se pegan a
        sus líneas al mover y estirar
      </p>
    </div>
  );
}
