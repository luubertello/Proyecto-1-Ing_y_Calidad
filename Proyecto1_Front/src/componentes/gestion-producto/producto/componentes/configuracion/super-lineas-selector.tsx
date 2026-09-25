
import EntidadSelectorBase from "../../../../herramientas/reutilizables/entidad-selector-base";
import { SelectSuperLinea } from "../../../super-linea/interfaces/interfaces-super-linea";

export default function SuperLineasSelector(props: {
  denominacionSuperLinea: string;
  setDenominacionSuperLinea: (v: string) => void;
  denominacionSuperLineaRef: React.RefObject<HTMLInputElement>;
  selectSuperLineaRef: React.RefObject<HTMLDivElement>;

  superLineas: SelectSuperLinea[];
  selectedSuperLinea: SelectSuperLinea | null;
  superLineaId: number;

  disabled?: boolean;
  error?: string;

  onEnterSuperLinea: (e: React.KeyboardEvent) => void;
  onChangeSuperLinea: (sl: SelectSuperLinea | null) => void;
  onAgregarSuperLinea: () => void;
}) {
  return (
    <EntidadSelectorBase<SelectSuperLinea>
      titulo="SuperLínea"
      denominacion={props.denominacionSuperLinea}
      setDenominacion={props.setDenominacionSuperLinea}
      denominacionRef={props.denominacionSuperLineaRef}
      opciones={props.superLineas}
      selected={props.selectedSuperLinea}
      selectedId={props.superLineaId}
      selectRef={props.selectSuperLineaRef}
      disabled={props.disabled}
      error={props.error}
      onEnterInput={props.onEnterSuperLinea}
      onChange={props.onChangeSuperLinea}
      onAgregar={props.onAgregarSuperLinea}
    />
  );
}