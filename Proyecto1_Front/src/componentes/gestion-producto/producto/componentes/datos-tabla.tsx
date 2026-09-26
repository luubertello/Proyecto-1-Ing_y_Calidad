
import {
  Column,
  TablaAGGrid,
} from "../../../herramientas/tablas/tabla-flexible-ag-grid";

import type { ConsultarProducto } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";

import { ProductoActions } from "./producto-action";

interface Props {
  productos: ConsultarProducto[];
  columns: Column<ConsultarProducto>[];
  puedeAccionar: boolean;
  onEditar: (id: number) => void;
  onAuditoria: (id: number) => void;
  onDelete: (id: number) => void;
}

export function DatosTabla({
  productos,
  columns,
  puedeAccionar,
  onEditar,
  onAuditoria,
  onDelete,
}: Props) {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <TablaAGGrid
        columns={columns}
        data={productos}
        actions={
          puedeAccionar
            ? (row) => (
                <ProductoActions
                  producto={row}
                  onEditar={onEditar}
                  onAuditoria={onAuditoria}
                  onDelete={onDelete}
                />
              )
            : undefined
        }
        actionsFlex={0.5}
        rowHeight={55}
      />
    </div>
  );
}
