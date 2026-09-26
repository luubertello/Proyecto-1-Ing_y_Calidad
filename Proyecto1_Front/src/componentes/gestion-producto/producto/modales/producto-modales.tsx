import { Producto } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";
import RegistrarActualizarProductoForm from "../utils/registrar-actualizar-producto";
import AuditoriaProductoModal from "./auditoria-producto-modal";

interface Props {
  isAltaOpen: boolean;
  mostrarActualizarProducto: boolean;
  mostrarAuditoria: boolean;
  mostrarCambioPrecios: boolean;
  mostrarProductosAlternativos: boolean;
  mostrarDeQuienEsAlternativo: boolean;
  productoSeleccionado: Producto | null;
  productoInfo: any;
  auditoria: any;
  onCloseAlta: () => void;
  onCloseActualizar: () => void;
  onCloseAuditoria: () => void;
  onCloseCambioPrecios: () => void;
  onCloseProductosAlternativos: () => void;
  onCloseDeQuienEsAlternativo: () => void;
  onSuccessAlta: (mensaje: string, producto?: Producto) => void;
  onSuccessActualizar: (mensaje: string) => void;
  onRefetch: () => void;
}

export function ProductosModales({
  isAltaOpen,
  mostrarActualizarProducto,
  mostrarAuditoria,
  mostrarCambioPrecios,
  mostrarProductosAlternativos,
  mostrarDeQuienEsAlternativo,
  productoSeleccionado,
  productoInfo,
  auditoria,
  onCloseAlta,
  onCloseActualizar,
  onCloseAuditoria,
  onCloseCambioPrecios,
  onCloseProductosAlternativos,
  onCloseDeQuienEsAlternativo,
  onSuccessAlta,
  onSuccessActualizar,
  onRefetch,
}: Props) {
  return (
    <>
      {isAltaOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RegistrarActualizarProductoForm onClose={onCloseAlta} onSuccess={onSuccessAlta} />
        </div>
      )}

      {mostrarActualizarProducto && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RegistrarActualizarProductoForm
            producto={productoSeleccionado}
            onClose={onCloseActualizar}
            onSuccess={onSuccessActualizar}
          />
        </div>
      )}

      {mostrarAuditoria && productoInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <AuditoriaProductoModal producto={productoInfo} auditoria={auditoria} onClose={onCloseAuditoria} />
        </div>
      )}
    </>
  );
}