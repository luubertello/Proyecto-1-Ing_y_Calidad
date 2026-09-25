import { Button } from "../../../ui/Button";
import InformacionAuditoria from "../../../herramientas/reutilizables/informacion-auditoria";
import { SuperLinea } from "../interfaces/interfaces-super-linea";
import { Auditoria } from "../../../../interfaces/generales/interfaces-generales";
import { SuperLineaModalTipo } from "../hooks/use-super-linea-modal";
import RegistrarActualizarSuperLineaForm from "../utils/registrar-actualizar-super-linea";

interface Props {
  open: boolean;
  tipo: SuperLineaModalTipo;
  superLinea?: SuperLinea | null;
  auditoria?: Auditoria | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function SuperLineaModal({ open, tipo, superLinea, auditoria, onClose, onSuccess }: Props) {
  if (!open || !tipo) return null;

  return (
    <>
      {tipo === "alta" && (
        <RegistrarActualizarSuperLineaForm onClose={onClose} onSuccess={onSuccess} />
      )}

      {tipo === "edicion" && superLinea && (
        <RegistrarActualizarSuperLineaForm superLinea={superLinea} onClose={onClose} onSuccess={onSuccess} />
      )}

      {tipo === "auditoria" && auditoria && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <InformacionAuditoria auditoria={auditoria} onClose={onClose} />
            <div className="mt-6 pt-4 border-t">
              <Button onClick={onClose}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}