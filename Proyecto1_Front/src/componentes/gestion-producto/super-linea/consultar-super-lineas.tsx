import { useEffect, useState } from "react";
import SuperLineaService from "./services/super-linea-service";
import Paginacion from "../../herramientas/reutilizables/paginacion";
import { Card, CardContent, CardHeader } from "../../ui/Card";
import { useFiltrosContext } from "../../../context/filtros-contesxt";
import { Alertas, TipoAlerta, TituloAlerta, useAlerts } from "../../herramientas/alertas/alertas";
import {
  TipoAlertaConfirmacion,
  TituloAlertaConfirmacion,
  useConfirmation,
} from "../../herramientas/alertas/alertas-confirmacion";
import { Auditoria, ResponsePost } from "../../../interfaces/generales/interfaces-generales";
import { useSuperLineaModal } from "./hooks/use-super-linea-modal";
import { SuperLineaModal } from "./modales/super-linea-modal";
import { DatosTabla } from "./componentes/datos-tabla";
import { DatosCards } from "./componentes/datos-card";
import { Header } from "./componentes/header";
import { HeaderLg } from "./componentes/header-lg";
import { FiltrosSuperLinea, FiltrosSuperLineaValues } from "./componentes/filtros-super-linea";
import { getUsuarioId } from "../../../utils/auth";
import { SuperLinea } from "./interfaces/interfaces-super-linea";

const NOMBRE_COMPONENTE = "consultar-super-linea";

