import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import ProductoService from "../services/producto-service";
import { getUsuarioId } from "../../../../utils/auth";
import axios from "axios";
import axiosConfig from "../../../../utils/axiosConfig";

interface Props {
  onClose: () => void;
  onSuccess: (mensaje: string) => void;
}

export default function ActualizacionMasivaModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados locales para los selects
  const [lineas, setLineas] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    tipoModificacion: "COSTO",
    tipoCalculo: "PORCENTAJE",
    signo: "AUMENTO",
    valor: "",
    motivo: "",
    lineaId: "",
    marcaId: "",
    proveedorId: "",
  });

  // Cargar datos al abrir el modal
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        setLoadingDatos(true);
        
        const token = localStorage.getItem("Token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = axiosConfig.apiUrl;

        const [resLineas, resMarcas, resProv] = await Promise.all([
          axios.get(`${apiUrl}/producto/find-all-for-lineas/select?denominacion=`, { headers }),
          axios.get(`${apiUrl}/producto/find-all-for-marcas/select?denominacion=`, { headers }),
          axios.get(`${apiUrl}/proveedor/find-all-for-select?denominacion=`, { headers }) 
        ]);
        
        // Asignamos la data (dependiendo de cómo envíe el JSON tu backend, puede ser res.data o res.data.data)
        setLineas(Array.isArray(resLineas.data) ? resLineas.data : resLineas.data?.data || []);
        setMarcas(Array.isArray(resMarcas.data) ? resMarcas.data : resMarcas.data?.data || []);
        setProveedores(Array.isArray(resProv.data) ? resProv.data : resProv.data?.data || []);

      } catch (err) {
        console.error("Error al cargar catálogos en el modal:", err);
      } finally {
        setLoadingDatos(false);
      }
    };

    cargarCatalogos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Regla de negocio: Si cambia a MARGEN, forzamos PORCENTAJE
    if (name === "tipoModificacion" && value === "MARGEN") {
      setFormData({ ...formData, [name]: value, tipoCalculo: "PORCENTAJE" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.valor || Number(formData.valor) <= 0) {
      setError("El valor debe ser mayor a 0");
      return;
    }
    if (!formData.motivo.trim()) {
      setError("El motivo es obligatorio para la auditoría.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const valorConSigno = formData.signo === "DISMINUCION"
        ? -Math.abs(Number(formData.valor))
        : Math.abs(Number(formData.valor));
      
      const payload = {
        tipoModificacion: formData.tipoModificacion,
        tipoCalculo: formData.tipoCalculo,
        valor: valorConSigno,
        motivo: formData.motivo,
        lineaId: formData.lineaId ? Number(formData.lineaId) : undefined,
        marcaId: formData.marcaId ? Number(formData.marcaId) : undefined,
        proveedorId: formData.proveedorId ? Number(formData.proveedorId) : undefined,
        usuarioId: getUsuarioId(),
      };

      const result = await ProductoService.actualizarPreciosMasivo(payload);
      onSuccess(result.mensaje);
      
    } catch (err: any) {
      setError("Error al procesar la actualización masiva. Verifique los datos o consulte al administrador.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-lg">
        <h2 className="text-xl font-bold text-gray-800">Actualización Masiva de Precios</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          {/* Qué modificar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué desea modificar?</label>
            <select name="tipoModificacion" value={formData.tipoModificacion} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
              <option value="COSTO">Costo Base</option>
              <option value="MARGEN">Margen de Ganancia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aplicar como</label>
            <select name="signo" value={formData.signo} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
              <option value="AUMENTO">Aumento</option>
              <option value="DISMINUCION">Disminución</option>
            </select>
          </div>

          {/* Cómo modificar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cálculo</label>
            {formData.tipoModificacion === "MARGEN" ? (
              <div className="w-full border border-gray-200 rounded-md p-2 bg-gray-100 text-gray-600 text-sm flex items-center h-[42px]">
                Suma Puntos Porcentuales (%)
              </div>
            ) : (
              <select name="tipoCalculo" value={formData.tipoCalculo} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="PORCENTAJE">Porcentaje (%)</option>
                <option value="MONTO">Monto Fijo ($)</option>
              </select>
            )}
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
            <input type="number" step="0.01" name="valor" value={formData.valor} onChange={handleChange} placeholder="Ej: 15" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white" required />
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (Para auditoría)</label>
            <input type="text" name="motivo" value={formData.motivo} onChange={handleChange} placeholder="Ej: Ajuste por inflación" className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-white" required />
          </div>
        </div>

        <div className="border-t pt-4 mb-4">
          <h3 className="text-md font-semibold text-gray-700 mb-3">
            Alcance <span className="text-sm font-normal text-gray-500">(Dejar vacío para aplicar a todos los productos)</span>
          </h3>
          
          {loadingDatos ? (
            <div className="text-sm text-gray-500 py-2">Cargando filtros disponibles...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Línea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Línea</label>
                <select name="lineaId" value={formData.lineaId} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 text-sm">
                  <option value="">Todas</option>
                  {lineas.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.denominacion}</option>
                  ))}
                </select>
              </div>

              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                <select name="marcaId" value={formData.marcaId} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 text-sm">
                  <option value="">Todas</option>
                  {marcas.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.denominacion}</option>
                  ))}
                </select>
              </div>

              {/* Proveedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                <select name="proveedorId" value={formData.proveedorId} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 text-sm">
                  <option value="">Todos</option>
                  {proveedores.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.denominacion}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={loading || loadingDatos} className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 flex items-center justify-center min-w-[120px] font-medium">
            {loading ? "Procesando..." : "Actualizar Precios"}
          </button>
        </div>
      </form>
    </div>
  );
}