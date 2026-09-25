import * as yup from "yup";
import { SuperLinea } from "./interfaces-super-linea";
export interface FormValues {
  denominacion: string;
  observacion?: string | null;
}

export const schema = yup.object().shape({
  denominacion: yup
    .string()
    .trim()
    .lowercase()
    .required("La denominación es obligatoria.")
    .max(255, "Máximo 255 caracteres.")
    .matches(/^[A-Za-z0-9 áéíóúÁÉÍÓÚñÑ]+$/, "Solo se permiten letras, números y espacios."),
  observacion: yup.string().optional().nullable(),
});

export const transformData = (superLinea: SuperLinea): FormValues => {
  return {
    denominacion: superLinea.denominacion,
    observacion: superLinea.observacion ?? null,
  };
};