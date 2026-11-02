import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { mensajeDeError } from "../services/api";

// Carga datos del backend cada vez que la pantalla gana foco (así, al volver de otra pantalla
// donde se compró o canceló algo, la información está actualizada) y expone cargando/error.
// Si llegan respuestas fuera de orden (ej: el usuario tipea rápido en el buscador), solo se usa
// la de la última llamada: las anteriores se descartan.
export function useCarga(cargar) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const ultimaLlamada = useRef(0);

  const recargar = useCallback(async () => {
    const llamada = ++ultimaLlamada.current;
    setCargando(true);
    setError(null);
    try {
      const resultado = await cargar();
      if (llamada === ultimaLlamada.current) setDatos(resultado);
    } catch (e) {
      if (llamada === ultimaLlamada.current) setError(mensajeDeError(e));
    } finally {
      if (llamada === ultimaLlamada.current) setCargando(false);
    }
  }, [cargar]);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar]),
  );

  return { datos, cargando, error, recargar };
}
