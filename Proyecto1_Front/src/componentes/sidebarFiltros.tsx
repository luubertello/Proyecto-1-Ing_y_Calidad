import { Filter, Search, Recycle, CheckSquare, Tag, Building2, FileText, Truck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { useFiltrosContext } from "../context/filtros-contesxt";
import { useCatalogosContext } from "../context/catalogos-context";
import Select from "react-select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/Accordion";
import { BotonVertical } from "./ui/BotonVerticalFiltros";

interface SidebarProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export interface FiltrosSideBar {
  codigoProveedor?: boolean;
  denominacion?: boolean;
  superlinea?: boolean;
  linea?: boolean;
  marca?: boolean;
  proveedor?: boolean;
  conStock?: boolean;
}

export function SidebarFiltros({ isOpen, onClose, onOpen }: SidebarProps) {
  const { filtrosNecesarios, valoresFiltros, setValoresFiltros, limpiarFiltros, buscar, setBuscar } = useFiltrosContext();
  const { superlineas, lineas, marcas, proveedores } = useCatalogosContext();

  const handleLimpiarFiltros = () => {
    limpiarFiltros();
    setBuscar({ cont: buscar.cont + 1, componente: buscar.componente });
  };

  // Configuración común para todos los react-select
  const selectStyles = {
    control: (base: any) => ({ ...base, color: "black", borderColor: "#d1d5db" }),
    singleValue: (base: any) => ({ ...base, color: "black" }),
    option: (base: any, { isSelected, isFocused }: any) => ({
      ...base,
      color: isSelected ? "white" : "black",
      backgroundColor: isSelected ? "#3b82f6" : isFocused ? "#e0e7ff" : "white",
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <BotonVertical isOpen={isOpen} onOpen={onOpen} onClose={onClose} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 320, y: 80 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200, duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 z-40 w-80 md:z-auto"
          >
            <div className="h-full bg-gray-200 dark:bg-slate-900 shadow-2xl border-l border-slate-700 flex flex-col">
              {/* Header fijo */}
              <div className="flex-shrink-0 p-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-blue-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filtros</h2>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2"
                      onClick={() => setBuscar({ cont: buscar.cont + 1, componente: buscar.componente })}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button className="border-red-600 bg-red-600 hover:bg-red-700 p-2" onClick={handleLimpiarFiltros}>
                      <Recycle className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contenido scrolleable */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="p-4 space-y-4">
                  <Accordion type="multiple" className="w-full space-y-2">
                    
                    {/* 1. Filtro Código */}
                    {filtrosNecesarios.codigoProveedor && (
                      <AccordionItem value="codigoProveedor" className="border border-gray-200 dark:border-slate-600 rounded-lg">
                        <AccordionTrigger className="bg-gray-400 dark:bg-gray-700 px-4 py-3 hover:no-underline">
                          <div className="flex items-center space-x-3">
                            <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-black dark:text-white">Código</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input
                                type="text"
                                placeholder="Código..."
                                className="pl-10 bg-white dark:bg-slate-700"
                                value={valoresFiltros.codigoProveedor || ""}
                                onChange={(e) => setValoresFiltros({ ...valoresFiltros, codigoProveedor: e.target.value })}
                              />
                            </div>
                            <div className="flex items-center space-x-2 mt-2 p-2.5 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-300">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-gray-600 border-gray-300 rounded"
                                checked={valoresFiltros.codProveedorExacto || false}
                                onChange={(e) => setValoresFiltros({ ...valoresFiltros, codProveedorExacto: e.target.checked })}
                              />
                              <label className="text-sm text-gray-700 dark:text-gray-300">Búsqueda Exacta</label>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* 2. Filtro Denominación */}
                    {filtrosNecesarios.denominacion && (
                      <AccordionItem value="denominacion" className="border border-gray-200 dark:border-slate-600 rounded-lg">
                        <AccordionTrigger className="bg-gray-400 dark:bg-gray-700 px-4 py-3 hover:no-underline">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-black dark:text-white">Denominación</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input
                                type="text"
                                placeholder="Denominación..."
                                className="pl-10 bg-white dark:bg-slate-700"
                                value={valoresFiltros.denominacion || ""}
                                onChange={(e) => setValoresFiltros({ ...valoresFiltros, denominacion: e.target.value })}
                              />
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* 3. Filtro SuperLínea */}
                    {filtrosNecesarios.superlinea && (
                      <AccordionItem value="superlinea" className="border border-gray-200 dark:border-slate-600 rounded-lg">
                        <AccordionTrigger className="bg-gray-400 dark:bg-gray-700 px-4 py-3 hover:no-underline">
                          <div className="flex items-center space-x-3">
                            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-black dark:text-white">SuperLínea</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                            <Select
                              value={(superlineas ?? []).find((opt: any) => opt.id === valoresFiltros.superLineaId) || null}
                              options={superlineas ?? []}
                              getOptionLabel={(opt: any) => opt.denominacion}
                              getOptionValue={(opt: any) => String(opt.id)}
                              onChange={(opt: any) => setValoresFiltros({ ...valoresFiltros, superLineaId: opt ? opt.id : undefined })}
                              placeholder="Seleccione SuperLínea"
                              menuPortalTarget={document.body}
                              styles={selectStyles}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* 4. Filtro Línea */}
                    {filtrosNecesarios.linea && (
                      <AccordionItem value="linea" className="border border-gray-200 dark:border-slate-600 rounded-lg">
                        <AccordionTrigger className="bg-gray-400 dark:bg-gray-700 px-4 py-3 hover:no-underline">
                          <div className="flex items-center space-x-3">
                            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-black dark:text-white">Línea</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                            <Select
                              value={(lineas ?? []).find((opt: any) => opt.id === valoresFiltros.lineaId) || null}
                              options={lineas ?? []}
                              getOptionLabel={(opt: any) => opt.denominacion}
                              getOptionValue={(opt: any) => String(opt.id)}
                              onChange={(opt: any) => setValoresFiltros({ ...valoresFiltros, lineaId: opt ? opt.id : undefined })}
                              placeholder="Seleccione Línea"
                              menuPortalTarget={document.body}
                              styles={selectStyles}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* 5. Filtro Marca */}
                    {filtrosNecesarios.marca && (
                      <AccordionItem value="marca" className="border border-gray-200 dark:border-slate-600 rounded-lg">
                        <AccordionTrigger className="bg-gray-400 dark:bg-gray-700 px-4 py-3 hover:no-underline">
                          <div className="flex items-center space-x-3">
                            <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-black dark:text-white">Marca</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                            <Select
                              value={(marcas ?? []).find((opt: any) => opt.id === valoresFiltros.marcaId) || null}
                              options={marcas ?? []}
                              getOptionLabel={(opt: any) => opt.denominacion}
                              getOptionValue={(opt: any) => String(opt.id)}
                              onChange={(opt: any) => setValoresFiltros({ ...valoresFiltros, marcaId: opt ? opt.id : undefined })}
                              placeholder="Seleccione Marca"
                              menuPortalTarget={document.body}
                              styles={selectStyles}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* 6. Filtro Proveedor */}
                    {filtrosNecesarios.proveedor && (
                      <AccordionItem value="proveedor" className="border border-gray-200 dark:border-slate-600 rounded-lg">
                        <AccordionTrigger className="bg-gray-400 dark:bg-gray-700 px-4 py-3 hover:no-underline">
                          <div className="flex items-center space-x-3">
                            <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-black dark:text-white">Proveedor</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                            <Select
                              value={(proveedores ?? []).find((opt: any) => opt.id === valoresFiltros.proveedorId) || null}
                              options={proveedores ?? []}
                              getOptionLabel={(opt: any) => opt.denominacion}
                              getOptionValue={(opt: any) => String(opt.id)}
                              onChange={(opt: any) => setValoresFiltros({ ...valoresFiltros, proveedorId: opt ? opt.id : undefined })}
                              placeholder="Seleccione Proveedor"
                              menuPortalTarget={document.body}
                              styles={selectStyles}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* 7. Filtros Adicionales (Con Stock) */}
                    {filtrosNecesarios.conStock && (
                      <AccordionItem value="conStock" className="border border-gray-200 dark:border-slate-600 rounded-lg">
                        <AccordionTrigger className="bg-gray-400 dark:bg-gray-700 px-4 py-3 hover:no-underline">
                          <div className="flex items-center space-x-3">
                            <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-black dark:text-white">Adicionales</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                            <div className="flex items-center space-x-2 p-2.5 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-300">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                checked={valoresFiltros.conStock || false}
                                onChange={(e) => setValoresFiltros({ ...valoresFiltros, conStock: e.target.checked })}
                              />
                              <label className="text-sm text-gray-700 dark:text-gray-300">Solo con stock</label>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                  </Accordion>
                  <div className="h-4"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}