import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CardContent, CardFooter } from "../../../ui/Card";
import RegistrarActualizarSuperLineaForm from "../../super-linea/utils/registrar-actualizar-super-linea";
import SuperLineaService from "../../super-linea/services/super-linea-service";
import { Button } from "../../../ui/Button";
import FormInput from "../../../herramientas/formateo-de-campos/form-input";
import React from "react";
import { Card } from "../../../ui/Card";
import { FormValues, schema, transformData, SublineasEnPayload, transformarSublineas } from "../interfaces/interfaces-validaciones-linea";
import LineaService from "../services/linea-service";
import { Linea } from "../../../../interfaces/gestion-producto/linea/interfaces-linea";

import { Layers, PlusCircle } from "lucide-react";
import { parseApiError } from "../../../../utils/errores";
import { ResponsePost } from "../../../../interfaces/generales/interfaces-generales";
import CantidadesInput from "../../../herramientas/formateo-de-campos/cantidades-input";
import { getUsuarioId } from "../../../../utils/auth";
import EncabezadoFormularios from "../../../ui/encabezadoFormularios";
import {
  TipoAlertaConfirmacion,
  TituloAlertaConfirmacion,
  useConfirmation,
} from "../../../herramientas/alertas/alertas-confirmacion";
import { SelectSuperLinea } from "../../super-linea/interfaces/interfaces-super-linea";
import SuperLineasSelector from "../../producto/componentes/configuracion/super-lineas-selector";

