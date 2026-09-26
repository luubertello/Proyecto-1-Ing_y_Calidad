import { useState, useEffect, useRef } from "react";
import { Star, AlertTriangle } from "lucide-react";

import ProductoService from "../services/producto-service";

import {
  ConsultarProducto,
  Producto,
} from "../../../../interfaces/gestion-producto/producto/interfaces-producto";

import { PAGINACION } from "../../../../config/paginacion";
import { Auditoria, ResponsePost } from "../../../../interfaces/generales/interfaces-generales";

import { Card, CardContent } from "../../../ui/Card";

import { useFiltrosContext } from "../../../../context/filtros-contesxt";
import { useConfiguracionSistema } from "../../../sistema/ConfiguracionSistemaContext";
import { useCatalogosContext } from "../../../../context/catalogos-context";

import { useFiltrosIniciales } from "../../../../hooks/useFiltrosIniciales";
import { usePaginacion } from "../../../../hooks/use-paginacion";

import Paginacion from "../../../herramientas/reutilizables/paginacion";
import FiltrosAplicados from "../../../herramientas/reutilizables/filtros-aplicados";

import {
  Alertas,
  TipoAlerta,
  TituloAlerta,
  useAlerts,
} from "../../../herramientas/alertas/alertas";

import {
  TipoAlertaConfirmacion,
  TituloAlertaConfirmacion,
  useConfirmation,
} from "../../../herramientas/alertas/alertas-confirmacion";

import { getRoles, getUsuarioId } from "../../../../utils/auth";

import { puedeHacerAcciones } from "../domain/permisos-producto";

import { ProductosHeader } from "../componentes/header-producto";
import { ProductosHeaderLg } from "../componentes/header-producto-lg";
import { DatosTabla } from "../componentes/datos-tabla";
import { DatosCard } from "../componentes/datos-card";

import { ProductosModales } from "../modales/producto-modales";
import ActualizacionMasivaModal from "../modales/actualizacion-masiva-modal";

import { NotificacionModal } from "../../../NotificacionModal/modales/NotificacionModal";
import {
  ProductoNotificacion,
  EntidadTipo,
} from "../../../NotificacionModal/interfaces/notificacion.types";

import { useProductoImpresion } from "../hooks/use-producto-impresion";

import {
  formatPrice,
} from "../../../herramientas/formateo-de-campos/fucion-formateo";


