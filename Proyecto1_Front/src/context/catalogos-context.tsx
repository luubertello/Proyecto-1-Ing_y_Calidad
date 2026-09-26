import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import axiosConfig from "../utils/axiosConfig";
import { SelectLinea } from "../interfaces/gestion-producto/linea/interfaces-linea";
import { SelectSublinea } from "../interfaces/gestion-producto/sublinea/interfaces-sublinea";
import { SelectMarca } from "../interfaces/gestion-producto/marca/interfaces-marca";
import { SelectCliente } from "../interfaces/gestion-organizacion/cliente/interfaces-cliente";
import { SelectProveedor } from "../interfaces/gestion-organizacion/proveedor/interfaces-proveedor";
import { SelectCondicionIva } from "../interfaces/gestion-organizacion/condicion-iva/interfaces-condicion-iva";
import { SelectProvincia } from "../interfaces/gestion-organizacion/localidad/interfaces-localidad";
import { SelectFamiliaBanco } from "../interfaces/gestion-organizacion/banco/interfaces-banco";

// Interfaz rápida para SuperLínea
export interface SelectSuperlinea {
  id: number;
  denominacion: string;
}

interface CatalogosContextType {
  superlineas: SelectSuperlinea[];
  setSuperlineas: (superlineas: SelectSuperlinea[]) => void;
  lineas: SelectLinea[];
  setLineas: (lineas: SelectLinea[]) => void;
  sublineas: SelectSublinea[];
  setSublineas: (sublineas: SelectSublinea[]) => void;
  marcas: SelectMarca[];
  setMarcas: (marcas: SelectMarca[]) => void;
  clientes: SelectCliente[];
  setClientes: (clientes: SelectCliente[]) => void;
  proveedores: SelectProveedor[];
  setProveedores: (proveedores: SelectProveedor[]) => void;
  condicionesIva: SelectCondicionIva[];
  setCondicionesIva: (condicionesIva: SelectCondicionIva[]) => void;
  provincias: SelectProvincia[];
  setProvincias: (provincias: SelectProvincia[]) => void;
  familiasBanco: SelectFamiliaBanco[];
  setFamiliasBanco: (familias: SelectFamiliaBanco[]) => void;
}

const CatalogosContext = createContext<CatalogosContextType | null>(null);

export const useCatalogosContext = () => {
  const ctx = useContext(CatalogosContext);
  if (!ctx) throw new Error("CatalogosContext must be used within CatalogosProvider");
  return ctx;
};

export const CatalogosProvider = ({ children }: { children: ReactNode }) => {
  const [superlineas, setSuperlineas] = useState<SelectSuperlinea[]>([]);
  const [lineas, setLineas] = useState<SelectLinea[]>([]);
  const [sublineas, setSublineas] = useState<SelectSublinea[]>([]);
  const [marcas, setMarcas] = useState<SelectMarca[]>([]);
  const [clientes, setClientes] = useState<SelectCliente[]>([]);
  const [proveedores, setProveedores] = useState<SelectProveedor[]>([]);
  const [condicionesIva, setCondicionesIva] = useState<SelectCondicionIva[]>([]);
  const [provincias, setProvincias] = useState<SelectProvincia[]>([]);
  const [familiasBanco, setFamiliasBanco] = useState<SelectFamiliaBanco[]>([]);

  // 👇 MAGIA NUEVA: Carga inicial de todos los catálogos para el Sidebar
  useEffect(() => {
    const cargarCatalogosIniciales = async () => {
      try {
        const token = localStorage.getItem("Token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = axiosConfig.apiUrl;

        // Aprovechamos los mismos endpoints limpitos que usamos para la actualización masiva
        const [resSuper, resLineas, resMarcas, resProv] = await Promise.all([
          axios.get(`${apiUrl}/super-linea/find-all-for-select?denominacion=`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${apiUrl}/producto/find-all-for-lineas/select?denominacion=`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${apiUrl}/producto/find-all-for-marcas/select?denominacion=`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${apiUrl}/proveedor/find-all-for-select?denominacion=`, { headers }).catch(() => ({ data: [] })),
        ]);
        console.log("Respuesta de SuperLineas cruda:", resSuper);

        const formatData = (res: any) => {
          if (!res) return [];
          if (Array.isArray(res.data)) return res.data;
          if (res.data && Array.isArray(res.data.data)) return res.data.data;
          return [];
          };

        const superlineasListas = formatData(resSuper);
        console.log("SuperLíneas extraídas:", superlineasListas); 

        setSuperlineas(formatData(resSuper));
        setLineas(formatData(resLineas));
        setMarcas(formatData(resMarcas));
        setProveedores(formatData(resProv));

      } catch (err) {
        console.error("Error cargando catálogos del Sidebar:", err);
      }
    };

    cargarCatalogosIniciales();
  }, []);

  return (
    <CatalogosContext.Provider
      value={{
        superlineas,
        setSuperlineas,
        lineas,
        setLineas,
        sublineas,
        setSublineas,
        marcas,
        setMarcas,
        clientes,
        setClientes,
        proveedores,
        setProveedores,
        condicionesIva,
        setCondicionesIva,
        provincias,
        setProvincias,
        familiasBanco,
        setFamiliasBanco,
      }}
    >
      {children}
    </CatalogosContext.Provider>
  );
};