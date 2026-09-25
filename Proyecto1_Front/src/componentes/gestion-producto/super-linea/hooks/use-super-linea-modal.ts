import { useState } from "react";
import { SuperLinea } from "../interfaces/interfaces-super-linea";
import { Auditoria } from "../../../../interfaces/generales/interfaces-generales";

export type SuperLineaModalTipo = "alta" | "edicion" | "auditoria" | null;

export function useSuperLineaModal() {
  const [tipo, setTipo] = useState<SuperLineaModalTipo>(null);
  const [superLinea, setSuperLinea] = useState<SuperLinea | null>(null);
  const [auditoria, setAuditoria] = useState<Auditoria | null>(null);

  const abrirAlta = () => {
    setSuperLinea(null);
    setAuditoria(null);
    setTipo("alta");
  };

  const abrirEdicion = (superLinea: SuperLinea) => {
    setSuperLinea(superLinea);
    setAuditoria(null);
    setTipo("edicion");
  };

  const abrirAuditoria = (auditoria: Auditoria) => {
    setAuditoria(auditoria);
    setSuperLinea(null);
    setTipo("auditoria");
  };

  const cerrar = () => {
    setTipo(null);
    setSuperLinea(null);
    setAuditoria(null);
  };

  return { tipo, superLinea, auditoria, abrirAlta, abrirEdicion, abrirAuditoria, cerrar };
}