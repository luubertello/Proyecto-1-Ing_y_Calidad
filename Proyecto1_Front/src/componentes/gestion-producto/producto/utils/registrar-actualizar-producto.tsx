import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CardContent, CardFooter } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import FormInput from "../../../herramientas/formateo-de-campos/form-input";
import React from "react";
import { Card } from "../../../ui/Card";
import ProductoService from "../services/producto-service";
import PriceInput from "../../../herramientas/formateo-de-campos/price-input";
import CantidadesInput from "../../../herramientas/formateo-de-campos/cantidades-input";
import { Producto, SelectPresentacion } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";
import { SelectMarca } from "../../../../interfaces/gestion-producto/marca/interfaces-marca";
import { Linea, SelectLinea } from "../../../../interfaces/gestion-producto/linea/interfaces-linea";
import { AlicuotaIva, ResponsePost } from "../../../../interfaces/generales/interfaces-generales";
import Select from "react-select";
import { useEnterFocus } from "../../../herramientas/formateo-de-campos/movimiento-campos";
import { useConfiguracionSistema } from "../../../sistema/ConfiguracionSistemaContext";
import { parseApiError } from "../../../../utils/errores";
import { Layers } from "lucide-react";
import RegistrarActualizarMarcaForm from "../../marca/utils/registrar-actualizar-marca";
import { ItemProveedor } from "../../../../interfaces/gestion-producto/producto/interfaces-item-proveedor";
import { SelectSublinea } from "../../../../interfaces/gestion-producto/sublinea/interfaces-sublinea";
import { ItemsProveedorEnPayload } from "../interfaces/interfaces-validaciones-item-proveedor";
import { FormValues, schema, transformData, transformarItemsProdAlternativo } from "../interfaces/interfaces-validaciones-producto";
import LineasSelector from "../componentes/configuracion/lineas-selector";
import EncabezadoFormularios from "../../../ui/encabezadoFormularios";
import MarcasSelector from "../componentes/configuracion/marcas-selector";
import { getUsuarioId } from "../../../../utils/auth";
import RegistrarActualizarLineaForm from "../../linea/utils/registrar-actualizar-linea";
import PorcentajeInput from "../../../herramientas/formateo-de-campos/porcentaje-input";