export default function ConsultarSuperLineas() {
  const [superLineas, setSuperLineas] = useState<SuperLinea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const { alerts, addAlert, removeAlert } = useAlerts();
  const { showConfirmation, AlertasConfirmacion } = useConfirmation();

  const modal = useSuperLineaModal();
  const usuarioId = getUsuarioId();

  const [filtrosSuperLinea, setFiltrosSuperLinea] = useState<FiltrosSuperLineaValues>({ denominacion: "" });

  const [paginaActual, setPaginaActual] = useState(1);
  const [entidadesTotales, setEntidadesTotales] = useState(0);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);

  const [filtrosInicializados, setFiltrosInicializados] = useState(false);
  const { setFiltrosNecesarios, limpiarFiltros, buscar, setBuscar } = useFiltrosContext();

  useEffect(() => {
    limpiarFiltros();
    setBuscar({ cont: 0, componente: NOMBRE_COMPONENTE });
    setFiltrosNecesarios({ denominacion: true });
    setFiltrosInicializados(true);
  }, []);

  useEffect(() => {
    if (buscar.cont > 0 && buscar.componente === NOMBRE_COMPONENTE) {
      handleBuscarSuperLineas(true);
    }
  }, [buscar]);

  const handleAltaSuperLinea = () => {
    modal.abrirAlta();
  };

  const handleAbrirEdicion = async (id: number) => {
    const superLinea = await SuperLineaService.obtenerId(id);
    modal.abrirEdicion(superLinea);
  };

  const handleMostrarInfo = async (id: number) => {
    const auditoria = await SuperLineaService.obtenerAuditoria(id);
    modal.abrirAuditoria(auditoria);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirmation({
      type: TipoAlertaConfirmacion.DESTRUCTIVE,
      title: TituloAlertaConfirmacion.DESTRUCTIVE,
      message: "¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: () => {},
    });

    if (!confirmed) return;

    try {
      const response: ResponsePost = await SuperLineaService.eliminar(id, usuarioId);
      setSuperLineas((prev) => prev.filter((l) => l.id !== id));

      addAlert({
        type: TipoAlerta.SUCCESS,
        title: TituloAlerta.SUCCESS,
        message: response.mensaje,
        autoClose: true,
      });
    } catch {
      addAlert({
        type: TipoAlerta.ERROR,
        title: TituloAlerta.ERROR,
        message: "No se puede eliminar este elemento porque está siendo utilizada por una o más líneas.",
        autoClose: true,
      });
    }
  };

  const handleBuscarSuperLineas = async (botonBuscar?: boolean) => {
    if (botonBuscar) {
      setSkip(0);
      setPaginaActual(1);
    }

    setLoading(true);

    const filtrosConPaginacion = {
      denominacion: filtrosSuperLinea.denominacion,
      ...(filtrosSuperLinea.incluirEliminados ? { incluirEliminados: true } : {}),
      skip,
      take,
    };

    const response = await SuperLineaService.obtener(filtrosConPaginacion);

    setSuperLineas(response.data);
    setEntidadesTotales(response.total);
    setLoading(false);
  };

  const handleBuscarDesdeFiltro = (filtros: FiltrosSuperLineaValues) => {
    setFiltrosSuperLinea(filtros);
  };

  useEffect(() => {
    if (filtrosInicializados) {
      handleBuscarSuperLineas();
    }
  }, [paginaActual, filtrosInicializados]);

  useEffect(() => {
    if (filtrosInicializados) {
      handleBuscarSuperLineas(true);
    }
  }, [filtrosSuperLinea]);

  const handleImprimirTodo = async () => {
    const pdfBlob = await SuperLineaService.imprimirTodo();
    const fileURL = URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }));
    window.open(fileURL, "_blank");
  };

  const handleImprimirPagina = async () => {
    const pdfBlob = await SuperLineaService.imprimirPagina();
    const fileURL = URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }));
    window.open(fileURL, "_blank");
  };

  const handlePageChange = (skip: number, take: number, paginaActual: number) => {
    setSkip(skip);
    setTake(take);
    setPaginaActual(paginaActual);
  };

  const handleSuccess = async (mensajeAlerta: string) => {
    modal.cerrar();

    addAlert({
      type: TipoAlerta.SUCCESS,
      title: TituloAlerta.SUCCESS,
      message: mensajeAlerta,
      autoClose: true,
    });

    await handleBuscarSuperLineas();
  };

  if (error) {
    return (
      <div className="w-full p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <>
        <Card>
          <CardHeader className="flex justify-between">
            <div className="hidden lg:block">
              <Header
                entidadesTotales={entidadesTotales}
                datosLength={superLineas.length}
                paginaActual={paginaActual}
                openModal={handleAltaSuperLinea}
                handleImprimirTodo={handleImprimirTodo}
                handleImprimirPagina={handleImprimirPagina}
              />
            </div>

            <div className="lg:hidden">
              <HeaderLg
                entidadesTotales={entidadesTotales}
                datosLength={superLineas.length}
                paginaActual={paginaActual}
                openModal={handleAltaSuperLinea}
                handleImprimirTodo={handleImprimirTodo}
                handleImprimirPagina={handleImprimirPagina}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <FiltrosSuperLinea onBuscar={handleBuscarDesdeFiltro} mostrarIncluirEliminados />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
                <p className="text-gray-600 text-lg">Cargando superlíneas...</p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block">
                  <DatosTabla
                    superLineas={superLineas}
                    onEditar={handleAbrirEdicion}
                    onInfo={handleMostrarInfo}
                    onDelete={handleDelete}
                  />
                </div>

                <div className="lg:hidden space-y-4">
                  {superLineas.map((superLinea) => (
                    <DatosCards
                      key={superLinea.id}
                      superLinea={superLinea}
                      onEditar={handleAbrirEdicion}
                      onInfo={handleMostrarInfo}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-6">
          <Paginacion
            entidadesTotales={entidadesTotales}
            take={take}
            paginaActual={paginaActual}
            onChange={handlePageChange}
          />
        </div>

        <Alertas alerts={alerts} onRemove={removeAlert} />
        <AlertasConfirmacion />
      </>

      <SuperLineaModal
        open={modal.tipo !== null}
        tipo={modal.tipo}
        superLinea={modal.superLinea}
        auditoria={modal.auditoria as Auditoria | null}
        onClose={modal.cerrar}
        onSuccess={handleSuccess}
      />
    </div>
  );
}