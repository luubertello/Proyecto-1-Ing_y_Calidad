import Select from "react-select";
import { PlusCircle } from "lucide-react";
import { Linea, SelectLinea } from "../../../../../interfaces/gestion-producto/linea/interfaces-linea";
import { Button } from "../../../../ui/Button";

interface LineasSelectorProps {
  denominacionLinea: string;
  setDenominacionLinea: (value: string) => void;
  denominacionLineaRef: React.RefObject<HTMLInputElement>;
  selectLineaRef: React.RefObject<HTMLDivElement>;

  lineas: SelectLinea[];

  selectedLinea: SelectLinea | null;

  lineaId: number;

  disabled?: boolean;

  errors?: {
    lineaId?: { message?: string };
  };

  onEnterDenominacion: (e: React.KeyboardEvent) => void;
  onEnterLinea: (e: React.KeyboardEvent) => void;

  onLineaChange: (linea: SelectLinea | null) => void;

  onAgregarLinea: () => void;
}

export default function LineasSelector({
  denominacionLinea,
  setDenominacionLinea,
  selectLineaRef,
  lineas,
  selectedLinea,
  lineaId,
  disabled = false,
  errors,
  onLineaChange,
  onAgregarLinea,
}: LineasSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">Línea</label>
      <div className="flex items-center gap-2" ref={selectLineaRef}>
        <div className="flex-1">
          <Select
            value={lineas.find((l) => l.id === lineaId) ?? selectedLinea}
            options={lineas}
            getOptionLabel={(o) => o.denominacion}
            getOptionValue={(o) => String(o.id)}
            onChange={(opt) => onLineaChange(opt as Linea)}
            // El texto que se escribe en el mismo combobox dispara la búsqueda
            inputValue={denominacionLinea === " " ? "" : denominacionLinea}
            onInputChange={(value, meta) => {
              // Evita resetear la búsqueda cuando react-select cierra el menú o pierde el foco
              if (meta.action === "input-change") {
                setDenominacionLinea(value);
              }
            }}
            isDisabled={disabled}
            placeholder="Buscar línea..."
            noOptionsMessage={() => "Sin resultados"}
            menuPortalTarget={document.body}
            styles={selectStyles}
          />
          {errors?.lineaId?.message && (
            <p className="text-sm text-red-600 mt-1">{errors.lineaId.message}</p>
          )}
        </div>

        <Button
          type="button"
          disabled={disabled}
          title="Agregar Línea"
          variant="outline"
          size="icon"
          className="bg-blue-500 text-white hover:bg-blue-600 w-10 h-10 rounded-full shadow-md transition shrink-0"
          onClick={onAgregarLinea}
        >
          <PlusCircle size={20} />
        </Button>
      </div>
    </div>
  );
}

const selectStyles = {
  control: (base: any) => ({ ...base, color: "black" }),
  singleValue: (base: any) => ({ ...base, color: "black" }),
  input: (base: any) => ({ ...base, color: "black" }),
  option: (base: any, state: any) => ({
    ...base,
    color: state.isSelected ? "white" : "black",
    backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#93c5fd" : "white",
  }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
};