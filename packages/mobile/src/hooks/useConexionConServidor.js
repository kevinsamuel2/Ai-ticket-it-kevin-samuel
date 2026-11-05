import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import { API_URL } from "../config";

const DURACION_MINIMA_MS = 900;
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

// Al abrir la app se verifica que el backend responda (GET /health). La pantalla de carga se muestra
// un mínimo de tiempo para que no "parpadee", y si el servidor no responde se informa con opción de reintentar.
export function useConexionConServidor() {
  const [estado, setEstado] = useState({ verificando: true, error: null });

  const verificar = useCallback(async () => {
    setEstado({ verificando: true, error: null });
    try {
      await Promise.all([api.get("/health"), esperar(DURACION_MINIMA_MS)]);
      setEstado({ verificando: false, error: null });
    } catch {
      setEstado({
        verificando: false,
        error: `No pudimos conectarnos con el servidor (${API_URL}). Revisá que el backend esté levantado y que el celular esté en la misma red Wi-Fi.`,
      });
    }
  }, []);

  useEffect(() => {
    verificar();
  }, [verificar]);

  return { ...estado, reintentar: verificar };
}
