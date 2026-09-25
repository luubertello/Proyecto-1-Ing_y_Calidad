import { Info, Pencil, Trash, History } from "lucide-react";
import { ActionButton } from "../../../herramientas/reutilizables/action-button";
import type { ConsultarProducto } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";

// 1. Agregamos TODAS las funciones a la interfaz para que TypeScript no se queje
interface Props {
  producto: ConsultarProducto;
  onEditar: (id: number) => void;
  onInfo: (id: number) => void;
  onDelete: (id: number) => void;
  onMovimientos?: (id: number) => void;
  onCambioPrecios?: (id: number) => void;
  onHistorial?: (id: number) => void; // Acá declaramos onHistorial
  compact?: boolean;
}

// 2. Desestructuramos onHistorial de las Props
export function ProductoActions({ 
  producto, 
  onEditar, 
  onInfo, 
  onDelete, 
  onMovimientos,
  onCambioPrecios,
  onHistorial,
  compact = false 
}: Props) {
  
  return (
    <div className="flex justify-center gap-1">
      
      {/* Botón Editar */}
      <ActionButton 
        variant="edit" 
        title="Editar Producto" 
        onClick={() => onEditar(producto.id)}
      >
        <Pencil size={18} />
      </ActionButton>

      {/* Botón Historial de Precios */}
      {onHistorial && (
        <ActionButton 
          variant="info" 
          title="Ver Historial de Precios" 
          onClick={() => onHistorial(producto.id)}
        >
          <History size={18} />
        </ActionButton>
      )}

      {/* Botón Info / Auditoría */}
      <ActionButton 
        variant="info" 
        title="Auditoría" 
        onClick={() => onInfo(producto.id)}
      >
        <Info size={18} />
      </ActionButton>

      {/* Botón Eliminar */}
      <ActionButton 
        variant="delete" 
        title="Eliminar Producto" 
        onClick={() => onDelete(producto.id)}
      >
        <Trash size={18} />
      </ActionButton>
      
    </div>
  );
}