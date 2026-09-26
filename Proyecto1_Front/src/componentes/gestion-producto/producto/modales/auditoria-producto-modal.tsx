import { useEffect, useState } from "react";
import { Clock, Edit3, Info, Plus, Shield, Trash2, User } from "lucide-react";
import ProductoService from "../services/producto-service";
import { Producto } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";
import { Auditoria } from "../../../../interfaces/generales/interfaces-generales";
import { Badge } from "../../../ui/Badge";
import { jwtDecode } from "jwt-decode";
import UsuarioService from "../../../gestion-usuario/usuario-service";

type Tab = "general" | "precios" | "stock";

interface Props {
  producto: Producto;
  auditoria: Auditoria;
  onClose: () => void;
}

export default function AuditoriaProductoModal({ producto, auditoria, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("general");

  const [historialPrecios, setHistorialPrecios] = useState<any[]>([]);
  const [movimientosStock, setMovimientosStock] = useState<any[]>([]);
  const [loadingPrecios, setLoadingPrecios] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false);

  // ===== Datos para la pestaña General (rol, igual que InformacionAuditoria) =====
  const token = localStorage.getItem("Token");
  const rolId = token ? jwtDecode<{ rolId: number }>(token).rolId : 0;
  const [rol, setRol] = useState<string>("");

  useEffect(() => {
    const fetchRol = async () => {
      try {
        const roleResponse = await UsuarioService.obtenerRol(rolId);
        setRol(roleResponse?.data?.denominacion || "Desconocido");
      } catch (err) {
        console.error("Error al obtener rol:", err);
      }
    };
    fetchRol();
  }, []);

  useEffect(() => {
    if (!producto?.id) return;

    if (tab === "precios" && historialPrecios.length === 0) {
      setLoadingPrecios(true);
      ProductoService.obtenerHistorialPrecios(producto.id)
        .then(setHistorialPrecios)
        .catch((error) => console.error("Error al cargar historial de precios", error))
        .finally(() => setLoadingPrecios(false));
    }

    if (tab === "stock" && movimientosStock.length === 0) {
      setLoadingStock(true);
      ProductoService.obtenerMovimientosStock(producto.id)
        .then(setMovimientosStock)
        .catch((error) => console.error("Error al cargar movimientos de stock", error))
        .finally(() => setLoadingStock(false));
    }
  }, [tab, producto?.id]);

  const formatearMoneda = (valor: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(valor);

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getActionBadge = (type: "created" | "updated" | "deleted") => {
    const configs = {
      created: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: Plus },
      updated: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Edit3 },
      deleted: { color: "bg-red-100 text-red-800 border-red-200", icon: Trash2 },
    };
    const config = configs[type];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1 px-2 py-1`}>
        <Icon size={12} />
        {type === "created" ? "Creado" : type === "updated" ? "Actualizado" : "Eliminado"}
      </Badge>
    );
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "precios", label: "Precios" },
    { id: "stock", label: "Stock" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-slate-900 to-slate-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Shield size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Auditoría: {producto.denominacion}</h2>
            {auditoria?.detalle && <p className="text-slate-300 text-xs mt-0.5">{auditoria.detalle}</p>}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 shrink-0"
        >
          &times;
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="p-5 overflow-y-auto">
        {/* ============ GENERAL ============ */}
        {tab === "general" && (
          <div className="space-y-4">
            {rol === "Root" && auditoria?.id && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <Info size={16} />
                  <span className="font-medium">ID del Registro:</span>
                  <code className="bg-amber-100 px-2 py-1 rounded text-sm font-mono">{auditoria.id}</code>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">{getActionBadge("created")}</div>
                  <span className="text-sm text-slate-600">{auditoria?.createdAt}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <User size={14} />
                  <span className="text-sm font-medium">{auditoria?.usuarioCreated}</span>
                </div>
              </div>

              {auditoria?.updatedAt && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">{getActionBadge("updated")}</div>
                    <span className="text-sm text-slate-600">{auditoria.updatedAt}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <User size={14} />
                    <span className="text-sm font-medium">{auditoria.usuarioUpdated || "No especificado"}</span>
                  </div>
                </div>
              )}

              {auditoria?.deletedAt && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">{getActionBadge("deleted")}</div>
                    <span className="text-sm text-slate-600">{auditoria.deletedAt}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <User size={14} />
                    <span className="text-sm font-medium">{auditoria.usuarioDeleted || "No especificado"}</span>
                  </div>
                </div>
              )}
            </div>

            {!auditoria?.updatedAt && !auditoria?.deletedAt && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                <Clock size={24} className="mx-auto text-slate-400 mb-2" />
                <p className="text-slate-600 text-sm">Este registro no ha sido modificado desde su creación</p>
              </div>
            )}
          </div>
        )}

        {/* ============ PRECIOS ============ */}
        {tab === "precios" && (
          loadingPrecios ? (
            <div className="text-center text-gray-500 py-8">Cargando historial de precios...</div>
          ) : historialPrecios.length === 0 ? (
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
                  {historialPrecios.map((registro) => (
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
          )
        )}

        {/* ============ STOCK ============ */}
        {tab === "stock" && (
          loadingStock ? (
            <div className="text-center text-gray-500 py-8">Cargando movimientos de stock...</div>
          ) : movimientosStock.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Este producto aún no tiene movimientos de stock registrados.</div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movimientosStock.map((registro) => (
                    <tr key={registro.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatearFecha(registro.fecha)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{registro.tipoMovimiento}</td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                          registro.cantidad >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {registro.cantidad >= 0 ? "+" : ""}
                        {registro.cantidad}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{registro.motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t flex justify-end">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  );
}