export default function ConsultarProductos() {
  // =========================================================
  // ESTADOS
  // =========================================================

  const [productos, setProductos] = useState<ConsultarProducto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mostrarActualizarProducto, setMostrarActualizarProducto] =
    useState(false);

  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto>({} as Producto);

  const [productoInfo, setProductoInfo] =
    useState<Producto>({} as Producto);

  // =========================================================
  // AUDITORÍA
  // =========================================================

  const [mostrarAuditoria, setMostrarAuditoria] = useState(false);

  const [auditoria, setAuditoria] =
    useState<Auditoria>({} as Auditoria);

  // =========================================================
  // CAMBIO DE PRECIOS
  // =========================================================

  const [mostrarCambioPrecios, setMostrarCambioPrecios] =
    useState(false);

  // =========================================================
  // PRODUCTOS ALTERNATIVOS
  // =========================================================

  const [mostrarProductosAlternativos, setMostrarProductosAlternativos] =
    useState(false);

  const [mostrarDeQuienEsAlternativo, setMostrarDeQuienEsAlternativo] =
    useState(false);

  // =========================================================
  // ALTA / ACTUALIZACIÓN
  // =========================================================

  const [isModalOpen, setIsModalOpen] = useState(false);

  // =========================================================
  // NOTIFICACIONES
  // =========================================================

  const [modalAbierto, setModalAbierto] = useState(false);

  const [productoNotificacionSeleccionado, setProductoNotificacionSeleccionado] =
    useState<ProductoNotificacion | null>(null);

  // =========================================================
  // ACTUALIZACIÓN MASIVA
  // =========================================================

  const [mostrarActualizacionMasiva, setMostrarActualizacionMasiva] =
    useState(false);

  // =========================================================
  // BÚSQUEDA RÁPIDA
  // =========================================================

  const usuarioId = getUsuarioId();

  const [codigo, setCodigo] = useState<string>("");
  const [exacto, setExacto] = useState<boolean>(true);

  // =========================================================
  // REFERENCIAS
  // =========================================================

  const inicializacionCompleta = useRef(false);

  // =========================================================
  // CONFIGURACIÓN
  // =========================================================

  const { configuracion } = useConfiguracionSistema();

  // =========================================================
  // PAGINACIÓN
  // =========================================================

  const {
    paginaActual,
    entidadesTotales,
    skip,
    take,
    setEntidadesTotales,
    handlePageChange,
    resetearPaginacion,
  } = usePaginacion(PAGINACION.TAKE_DEFAULT);

  // =========================================================
  // FILTROS
  // =========================================================

  const [filtrosInicializados, setFiltrosInicializados] =
    useState(false);

  const {
    setFiltrosNecesarios,
    valoresFiltros,
    setValoresFiltros,
    limpiarFiltros,
    buscar,
    setBuscar,
    setBusquedaRapida,
  } = useFiltrosContext();

  const filtrosInicialesConsultarProducto =
    useFiltrosIniciales("consultar-producto");

  // =========================================================
  // CATÁLOGOS
  // =========================================================

  const {
    setLineas,
    setMarcas,
    setProveedores,
  } = useCatalogosContext();

  // =========================================================
  // ALERTAS
  // =========================================================

  const {
    alerts,
    addAlert,
    removeAlert,
  } = useAlerts();

  const {
    showConfirmation,
    AlertasConfirmacion,
  } = useConfirmation();

  // =========================================================
  // IMPRESIÓN
  // =========================================================

  const {
    handleImprimirTodo,
    handleImprimirPagina,
  } = useProductoImpresion();

  // =========================================================
  // INICIALIZACIÓN DE FILTROS
  // =========================================================

  useEffect(() => {
    limpiarFiltros();

    setBuscar({
      cont: 0,
      componente: "consultar-producto",
    });

    setFiltrosNecesarios({
      denominacion: true,
      codigoProveedor: true,
      superlinea: true,
      linea: true,
      marca: true,
      proveedor: true,
      conStock: true,
    });

    setValoresFiltros(filtrosInicialesConsultarProducto);

    setFiltrosInicializados(true);

    setTimeout(() => {
      inicializacionCompleta.current = true;
    }, 500);

    return () => {
      setFiltrosNecesarios({});
    };
  }, []);

  // =========================================================
  // BÚSQUEDA RÁPIDA
  // =========================================================

  useEffect(() => {
    if (!inicializacionCompleta.current) return;

    const timer = setTimeout(() => {
      handleBuscarProductosRapido();
    }, 400);

    return () => clearTimeout(timer);
  }, [codigo, exacto]);

  // =========================================================
  // BOTÓN BUSCAR DE FILTROS
  // =========================================================

  useEffect(() => {
    if (
      buscar.cont > 0 &&
      buscar.componente === "consultar-producto"
    ) {
      handleBuscarProductos(true);
    }
  }, [buscar]);

  // =========================================================
  // PAGINACIÓN
  // =========================================================

  useEffect(() => {
    if (filtrosInicializados) {
      handleBuscarProductos();
    }
  }, [
    paginaActual,
    filtrosInicializados,
    take,
  ]);

  // =========================================================
  // FETCH LÍNEAS
  // =========================================================

  const fetchLineas = async () => {
    setError(null);

    try {
      const caracteresParaBusqueda =
        configuracion?.caracteresParaBusqueda ?? 4;

      if (
        valoresFiltros.denominacionLinea &&
        valoresFiltros.denominacionLinea.length >=
          caracteresParaBusqueda
      ) {
        const lineasTotales =
          await ProductoService.obtenerTotales(
            {
              denominacion:
                valoresFiltros.denominacionLinea || " ",
            },
            "lineas"
          );

        setLineas(lineasTotales.data);
      }
    } catch (err) {
      console.error("Error al obtener líneas:", err);
      setError("No se pudieron cargar las líneas.");
    }
  };

  useEffect(() => {
    fetchLineas();
  }, [valoresFiltros.denominacionLinea]);

  // =========================================================
  // FETCH MARCAS
  // =========================================================

  const fetchMarcas = async () => {
    setError(null);

    try {
      const caracteresParaBusqueda =
        configuracion?.caracteresParaBusqueda ?? 4;

      if (
        valoresFiltros.denominacionMarca &&
        valoresFiltros.denominacionMarca.length >=
          caracteresParaBusqueda
      ) {
        const marcasTotales =
          await ProductoService.obtenerTotales(
            {
              denominacion:
                valoresFiltros.denominacionMarca || " ",
            },
            "marcas"
          );

        setMarcas(marcasTotales.data);
      }
    } catch (err) {
      console.error("Error al obtener marcas:", err);
      setError("No se pudieron cargar las marcas.");
    }
  };

  useEffect(() => {
    fetchMarcas();
  }, [valoresFiltros.denominacionMarca]);

  // =========================================================
  // FETCH PROVEEDORES
  // =========================================================

  const fetchProveedores = async () => {
    setError(null);

    try {
      const caracteresParaBusqueda =
        configuracion?.caracteresParaBusqueda ?? 4;

      if (
        valoresFiltros.denominacionProveedor &&
        valoresFiltros.denominacionProveedor.length >=
          caracteresParaBusqueda
      ) {
        const proveedoresTotales =
          await ProductoService.obtenerTotales(
            {
              denominacion:
                valoresFiltros.denominacionProveedor || " ",
            },
            "proveedores"
          );

        setProveedores(proveedoresTotales.data);
      }
    } catch (err) {
      console.error("Error al obtener proveedores:", err);
      setError("No se pudieron cargar los proveedores.");
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, [valoresFiltros.denominacionProveedor]);

  // =========================================================
  // EDITAR PRODUCTO
  // =========================================================

  const handleAbrirActualizarProducto = async (id: number) => {
    if (!id) return;

    const producto = await ProductoService.obtenerId(id);

    setProductoSeleccionado(producto);
    setMostrarActualizarProducto(true);
  };

  const handleCerrarActualizarProducto = () => {
    setMostrarActualizarProducto(false);
    setProductoSeleccionado({} as Producto);
  };

  // =========================================================
  // AUDITORÍA
  // =========================================================

  const handleAbrirAuditoria = async (id: number) => {
    if (!id) return;

    const [
      datosAuditoria,
      producto,
    ] = await Promise.all([
      ProductoService.obtenerAuditoria(id),
      ProductoService.obtenerId(id),
    ]);

    setAuditoria(datosAuditoria);
    setProductoInfo(producto);
    setMostrarAuditoria(true);
  };

  const handleCerrarAuditoria = () => {
    setMostrarAuditoria(false);
    setAuditoria({} as Auditoria);
    setProductoInfo({} as Producto);
  };

  // =========================================================
  // CAMBIO DE PRECIOS
  // =========================================================

  const handleCerrarCambioPrecios = () => {
    setMostrarCambioPrecios(false);
    setProductoInfo({} as Producto);
  };

  // =========================================================
  // PRODUCTOS ALTERNATIVOS
  // =========================================================

  const handleCerrarProductosAlternativos = () => {
    setMostrarProductosAlternativos(false);
    setProductoInfo({} as Producto);
  };

  const handleCerrarDeQuienEsAlternativo = () => {
    setMostrarDeQuienEsAlternativo(false);
    setProductoInfo({} as Producto);
  };

  // =========================================================
  // ELIMINAR
  // =========================================================

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirmation({
      type: TipoAlertaConfirmacion.DESTRUCTIVE,
      title: TituloAlertaConfirmacion.DESTRUCTIVE,
      message:
        "¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: () => {},
    });

    if (!confirmed) return;

    let response: ResponsePost;

    try {
      response = await ProductoService.eliminar(
        id,
        usuarioId
      );

      setProductos((productosActuales) =>
        productosActuales.filter(
          (producto) => producto.id !== id
        )
      );

      addAlert({
        type: TipoAlerta.SUCCESS,
        title: TituloAlerta.SUCCESS,
        message: response.mensaje,
        autoClose: true,
        duration: 3000,
      });
    } catch (err) {
      addAlert({
        type: TipoAlerta.ERROR,
        title: TituloAlerta.ERROR,
        message:
          "No se puede eliminar este elemento porque está siendo utilizada por uno o más productos.",
        autoClose: true,
        duration: 3000,
      });
    }
  };

  // =========================================================
  // NOTIFICAR
  // =========================================================

  const handleNotificar = (
    producto: ConsultarProducto
  ) => {
    setProductoNotificacionSeleccionado({
      id: producto.id,
      denominacion: producto.denominacion,
      stock: producto.stock,
    });

    setModalAbierto(true);
  };

  // =========================================================
  // MODAL ALTA
  // =========================================================

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // =========================================================
  // ALTA EXITOSA
  // =========================================================

  const handleSuccess = async (
    mensajeAlerta: string
  ) => {
    closeModal();

    addAlert({
      type: TipoAlerta.SUCCESS,
      title: TituloAlerta.SUCCESS,
      message: mensajeAlerta,
      autoClose: true,
      duration: 3000,
    });

    await handleBuscarProductos();
  };

  // =========================================================
  // ACTUALIZACIÓN EXITOSA
  // =========================================================

  const handleActualizarSuccess = async (
    mensajeAlerta: string
  ) => {
    closeModal();

    addAlert({
      type: TipoAlerta.SUCCESS,
      title: TituloAlerta.SUCCESS,
      message: mensajeAlerta,
      autoClose: true,
      duration: 3000,
    });

    await handleBuscarProductos();
  };

  // =========================================================
  // BUSCAR PRODUCTOS
  // =========================================================

  const handleBuscarProductos = async (
    botonBuscar?: boolean
  ) => {
    setBusquedaRapida(false);

    if (botonBuscar) {
      resetearPaginacion();
    }

    setLoading(true);

    try {
      const filtrosConPaginacion = {
        denominacion: valoresFiltros.denominacion,
        codigoProveedor: valoresFiltros.codigoProveedor,
        codigoReferencia: valoresFiltros.codigoReferencia,

        codProveedorExacto:
          valoresFiltros.codProveedorExacto,

        codReferenciaExacto:
          valoresFiltros.codReferenciaExacto,

        superLineaId: valoresFiltros.superLineaId,
        lineaId: valoresFiltros.lineaId,
        marcaId: valoresFiltros.marcaId,
        proveedorId: valoresFiltros.proveedorId,
        conStock: valoresFiltros.conStock,

        skip,
        take,
      };

      const productosFiltrados =
        await ProductoService.obtener(
          filtrosConPaginacion
        );

      setProductos(productosFiltrados.data);
      setEntidadesTotales(
        productosFiltrados.total
      );
    } catch (err) {
      console.error(
        "Error al obtener productos:",
        err
      );

      setError(
        "No se pudieron cargar los productos."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // BÚSQUEDA RÁPIDA
  // =========================================================

  const handleBuscarProductosRapido = async (
    botonBuscar?: boolean
  ) => {
    setBusquedaRapida(true);

    if (botonBuscar) {
      resetearPaginacion();
    }

    setLoading(true);

    try {
      const filtrosConPaginacion = {
        codigo,
        exacto,
        skip,
        take,
      };

      const productosFiltrados =
        await ProductoService.obtenerRapido(
          filtrosConPaginacion
        );

      setProductos(productosFiltrados.data);
      setEntidadesTotales(
        productosFiltrados.total
      );
    } catch (err) {
      console.error(
        "Error en búsqueda rápida:",
        err
      );

      setError(
        "No se pudieron cargar los productos."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ACTUALIZACIÓN MASIVA
  // =========================================================

  const handleAbrirActualizacionMasiva = () => {
    setMostrarActualizacionMasiva(true);
  };

  const handleCerrarActualizacionMasiva = () => {
    setMostrarActualizacionMasiva(false);
  };

  const handleSuccessActualizacionMasiva =
    async (mensaje: string) => {
      setMostrarActualizacionMasiva(false);

      addAlert({
        type: TipoAlerta.SUCCESS,
        title: TituloAlerta.SUCCESS,
        message: mensaje,
        autoClose: true,
        duration: 3000,
      });

      await handleBuscarProductos();
    };

  // =========================================================
  // COLUMNAS
  // =========================================================

  const columns: any[] = [
    {
      header: "Cód.",
      accessor: "codigoProveedor",
      flex: 0.3,
      type: "text",
      align: "right",
      editable: false,
      scrollable: false,
    },

    {
      header: "Denominación",
      accessor: "denominacion",
      flex: 2,
      type: "text",
      editable: false,

      formatFunction: ({
        value,
        row,
      }: {
        value: any;
        row: ConsultarProducto;
      }) => (
        <div className="flex flex-col gap-1">
          <div
            className="flex items-center gap-2 truncate whitespace-nowrap max-w-[700px]"
            title={
              typeof value === "string"
                ? `${value}${
                    row.observacion
                      ? `\n${row.observacion}`
                      : ""
                  }`
                : undefined
            }
          >
            <Star
              size={16}
              className={
                row.esAlternativo
                  ? "text-red-500 shrink-0"
                  : "text-yellow-500 shrink-0"
              }
            />

            <span>{value}</span>

            {row.stockBajo && (
              <span className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
                <AlertTriangle size={12} />
                Stock bajo
              </span>
            )}
          </div>

          {row.observacion && (
            <div className="text-sm text-gray-500 truncate max-w-[700px]">
              {row.observacion}
            </div>
          )}
        </div>
      ),

      scrollable: false,
    },

    {
      header: "Precio",
      accessor: "precio",
      flex: 0.3,
      type: "text",
      editable: false,
      align: "left",

      formatFunction: ({
        value,
      }: {
        value: any;
      }) => (
        <span>
          ${formatPrice(value)}
        </span>
      ),
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full">

      <div className="p-2">

        {loading ? (

          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />

            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Cargando productos...
            </p>
          </div>

        ) : error ? (

          <div className="flex flex-col items-center justify-center py-12">

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">

              <p className="text-red-600 dark:text-red-400 text-center font-medium">
                {error}
              </p>

            </div>

          </div>

        ) : (

          <>

            {/* =================================================
                TABLA
            ================================================= */}

            <Card className="border-gray-200 dark:border-slate-700">

              {/* HEADER DESKTOP */}
              <div className="hidden lg:block">

                <ProductosHeader
                  roles={getRoles()}
                  codigo={codigo}
                  exacto={exacto}
                  onChangeCodigo={setCodigo}
                  onChangeExacto={setExacto}
                  onBuscarRapido={() =>
                    handleBuscarProductosRapido(true)
                  }
                  onNuevo={openModal}
                  onActualizacionMasiva={
                    handleAbrirActualizacionMasiva
                  }
                  total={entidadesTotales}
                  mostrados={productos.length}
                  paginaActual={paginaActual}
                  onImprimirTodo={
                    handleImprimirTodo
                  }
                  onImprimirPagina={
                    handleImprimirPagina
                  }
                />

              </div>

              {/* HEADER MOBILE */}
              <div className="lg:hidden">

                <ProductosHeaderLg
                  codigo={codigo}
                  exacto={exacto}
                  roles={getRoles()}
                  onChangeCodigo={setCodigo}
                  onChangeExacto={setExacto}
                  onBuscarRapido={() =>
                    handleBuscarProductosRapido(true)
                  }
                  onNuevo={openModal}
                  total={entidadesTotales}
                  mostrados={productos.length}
                  paginaActual={paginaActual}
                  onImprimirTodo={
                    handleImprimirTodo
                  }
                  onImprimirPagina={
                    handleImprimirPagina
                  }
                />

              </div>

              <CardContent className="p-0">

                <FiltrosAplicados />

                {/* =================================================
                    TABLA DESKTOP
                ================================================= */}

                  <DatosTabla
                    productos={productos}
                    columns={columns}
                    puedeAccionar={puedeHacerAcciones(getRoles())}
                    onEditar={handleAbrirActualizarProducto}
                    onAuditoria={handleAbrirAuditoria}
                    onDelete={handleDelete}
                  />

                  <div className="lg:hidden space-y-3">
                    {productos.map((producto) => (
                      <DatosCard
                        key={producto.id}
                        producto={producto}
                        onNotificar={handleNotificar}
                      />
                    ))}
                  </div>

              </CardContent>

            </Card>

            {/* =================================================
                PAGINACIÓN
            ================================================= */}

            <div className="mt-6">

              <Paginacion
                entidadesTotales={entidadesTotales}
                take={take}
                paginaActual={paginaActual}
                onChange={handlePageChange}
              />

            </div>

            {/* =================================================
                ALERTAS
            ================================================= */}

            <Alertas
              alerts={alerts}
              onRemove={removeAlert}
            />

            <AlertasConfirmacion />

          </>

        )}

      </div>

      {/* =====================================================
          MODALES
      ===================================================== */}

      <ProductosModales

        isAltaOpen={isModalOpen}

        mostrarActualizarProducto={
          mostrarActualizarProducto
        }

        mostrarAuditoria={
          mostrarAuditoria
        }

        mostrarCambioPrecios={
          mostrarCambioPrecios
        }

        mostrarProductosAlternativos={
          mostrarProductosAlternativos
        }

        mostrarDeQuienEsAlternativo={
          mostrarDeQuienEsAlternativo
        }

        productoSeleccionado={
          productoSeleccionado
        }

        productoInfo={
          productoInfo
        }

        auditoria={
          auditoria
        }

        onCloseAlta={
          closeModal
        }

        onCloseActualizar={
          handleCerrarActualizarProducto
        }

        onCloseAuditoria={
          handleCerrarAuditoria
        }

        onCloseCambioPrecios={
          handleCerrarCambioPrecios
        }

        onCloseProductosAlternativos={
          handleCerrarProductosAlternativos
        }

        onCloseDeQuienEsAlternativo={
          handleCerrarDeQuienEsAlternativo
        }

        onSuccessAlta={
          handleSuccess
        }

        onSuccessActualizar={
          handleActualizarSuccess
        }

        onRefetch={
          handleBuscarProductos
        }

      />

      {/* =====================================================
          ACTUALIZACIÓN MASIVA
      ===================================================== */}

      {mostrarActualizacionMasiva && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <ActualizacionMasivaModal
            onClose={
              handleCerrarActualizacionMasiva
            }
            onSuccess={
              handleSuccessActualizacionMasiva
            }
          />

        </div>

      )}

      {/* =====================================================
          NOTIFICACIÓN
      ===================================================== */}

      {productoNotificacionSeleccionado && (

        <NotificacionModal
          open={modalAbierto}
          producto={
            productoNotificacionSeleccionado
          }
          entidadTipo={
            EntidadTipo.PRODUCTO
          }
          onClose={() => {
            setModalAbierto(false);
            setProductoNotificacionSeleccionado(
              null
            );
          }}
        />

      )}

    </div>
  );
}