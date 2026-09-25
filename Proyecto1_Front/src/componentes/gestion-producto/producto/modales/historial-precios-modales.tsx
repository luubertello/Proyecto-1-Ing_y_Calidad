import { useEffect, useState } from "react";
import ProductoService from "../services/producto-service";
import { Producto } from "../../../../interfaces/gestion-producto/producto/interfaces-producto"; 

interface Props {
  producto: Producto;
  onClose: () => void;
}

export default function HistorialPreciosModal({ producto, onClose }: Props) {
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setLoading(true);
        const data = await ProductoService.obtenerHistorialPrecios(producto.id);
        setHistorial(data);
      } catch (error) {
        console.error("Error al cargar historial", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (producto?.id) {
      cargarHistorial();
    }
  }, [producto.id]);

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b">
        <h2 className="text-xl font-bold text-gray-800">
          Historial de Precios: {producto.denominacion}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl font-bold px-2"
        >
          &times;
        </button>
      </div>

      {/* Body */}
      <div className="p-5 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Cargando historial...</div>
        ) : historial.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Este producto aún no tiene modificaciones de precio.</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Anterior</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Nuevo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historial.map((registro) => (
                  <tr key={registro.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatearFecha(registro.fecha)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 line-through">{formatearMoneda(registro.precioAnterior)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">{formatearMoneda(registro.precioNuevo)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{registro.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t flex justify-end">
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}