import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { mensajeDeError } from "../services/api";

// Lista paginada: carga la primera página al ganar foco (o cuando cambian los filtros) y cargarMas() trae
// la siguiente al llegar al final. `cargarPagina(page)` devuelve { items, page, totalPages } como la API.
// Si cambian los filtros mientras llega una página vieja, esa respuesta se descarta.
export function usePaginado(cargarPagina) {
  const [items, setItems] = useState(null);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState(null);
  const ultimaBusqueda = useRef(0);

  const recargar = useCallback(async () => {
    const busqueda = ++ultimaBusqueda.current;
    setCargando(true);
    setError(null);
    try {
      const resultado = await cargarPagina(1);
      if (busqueda !== ultimaBusqueda.current) return;
      setItems(resultado.items);
      setPagina(resultado.page);
      setTotalPaginas(resultado.totalPages);
    } catch (e) {
      if (busqueda === ultimaBusqueda.current) setError(mensajeDeError(e));
    } finally {
      if (busqueda === ultimaBusqueda.current) setCargando(false);
    }
  }, [cargarPagina]);

  const hayMas = pagina < totalPaginas;

  const cargarMas = useCallback(async () => {
    if (!hayMas || cargando || cargandoMas) return;
    const busqueda = ultimaBusqueda.current;
    setCargandoMas(true);
    try {
      const resultado = await cargarPagina(pagina + 1);
      if (busqueda !== ultimaBusqueda.current) return;
      setItems((anteriores) => [...anteriores, ...resultado.items]);
      setPagina(resultado.page);
      setTotalPaginas(resultado.totalPages);
    } catch (e) {
      if (busqueda === ultimaBusqueda.current) setError(mensajeDeError(e));
    } finally {
      setCargandoMas(false);
    }
  }, [hayMas, cargando, cargandoMas, cargarPagina, pagina]);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar]),
  );

  return { items, cargando, cargandoMas, hayMas, error, recargar, cargarMas };
}