export default function RegistrarActualizarProductoForm({
  producto,
  onClose,
  onSuccess,
}: {
  producto?: Producto;
  onClose: () => void;
  onSuccess: (mensajeAlerta: string) => void;
}) {
  //===================== CONSTANTES VARIAS ============================================
  const usuarioId = getUsuarioId();

  const { configuracion } = useConfiguracionSistema();
  const [rStockCritico, setStockCritico] = useState(false);
  const [pack, setPack] = useState(false);
  const [usaOferta, setUsaOferta] = useState(false);
  const [lineaSeleccionada, setLineaSeleccionada] = useState<Linea>({} as Linea);

  console.log("Configuración del sistema:", configuracion);

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema(rStockCritico, pack, usaOferta)) as any,
    defaultValues: producto
      ? transformData(producto)
      : {
          alicuotaIva: AlicuotaIva.ALICUOTA_21,
        },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
    setError,
  } = methods;

  console.log("estos son los errores", errors);

  console.log("Producto que llega al formulario", producto);

  console.log("linea seleccionada", lineaSeleccionada);

  const [marcas, setMarcas] = React.useState<SelectMarca[]>([]);
  const [lineas, setLineas] = React.useState<SelectLinea[]>([]);
  
  const [denominacionMarca, setDenominacionMarca] = useState(" ");
  const [denominacionLinea, setDenominacionLinea] = useState(" ");
  const [selectedLinea, setSelectedLinea] = React.useState<SelectLinea>();
  const [selectedMarca, setSelectedMarca] = React.useState<SelectMarca>();
  const [mostrarFormularioLinea, setMostrarFormularioLinea] = useState(false);
  const [mostrarFormularioMarca, setMostrarFormularioMarca] = useState(false);
  const [itemProdAlternativoSinAgregar, setItemProdAlternativoSinAgregar] = useState(false);

  const stock = watch(`stock`);
  const costoForm = watch("costo");
  const porcentajeForm = watch("porcentaje");
  const isPrecioModificado = producto && (
    Number(costoForm) !== Number(producto.costo) || 
    Number(porcentajeForm) !== Number(producto.porcentaje)
  );
  const presentacionCantidad = watch("presentacionCantidad");
  const presentacionUnidad = watch("presentacionUnidad");
  const denominacionManual = watch("denominacionManual");
  const stockMinimo = watch("stockMinimo");
  const cantidadPorPack = watch("cantidadPorPack");
  const utilizaStockMinimo = watch("utilizaStockMinimo");
  const utilizaPack = watch("utilizaPack");
  

  //=============================== CONSTANTES PARA MOVIMIENTO ENTRE CAMPOS ==================================
  const denominacionProductoRef = useRef<HTMLInputElement>(null);
  useEnterFocus(denominacionProductoRef);
  const observacionRef = useRef<HTMLInputElement>(null);
  const ubicacionRef = useRef<HTMLInputElement>(null);
  const selectTipoProductoRef = useRef<HTMLDivElement>(null);
  const codigoBarraRef = useRef<HTMLInputElement>(null);
  const selectAlicuotaIvaRef = useRef<HTMLDivElement>(null);
  const precioOfertaRef = useRef<HTMLInputElement>(null);
  const denominacionLineaRef = useRef<HTMLInputElement>(null);
  const selectLineaRef = useRef<HTMLDivElement>(null);
  const denominacionMarcaRef = useRef<HTMLInputElement>(null);
  const selectMarcaRef = useRef<HTMLDivElement>(null);

  const enterToObservacion = useEnterFocus(observacionRef);
  const enterToPrecioOferta = useEnterFocus(precioOfertaRef);
  const enterToDenominacionMarca = useEnterFocus(denominacionMarcaRef);

  //=============================== FUNCIONALIDAD ==================================

  useEffect(() => {
    if (!utilizaStockMinimo) {
      setValue("stockMinimo", 0);
    }
    if (!utilizaPack) {
      setValue("cantidadPorPack", 0);
    }
    
  }, [utilizaStockMinimo, utilizaPack, false, setValue]);

  useEffect(() => {
    setValue("stockMinimo", lineaSeleccionada.stockMinimo || 0);
    setValue("utilizaStockMinimo", lineaSeleccionada.utilizaStockMinimo || false);
  }, [lineaSeleccionada]);

  useEffect(() => {
    setPack(utilizaPack || false);
    setStockCritico(utilizaStockMinimo || false);
    setUsaOferta(false);
  }, [utilizaPack, utilizaStockMinimo, false]);

  useEffect(() => {
    handleBuscarPorDenominacion("LINEA");
    handleBuscarPorDenominacion("MARCA");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (producto) {
          setValue("lineaId", producto.linea.id || 0);
          setSelectedLinea(producto.linea);

          setValue("marcaId", producto.marca.id || 0);
          setSelectedMarca(producto.marca);

          setValue("presentacionCantidad", producto.presentacion?.cantidad || 0);
          setValue("presentacionUnidad", producto.presentacion?.unidad || "");

          
          setValue("denominacion", producto.denominacion || "");
          setValue("denominacionManual", producto.denominacionManual || false);
          setValue("observacion", producto.observacion || null);
          setValue("codigoProveedor", producto.codigoProveedor || "");
          setValue("codigoBarra", producto.codigoBarra || null);
          setValue("stock", producto.stock || 0);
          setValue("costo", producto.costo || 0);
          
          //setValue("oferta", producto.oferta || false);
          setValue("alicuotaIva", producto.alicuotaIva || 0);

          setValue("stockMinimo", producto.stockMinimo || 0);
          setValue("utilizaStockMinimo", producto.utilizaStockMinimo || false);
          setValue("cantidadPorPack", producto.cantidadPorPack || 0);
          setValue("utilizaPack", producto.utilizaPack || false);
        
          console.error("llega aca", producto);
        
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [producto]);

  useEffect(() => {
      // Solo regenera el nombre si la bandera manual es falsa o indefinida
      if (!denominacionManual) {
        const nombreMarca = selectedMarca?.denominacion || "";
        const nombreLinea = selectedLinea?.denominacion || "";
        const cantidad = presentacionCantidad || "";
        const unidad = presentacionUnidad || "";
        
        const presentacionStr = cantidad && unidad ? `${cantidad}${unidad}` : "";
        
        const nuevaDenominacion = `${nombreMarca} ${nombreLinea} ${presentacionStr}`.trim();
        
        // Actualiza el input automáticamente
        setValue("denominacion", nuevaDenominacion, { shouldValidate: true });
      }
    }, [selectedMarca, selectedLinea, presentacionCantidad, presentacionUnidad, denominacionManual, setValue]);

 const onSubmit = async (formData: any) => {
    let response: ResponsePost;

    try {
      if (isPrecioModificado && (!formData.motivo || formData.motivo.trim() === "")) {
        setError("root", { 
          type: "manual", 
          message: "Debes ingresar un motivo para registrar el cambio de precio." 
        });
        return; 
      }

      // ⚠️ Validar si hay ítems sin agregar
      if (itemProdAlternativoSinAgregar) {
        const mensaje = [
          itemProdAlternativoSinAgregar ? "- Hay un producto alternativo sin agregar." : "",
          "",
          "¿Estás seguro de que querés registrar sin agregarlos?",
        ]
          .filter(Boolean)
          .join("\n");

        const confirmar = window.confirm(mensaje);

        if (!confirmar) return; 
      }

      const { 
        presentacionCantidad, 
        presentacionUnidad, 
        precio, 
        usuarioCreatedId, 
        usuarioUpdatedId, 
        ...restoFormData 
      } = formData;

      const presentacion = presentacionCantidad && presentacionUnidad
        ? { cantidad: presentacionCantidad, unidad: presentacionUnidad }
        : undefined;

      if (producto) {
        // MODO EDICIÓN
        const payload = {
          ...restoFormData,
          presentacion,
          usuarioUpdatedId: usuarioId,
          motivo: formData.motivo, 
        };

        response = await ProductoService.actualizar(producto.id, payload as any);
      } else {
        // MODO CREACIÓN
        const payload = {
          ...restoFormData,
          presentacion,
          usuarioCreatedId: usuarioId, // Para crear nuevo
        };

        response = await ProductoService.nuevo(payload as any);
      }

      await onSuccess(response.mensaje);
      onClose();
    } catch (error) {
      const errorMessage = parseApiError(error);

      setError("root", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  const handleBuscarPorDenominacion = async (select: string) => {
    try {
      if (select === "LINEA") {
        const lineas = await ProductoService.obtenerTotales({ denominacion: denominacionLinea }, "lineas");
        if (lineas) {
          console.log("Lineas encontradas:", lineas);
          setLineas(lineas.data);
        } else {
          console.log("No se encontró una linea con la denominación ingresada.");
        }
      }
      if (select === "MARCA") {
        const marcas = await ProductoService.obtenerTotales({ denominacion: denominacionMarca }, "marcas");
        if (marcas) {
          console.log("Marcas encontradas:", marcas);
          setMarcas(marcas.data);
        } else {
          console.log("No se encontró una marca con la denominación ingresada.");
        }
      }
      
    } catch (error) {
      console.error("Error al buscar por código:", error);
    }
  };

  const handleEnterEnSelect = async (e: any, select: string) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (select === "LINEA") {
        handleBuscarPorDenominacion("LINEA");
      }

      if (select === "MARCA") {
        handleBuscarPorDenominacion("MARCA");
      }

      // Esperar un poco (opcional, si el botón hace una búsqueda antes)
      setTimeout(() => {
        let selectDiv: HTMLDivElement | null = null;

        if (select === "MARCA") {
          selectDiv = selectMarcaRef.current;
        }

        if (select === "LINEA") {
          selectDiv = selectLineaRef.current;
        }

        if (select === "TIPO-PRODUCTO") {
          selectDiv = selectTipoProductoRef.current;
        }

        if (select === "ALICUOTA-IVA") {
          selectDiv = selectAlicuotaIvaRef.current;
        }

        if (selectDiv) {
          const input = selectDiv.querySelector("input");
          if (input) {
            input.focus();
            input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
          }
        }
      }, 300); // Ajustá este delay según el tiempo de búsqueda, si es necesario
    }
  };



  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 overflow-y-auto py-5">
      <Card className="w-full max-w-7xl bg-white mx-auto shadow-lg rounded-2xl overflow-hidden relative mt-10 mb-12">
        <EncabezadoFormularios
          title={producto ? "Producto" : "Registrar Producto"}
          subtitle={
            producto
              ? "Sólo puede visualizarse, no modificarse."
            : "Ingresa los datos."
          }
          icon={<Layers className="form-icon" />}
          onClose={onClose}
        />  

        {/* Formulario */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 px-6 py-4">
              {/* Primera fila */}
              <div className="flex flex-col w-full gap-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 col-span-full">
                  <div className="col-span-full flex items-end gap-2">
                    <div className="flex-1">
                      <FormInput
                        name="denominacion"
                        label="Denominación"
                        placeholder="Ingresa la denominación"
                        disabled={producto && producto.sistema > 0 ? true : false}
                        inputRef={denominacionProductoRef}
                        onKeyDown={(e: any) => {
                          // 1. Activamos la bandera manual al tocar cualquier tecla
                          setValue("denominacionManual", true);
                          // 2. Mantenemos el comportamiento original que ya tenías
                          if (enterToObservacion) {
                            enterToObservacion(e);
                          }
                        }}
                      />
                    </div>

                    
                  </div>

                  <FormInput
                    name="codigoProveedor"
                    label="Codigo Interno"
                    placeholder="Ingresa el Codigo Interno"
                    disabled={producto && producto.sistema > 0 ? true : false}
                  />

                  <FormInput
                    name="codigoReferencia"
                    label="Codigo Referencia"
                    placeholder="Ingresa el codigo de referencia"
                  />

                  <FormInput
                    name="codigoBarra"
                    label="Código De Barra"
                    placeholder="Ingresa el código de barra (opcional)"
                    inputRef={codigoBarraRef}
                    onKeyDown={(e) => handleEnterEnSelect(e, "ALICUOTA-IVA")}
                  />

                  {/* <FormInput
                    name="costo"
                    label="Costo"
                    placeholder="Ingresa el costo"
                  />

                  <FormInput
                    name="precio"
                    label="Precio"
                    placeholder="Ingresa el precio"
                  />

                  <FormInput
                    name="porcentaje"
                    label="Porcentaje"
                    placeholder="Ingresa el porcentaje"
                  /> */}

                  <PriceInput
                    name="costo"
                    label="Costo"
                    value={watch("costo") || 0}
                    onChange={(value) => setValue("costo", value, { shouldValidate: true })}
                    maxDigits={9}
                    disabled={producto && producto.sistema > 0 ? true : false}
                  />

                  <PorcentajeInput
                    name="porcentaje"
                    label="Porcentaje"
                    value={watch("porcentaje") || 0}
                    onChange={(value) => setValue("porcentaje", value, { shouldValidate: true })}
                    disabled={producto && producto.sistema > 0 ? true : false}
                  />

                  {isPrecioModificado && (
                    <div className="col-span-full mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg w-full">
                      <h4 className="text-amber-800 font-semibold mb-2 flex items-center gap-2">
                        ⚠️ Detectamos un cambio en el precio
                      </h4>
                      <p className="text-sm text-amber-700 mb-3">
                        Por motivos de auditoría, debes justificar esta modificación.
                      </p>
                      <FormInput
                        name="motivo"
                        label="Motivo del cambio (Obligatorio)"
                        placeholder="Ej: Aumento de proveedor, ajuste por inflación..."
                      />
                    </div>
                  )}

                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Precio Calculado</label>
                  <input
                    type="text"
                    className="form-input bg-gray-100 cursor-not-allowed" // Estilos de bloqueado
                    value={`$ ${((watch("costo") || 0) * (1 + (watch("porcentaje") || 0) / 100)).toFixed(2)}`}
                    disabled
                  />
                </div>

                  <CantidadesInput
                    name="presentacionCantidad"
                    label="Cantidad Presentación"
                    value={watch("presentacionCantidad") || 0}
                    onChange={(value) => setValue("presentacionCantidad", Number(value), { shouldValidate: true })}
                    disabled={producto && producto.sistema > 0 ? true : false}
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Unidad Presentación</label>
                    <Select
                      value={
                        [
                          { value: "L", label: "Litros" },
                          { value: "ml", label: "Mililitros" },
                          { value: "g", label: "Gramos" },
                          { value: "kg", label: "Kilogramos" },
                          { value: "unidad", label: "Unidades" },
                          { value: "pack", label: "Pack" },
                        ].find((o) => o.value === watch("presentacionUnidad")) || null
                      }
                      options={[
                        { value: "L", label: "Litros" },
                        { value: "ml", label: "Mililitros" },
                        { value: "g", label: "Gramos" },
                        { value: "kg", label: "Kilogramos" },
                        { value: "unidad", label: "Unidades" },
                        { value: "pack", label: "Pack" },
                      ]}
                      onChange={(opt) => setValue("presentacionUnidad", opt?.value || "", { shouldValidate: true })}
                      isDisabled={producto && producto.sistema > 0 ? true : false}
                    />
                    {errors.presentacionUnidad && (
                      <small className="text-red-500">{errors.presentacionUnidad?.message as string}</small>
                    )}
                  </div>
                
            

                  <FormInput
                    name="ubicacion"
                    label="Ubicación"
                    placeholder="Ingresa una ubicación (opcional)"
                    onKeyDown={(e) => handleEnterEnSelect(e, "TIPO-PRODUCTO")}
                    inputRef={ubicacionRef}
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Alicuota IVA</label>
                    <div ref={selectAlicuotaIvaRef} className="w-full">
                      <Select
                        value={
                          Object.entries(AlicuotaIva)
                            .map(([key, value]) => ({
                              id: value,
                              denominacion: key === "ALICUOTA_105" ? "10.5" : key.replace("ALICUOTA_", ""),
                            }))
                            .find((option) => option.id === watch("alicuotaIva")) || null
                        }
                        options={Object.entries(AlicuotaIva).map(([key, value]) => ({
                          id: value,
                          denominacion: key === "ALICUOTA_105" ? "10.5" : key.replace("ALICUOTA_", ""),
                        }))}
                        onKeyDown={enterToPrecioOferta}
                        getOptionLabel={(option) => option.denominacion}
                        getOptionValue={(option) => String(option.id)}
                        isDisabled={producto && producto.sistema > 0 ? true : false}
                        onChange={(selectedOption) => {
                          methods.setValue(`alicuotaIva`, selectedOption?.id || 0);
                        }}
                        className="text-black"
                        menuPortalTarget={document.body}
                        styles={{
                          control: (base) => ({
                            ...base,
                            color: "black",
                          }),
                          singleValue: (base) => ({
                            ...base,
                            color: "black",
                          }),
                          option: (base, { isSelected, isFocused }) => ({
                            ...base,
                            color: isSelected ? "white" : "black",
                            backgroundColor: isSelected ? "#3b82f6" : isFocused ? "#93c5fd" : "white",
                          }),
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                      />
                      {errors.alicuotaIva && (
                        <small className="text-red-500">{errors.alicuotaIva?.message as string}</small>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-[120px]">
                    {producto ? (
                      <CantidadesInput
                        name={`stock`}
                        label="Stock"
                        value={stock || 0}
                        onChange={(value) => setValue(`stock`, Number(value))}
                        disabled={true}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 w-full">
                  <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                    <div className="col-span-full flex flex-wrap gap-4 mt-8">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...methods.register("utilizaStockMinimo")}
                          className={` w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500`}
                          disabled={producto && producto.sistema > 0 ? true : false}
                        />
                      </label>
                    </div>

                    <CantidadesInput
                      name={`stockMinimo`}
                      label="Stock Crítico"
                      value={stockMinimo || 0}
                      onChange={(value) => setValue(`stockMinimo`, Number(value))}
                      disabled={utilizaStockMinimo ? false : true}
                    />
                  </div>

                  

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 min-w-[140px]">
                    <div className="col-span-full flex flex-wrap gap-4 mt-8">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...methods.register("utilizaPack")}
                          className={`w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500`}
                          disabled={producto && producto.sistema > 0 ? true : false}
                        />
                      </label>
                    </div>

                    <CantidadesInput
                      name={`cantidadPorPack`}
                      label="Cantidad Pack"
                      value={cantidadPorPack || 0}
                      onChange={(value) => setValue(`cantidadPorPack`, Number(value))}
                      disabled={utilizaPack ? false : true}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-full gap-2">

              <LineasSelector
                denominacionLinea={denominacionLinea}
                setDenominacionLinea={setDenominacionLinea}
                denominacionLineaRef={denominacionLineaRef}
                selectLineaRef={selectLineaRef}
                lineas={lineas}
                selectedLinea={selectedLinea}
                lineaId={watch("lineaId")}
                disabled={producto && producto.sistema > 0}
                errors={errors}
                onEnterLinea={(e) => handleEnterEnSelect(e, "LINEA")}
                onEnterDenominacion={enterToDenominacionMarca}
                onLineaChange={(linea) => {
                  methods.setValue("lineaId", linea?.id || 0);
                  setSelectedLinea(linea as any);
                  setLineaSeleccionada(linea as any);
                }}
                onAgregarLinea={() => setMostrarFormularioLinea(true)}
              />

              <MarcasSelector
                denominacionMarca={denominacionMarca}
                setDenominacionMarca={setDenominacionMarca}
                denominacionMarcaRef={denominacionMarcaRef}
                selectMarcaRef={selectMarcaRef}
                marcas={marcas}
                selectedMarca={selectedMarca}
                marcaId={watch("marcaId")}
                disabled={producto && producto.sistema > 0}
                error={errors.marcaId?.message}
                onEnterMarca={(e) => handleEnterEnSelect(e, "MARCA")}
                onChangeMarca={(marca) => {
                  methods.setValue("marcaId", marca?.id || 0);
                  setSelectedMarca(marca as any);
                }}
                onAgregarMarca={() => setMostrarFormularioMarca(true)}
              />

              </div>

              {/* Segunda fila */}


              <hr className="col-span-full my-2 border-gray-300" />

              
              
            </CardContent>

            {errors.root?.message && <div className="text-red-600 text-center mb-4">{String(errors.root.message)}</div>}

            {/* Botón de submit */}
            <CardFooter className="flex justify-center">
              <Button type="submit" disabled={isSubmitting} className="btn btn-dark">
                {isSubmitting
                  ? producto
                    ? "Actualizando..."
                    : "Registrando..."
                  : producto
                  ? "Actualizar"
                  : "Registrar"}
              </Button>
            </CardFooter>
          </form>
        </FormProvider>

        {mostrarFormularioLinea && (
          <RegistrarActualizarLineaForm
            onClose={() => setMostrarFormularioLinea(false)}
            onSuccess={() => {
              setMostrarFormularioLinea(false);
              handleBuscarPorDenominacion("LINEA")
            }}
          />
        )}


        {mostrarFormularioMarca && (
          <RegistrarActualizarMarcaForm
            onClose={() => setMostrarFormularioMarca(false)}
            onSuccess={() => {
              setMostrarFormularioMarca(false);
              handleBuscarPorDenominacion("MARCA")
            }}
          />
        )}

       
      </Card>
    </div>
  );
}
