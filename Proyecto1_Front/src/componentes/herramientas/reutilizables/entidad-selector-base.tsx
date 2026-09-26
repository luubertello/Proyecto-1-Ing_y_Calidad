import Select from "react-select";
import { PlusCircle } from "lucide-react";
import { Button } from "../../ui/Button";

export interface EntidadBase {
  id: number;
  denominacion: string;
}

interface EntidadSelectorBaseProps<T extends EntidadBase> {
  titulo: string;

  denominacion: string;
  setDenominacion: (value: string) => void;
  denominacionRef: React.RefObject<HTMLInputElement>;

  opciones: T[];
  selected: T | null;
  selectedId: number;

  selectRef: React.RefObject<HTMLDivElement>;

  disabled?: boolean;

  error?: string;

  onEnterInput: (e: React.KeyboardEvent) => void;
  onEnterSelect?: (e: React.KeyboardEvent) => void;

  onChange?: (entidad: T | null) => void;
  onAgregar: () => void;
  ocultarAgregar?: boolean;
}

export default function EntidadSelectorBase<T extends EntidadBase>({
  titulo,
  denominacion,
  setDenominacion,
  opciones,
  selected,
  selectedId,
  selectRef,
  disabled = false,
  error,
  onChange,
  onAgregar,
  ocultarAgregar = false,
}: EntidadSelectorBaseProps<T>) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{titulo}</label>
      <div className="flex items-center gap-2" ref={selectRef}>
        <div className="flex-1">
          <Select
            value={opciones.find((o) => o.id === selectedId) ?? selected}
            options={opciones}
            getOptionLabel={(o) => o.denominacion}
            getOptionValue={(o) => String(o.id)}
            onChange={(opt) => {
              if (!onChange) return;
              onChange(opt as T | null);
            }}
            // El texto que se escribe en el mismo combobox dispara la búsqueda
            inputValue={denominacion === " " ? "" : denominacion}
            onInputChange={(value, meta) => {
              // Evita resetear la búsqueda cuando react-select cierra el menú o pierde el foco
              if (meta.action === "input-change") {
                setDenominacion(value);
              }
            }}
            placeholder={`Buscar ${titulo.toLowerCase()}...`}
            noOptionsMessage={() => "Sin resultados"}
            isDisabled={disabled}
            menuPortalTarget={document.body}
            styles={selectStyles}
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>

        {!ocultarAgregar && (
          <Button
            type="button"
            disabled={disabled}
            title={`Agregar ${titulo}`}
            variant="outline"
            size="icon"
            className="bg-blue-500 text-white hover:bg-blue-600 w-10 h-10 rounded-full shadow-md transition shrink-0"
            onClick={onAgregar}
          >
            <PlusCircle size={20} />
          </Button>
        )}
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