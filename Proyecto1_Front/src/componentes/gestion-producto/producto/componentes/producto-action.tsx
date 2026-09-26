import { Pencil, Trash, ShieldCheck } from "lucide-react";
import { ActionButton } from "../../../herramientas/reutilizables/action-button";
import type { ConsultarProducto } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";

interface Props {
  producto: ConsultarProducto;
  onEditar: (id: number) => void;
  onAuditoria: (id: number) => void;
  onDelete: (id: number) => void;
  compact?: boolean;
}

export function ProductoActions({
  producto,
  onEditar,
  onAuditoria,
  onDelete,
  compact = false,
}: Props) {
  return (
    <div className="flex justify-center gap-1">
      {/* Botón Editar */}
      <ActionButton variant="edit" title="Editar Producto" onClick={() => onEditar(producto.id)}>
        <Pencil size={18} />
      </ActionButton>

      {/* Botón único de Auditoría (General / Precios / Stock) */}
      <ActionButton variant="info" title="Auditoría" onClick={() => onAuditoria(producto.id)}>
        <ShieldCheck size={18} />
      </ActionButton>

      {/* Botón Eliminar */}
      <ActionButton variant="delete" title="Eliminar Producto" onClick={() => onDelete(producto.id)}>
        <Trash size={18} />
      </ActionButton>
    </div>
  );
}