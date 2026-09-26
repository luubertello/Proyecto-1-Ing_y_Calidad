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
import { Layers, PackageSearch, DollarSign, Boxes, Settings2, PencilLine } from "lucide-react";
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

function SeccionTitulo({ icon, titulo }: { icon: React.ReactNode; titulo: string }) {
  return (
    <div className="col-span-full flex items-center gap-2 mt-3 mb-0.5">
      {icon}
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{titulo}</h3>
      <div className="flex-1 border-t border-gray-200 ml-2" />
    </div>
  );
}

export default function RegistrarActualizarProductoForm({
  producto,
  onClose,
  onSuccess,
}: {
  producto?: Producto;
  onClose: () => void;
  onSuccess: (mensajeAlerta: string) => void;
}) {
  const usuarioId = getUsuarioId();

  const { configuracion } = useConfiguracionSistema();
  const [rStockCritico, setStockCritico] = useState(false);
  const [usaOferta, setUsaOferta] = useState(false);
  const [lineaSeleccionada, setLineaSeleccionada] = useState<Linea>({} as Linea);

  const [mostrarAjusteStock, setMostrarAjusteStock] = useState(false);
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(0);
  const [motivoAjuste, setMotivoAjuste] = useState("");
  const [enviandoAjuste, setEnviandoAjuste] = useState(false);
  const [errorAjuste, setErrorAjuste] = useState<string | null>(null);
  const [stockActualLocal, setStockActualLocal] = useState<number>(producto?.stock ?? 0);

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema(rStockCritico, usaOferta)) as any,
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
  const utilizaStockMinimo = watch("utilizaStockMinimo");

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

  useEffect(() => {
    if (!utilizaStockMinimo) {
      setValue("stockMinimo", 0);
    }
  }, [utilizaStockMinimo, false, setValue]);

  useEffect(() => {
    setValue("stockMinimo", lineaSeleccionada.stockMinimo || 0);
    setValue("utilizaStockMinimo", lineaSeleccionada.utilizaStockMinimo || false);
  }, [lineaSeleccionada]);

  useEffect(() => {
    setStockCritico(utilizaStockMinimo || false);
    setUsaOferta(false);
  }, [utilizaStockMinimo, false]);

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

          setValue("alicuotaIva", producto.alicuotaIva || 0);

          setValue("stockMinimo", producto.stockMinimo || 0);
          setValue("utilizaStockMinimo", producto.utilizaStockMinimo || false);

          setStockActualLocal(producto.stock || 0);
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [producto]);

  useEffect(() => {
    if (!denominacionManual) {
      const nombreMarca = selectedMarca?.denominacion || "";
      const nombreLinea = selectedLinea?.denominacion || "";
      const cantidad = presentacionCantidad || "";
      const unidad = presentacionUnidad || "";

      const presentacionStr = cantidad && unidad ? `${cantidad}${unidad}` : "";

      const nuevaDenominacion = `${nombreMarca} ${nombreLinea} ${presentacionStr}`.trim();

      setValue("denominacion", nuevaDenominacion, { shouldValidate: true });
    }
  }, [selectedMarca, selectedLinea, presentacionCantidad, presentacionUnidad, denominacionManual, setValue]);

  const onSubmit = async (formData: any) => {
    let response: ResponsePost;

    try {
      if (isPrecioModificado && (!formData.motivo || formData.motivo.trim() === "")) {
        setError("root", {
          type: "manual",
          message: "Debes ingresar un motivo para registrar el cambio de precio.",
        });
        return;
      }

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
        const { stock, ...restoSinStock } = restoFormData;
        const payload = {
          ...restoSinStock,
          presentacion,
          usuarioUpdatedId: usuarioId,
          motivo: formData.motivo,
        };

        response = await ProductoService.actualizar(producto.id, payload as any);
      } else {
        const payload = {
          ...restoFormData,
          presentacion,
          usuarioCreatedId: usuarioId,
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
          setLineas(lineas.data);
        }
      }
      if (select === "MARCA") {
        const marcas = await ProductoService.obtenerTotales({ denominacion: denominacionMarca }, "marcas");
        if (marcas) {
          setMarcas(marcas.data);
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
      }, 300);
    }
  };

  const handleAbrirAjusteStock = () => {
    setCantidadAjuste(0);
    setMotivoAjuste("");
    setErrorAjuste(null);
    setMostrarAjusteStock(true);
  };

  const handleConfirmarAjusteStock = async () => {
    if (!producto) return;

    if (!cantidadAjuste || cantidadAjuste === 0) {
      setErrorAjuste("Ingresá una cantidad distinta de 0.");
      return;
    }
    if (!motivoAjuste || motivoAjuste.trim() === "") {
      setErrorAjuste("El motivo es obligatorio.");
      return;
    }

    setEnviandoAjuste(true);
    setErrorAjuste(null);
    try {
      await ProductoService.ajustarStock(producto.id, {
        cantidad: cantidadAjuste,
        motivo: motivoAjuste,
        usuarioId: usuarioId,
      });
      setStockActualLocal((prev) => prev + cantidadAjuste);
      setValue("stock", stockActualLocal + cantidadAjuste);
      setMostrarAjusteStock(false);
    } catch (error) {
      setErrorAjuste(parseApiError(error));
    } finally {
      setEnviandoAjuste(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 overflow-y-auto py-5">
      <Card className="w-full max-w-5xl bg-white mx-auto shadow-lg rounded-2xl overflow-hidden relative mt-10 mb-12">
        <EncabezadoFormularios
          title={producto ? "Producto" : "Registrar Producto"}
          subtitle={
            producto
              ? "Podés modificar los datos. El stock se ajusta por separado."
              : "Ingresa los datos."
          }
          icon={<Layers className="form-icon" />}
          onClose={onClose}
        />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 px-6 py-3">

              {/* ============ SECCIÓN: IDENTIFICACIÓN ============ */}
              <SeccionTitulo icon={<PackageSearch size={16} className="text-gray-500" />} titulo="Identificación" />

              <div className="col-span-full">
                <FormInput
                  name="denominacion"
                  label="Denominación"
                  placeholder="Ingresa la denominación"
                  disabled={producto && producto.sistema > 0 ? true : false}
                  inputRef={denominacionProductoRef}
                  onKeyDown={(e: any) => {
                    setValue("denominacionManual", true);
                    if (enterToObservacion) {
                      enterToObservacion(e);
                    }
                  }}
                />
              </div>

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

              <FormInput
                name="codigoProveedor"
                label="Código Interno"
                placeholder="Código interno"
                disabled={producto && producto.sistema > 0 ? true : false}
              />

              <FormInput
                name="codigoReferencia"
                label="Código Referencia"
                placeholder="Código de referencia"
              />

              <FormInput
                name="codigoBarra"
                label="Código De Barra"
                placeholder="Opcional"
                inputRef={codigoBarraRef}
                onKeyDown={(e) => handleEnterEnSelect(e, "ALICUOTA-IVA")}
              />

              <div className="col-span-full md:col-span-1">
                <FormInput
                  name="ubicacion"
                  label="Ubicación"
                  placeholder="Opcional"
                  onKeyDown={(e) => handleEnterEnSelect(e, "TIPO-PRODUCTO")}
                  inputRef={ubicacionRef}
                />
              </div>

              {/* ============ SECCIÓN: PRESENTACIÓN Y PRECIO ============ */}
              <SeccionTitulo icon={<Boxes size={16} className="text-gray-500" />} titulo="Presentación y Precio" />

              {/* Presentación: cantidad + unidad, juntas en un mismo bloque */}
              <div className="col-span-full md:col-span-1 flex gap-2 items-end">
                <div className="flex-1">
                  <CantidadesInput
                    name="presentacionCantidad"
                    label="Presentación"
                    value={watch("presentacionCantidad") || 0}
                    onChange={(value) => setValue("presentacionCantidad", Number(value), { shouldValidate: true })}
                    disabled={producto && producto.sistema > 0 ? true : false}
                  />
                </div>
                <div className="flex-1">
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
                    placeholder="Unidad"
                  />
                </div>
              </div>
              {errors.presentacionUnidad && (
                <small className="text-red-500 col-span-full md:col-span-1 -mt-2">
                  {errors.presentacionUnidad?.message as string}
                </small>
              )}

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
                label="Margen (%)"
                value={watch("porcentaje") || 0}
                onChange={(value) => setValue("porcentaje", value, { shouldValidate: true })}
                disabled={producto && producto.sistema > 0 ? true : false}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Precio Calculado</label>
                <input
                  type="text"
                  className="form-input bg-gray-100 cursor-not-allowed"
                  value={`$ ${((watch("costo") || 0) * (1 + (watch("porcentaje") || 0) / 100)).toFixed(2)}`}
                  disabled
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Alícuota IVA</label>
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
                      control: (base) => ({ ...base, color: "black" }),
                      singleValue: (base) => ({ ...base, color: "black" }),
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

              {isPrecioModificado && (
                <div className="col-span-full mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg w-full">
                  <h4 className="text-amber-800 font-semibold mb-1 flex items-center gap-2 text-sm">
                    ⚠️ Detectamos un cambio en el precio
                  </h4>
                  <p className="text-xs text-amber-700 mb-2">
                    Por motivos de auditoría, debes justificar esta modificación.
                  </p>
                  <FormInput
                    name="motivo"
                    label="Motivo del cambio (Obligatorio)"
                    placeholder="Ej: Aumento de proveedor, ajuste por inflación..."
                  />
                </div>
              )}

              {/* ============ SECCIÓN: STOCK ============ */}
              <SeccionTitulo icon={<Boxes size={16} className="text-gray-500" />} titulo="Stock" />

              {!producto ? (
                <CantidadesInput
                  name="stock"
                  label="Stock Inicial"
                  value={stock || 0}
                  onChange={(value) => setValue("stock", Number(value))}
                  disabled={false}
                />
              ) : (
                <div className="col-span-full md:col-span-1 flex items-end gap-2">
                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Stock Actual</label>
                    <input
                      type="text"
                      className="form-input bg-gray-100 cursor-not-allowed"
                      value={stockActualLocal}
                      disabled
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAbrirAjusteStock}
                    className="btn btn-outline flex items-center gap-1 h-[42px]"
                  >
                    <PencilLine size={16} />
                    Ajustar
                  </Button>
                </div>
              )}

              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 mb-2.5">
                  <input
                    type="checkbox"
                    {...methods.register("utilizaStockMinimo")}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={producto && producto.sistema > 0 ? true : false}
                  />
                  <span className="text-sm text-gray-700 whitespace-nowrap">Stock mínimo</span>
                </label>
                <div className="flex-1">
                  <CantidadesInput
                    name="stockMinimo"
                    label=""
                    value={stockMinimo || 0}
                    onChange={(value) => setValue("stockMinimo", Number(value))}
                    disabled={utilizaStockMinimo ? false : true}
                  />
                </div>
              </div>

              {/* ============ SECCIÓN: OBSERVACIONES ============ */}
              <div className="col-span-full">
                <FormInput
                  name="observacion"
                  label="Observación"
                  placeholder="Observaciones adicionales (opcional)"
                  inputRef={observacionRef}
                />
              </div>

            </CardContent>

            {errors.root?.message && <div className="text-red-600 text-center mb-3">{String(errors.root.message)}</div>}

            <CardFooter className="flex justify-center py-3">
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
              handleBuscarPorDenominacion("LINEA");
            }}
          />
        )}

        {mostrarFormularioMarca && (
          <RegistrarActualizarMarcaForm
            onClose={() => setMostrarFormularioMarca(false)}
            onSuccess={() => {
              setMostrarFormularioMarca(false);
              handleBuscarPorDenominacion("MARCA");
            }}
          />
        )}

        {mostrarAjusteStock && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-1 text-gray-800">Ajustar Stock</h3>
              <p className="text-sm text-gray-500 mb-4">
                Stock actual: <strong>{stockActualLocal}</strong>
              </p>

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Cantidad (positivo suma, negativo resta)
              </label>
              <input
                type="number"
                className="w-full mb-3 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={cantidadAjuste === 0 ? "" : cantidadAjuste}
                placeholder="0"
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value;
                  setCantidadAjuste(val === "" ? 0 : Number(val));
                }}
              />

              <label className="mb-1 block text-sm font-medium text-gray-700">Motivo (obligatorio)</label>
              <input
                type="text"
                className="w-full mb-3 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Rotura, inventario físico, error de carga..."
                value={motivoAjuste}
                onChange={(e) => setMotivoAjuste(e.target.value)}
              />

              {errorAjuste && <p className="text-red-500 text-sm mb-3">{errorAjuste}</p>}

              <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setMostrarAjusteStock(false)} className="btn btn-outline">
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmarAjusteStock}
                  disabled={enviandoAjuste}
                  className="btn btn-dark"
                >
                  {enviandoAjuste ? "Guardando..." : "Confirmar"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}