export default function RegistrarActualizarLineaForm({
  linea,
  onClose,
  onSuccess,
}: {
  linea?: Linea;
  onClose: () => void;
  onSuccess: (mensajeAlerta: string) => void;
}) {
  const usuarioId = getUsuarioId();
  const { showConfirmation, AlertasConfirmacion } = useConfirmation();
  const [rStockCritico, setStockCritico] = useState(false);
  const [superLineas, setSuperLineas] = useState<SelectSuperLinea[]>([]);
  const [denominacionSuperLinea, setDenominacionSuperLinea] = useState("");
  const [selectedSuperLinea, setSelectedSuperLinea] = useState<SelectSuperLinea>();
  const [mostrarFormularioSuperLinea, setMostrarFormularioSuperLinea] = useState(false);
  const denominacionSuperLineaRef = useRef<HTMLInputElement>(null);
  const selectSuperLineaRef = useRef<HTMLDivElement>(null);

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema(rStockCritico)) as any,
    defaultValues: linea ? transformData(linea) : {},
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
    setError,
  } = methods;

 
  const stockMinimo = watch("stockMinimo");
  const utilizaStockMinimo = watch("utilizaStockMinimo");

  useEffect(() => {
    if (!utilizaStockMinimo) {
      setValue("stockMinimo", 0);
    }
  }, [utilizaStockMinimo, setValue]);

  useEffect(() => {
    setStockCritico(utilizaStockMinimo || false);
  }, [utilizaStockMinimo]);

  useEffect(() => {
    handleBuscarSuperLineaPorDenominacion();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (linea) {
          setValue("denominacion", linea.denominacion || "");
          setValue("observacion", linea.observacion || null);
          setValue("stockMinimo", linea.stockMinimo || 0);
          setValue("utilizaStockMinimo", linea.utilizaStockMinimo || false);
          setValue("superLineaId", linea.superLinea?.id || 0);
          
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (formData: FormValues) => {
    let response: ResponsePost;
    try {
     

      if (linea) {
        const payload = { ...formData, usuarioUpdatedId: usuarioId };
        response = await LineaService.actualizar(linea.id, payload);
      } else {
        const payload = { ...formData, usuarioCreatedId: usuarioId };
        response = await LineaService.nuevo(payload);
      }
      onClose();
      onSuccess(response.mensaje);
    } catch (error) {
      setError("root", { type: "manual", message: parseApiError(error) });
    }
  };

 

  

  
  const handleOnClose = async () => {
    const confirmed = await showConfirmation({
      type: TipoAlertaConfirmacion.DEFAULT,
      title: TituloAlertaConfirmacion.DEFAULT,
      message: "¿Estás seguro de que quieres cerrar el formulario? NO se guardaran los cambios.",
      confirmText: "Aceptar",
      cancelText: "Cancelar",
      onConfirm: () => {},
    });
    if (confirmed) onClose();
  };

  const handleBuscarSuperLineaPorDenominacion = async () => {
    const result = await SuperLineaService.obtener({ denominacion: denominacionSuperLinea, skip: 0, take: 100 });
    if (result) setSuperLineas(result.data);
  };

  const handleEnterSuperLinea = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBuscarSuperLineaPorDenominacion();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto py-5">
      <Card className="relative w-full max-w-7xl bg-white mx-auto shadow-lg rounded-lg overflow-hidden mt-10 mb-12">
        <EncabezadoFormularios
          title={linea ? "Actualizar Línea" : "Registrar Línea"}
          subtitle={linea ? "Modifica los detalles de la línea." : "Ingresa los datos de la nueva línea."}
          icon={<Layers className="form-icon" />}
          onClose={handleOnClose}
        />

        <fieldset disabled={linea?.sistema === 1}>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 px-6 py-4">
                <div className="lg:col-span-2">
                  <FormInput name="denominacion" label="Denominación" placeholder="Ingresa la denominación" />
                </div>

                <div className="lg:col-span-2">
                  <FormInput name="observacion" label="Observación" placeholder="Ingresa una observación (opcional)" />
                </div>

                <div className="lg:col-span-2">

              <SuperLineasSelector
                denominacionSuperLinea={denominacionSuperLinea}
                setDenominacionSuperLinea={setDenominacionSuperLinea}
                denominacionSuperLineaRef={denominacionSuperLineaRef}
                selectSuperLineaRef={selectSuperLineaRef}
                superLineas={superLineas}
                selectedSuperLinea={selectedSuperLinea}
                superLineaId={watch("superLineaId")}
                disabled={linea?.sistema === 1}
                error={errors.superLineaId?.message}
                onEnterSuperLinea={handleEnterSuperLinea}
                onChangeSuperLinea={(sl) => {
                  setValue("superLineaId", sl?.id || 0, { shouldValidate: true });
                  setSelectedSuperLinea(sl ?? undefined);
                }}
                onAgregarSuperLinea={() => setMostrarFormularioSuperLinea(true)}
              />
            </div>

                <div className="flex items-end gap-2 lg:col-span-1">
                  <label className="flex items-center pb-2">
                    <input
                      type="checkbox"
                      {...methods.register("utilizaStockMinimo")}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                  <CantidadesInput
                    name="stockMinimo"
                    label="Stock Crítico"
                    value={stockMinimo || 0}
                    onChange={(value) => setValue("stockMinimo", Number(value))}
                    disabled={utilizaStockMinimo ? false : true}
                  />
                </div>
              </CardContent>
              {errors.root?.message && (
                <div className="text-red-600 text-center mb-4">{String(errors.root.message)}</div>
              )}

              <CardFooter className="flex justify-center">
                <Button type="submit" disabled={isSubmitting} className="btn btn-dark">
                  {isSubmitting ? (linea ? "Actualizando..." : "Registrando...") : linea ? "Actualizar" : "Registrar"}
                </Button>
              </CardFooter>
            </form>
          </FormProvider>
        </fieldset>
              {mostrarFormularioSuperLinea && (
        <RegistrarActualizarSuperLineaForm
          onClose={() => setMostrarFormularioSuperLinea(false)}
          onSuccess={() => {
            setMostrarFormularioSuperLinea(false);
            handleBuscarSuperLineaPorDenominacion();
          }}
        />
      )}
      </Card>

     
      <AlertasConfirmacion />
    </div>
  );
}
