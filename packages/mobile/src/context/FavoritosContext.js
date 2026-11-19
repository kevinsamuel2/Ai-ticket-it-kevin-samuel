import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { agregarFavorito, listarFavoritos, quitarFavorito } from "../services/eventos.service";
import { mensajeDeError } from "../services/api";
import { useAvisos } from "./AvisosContext";
import { useUsuario } from "./UsuarioContext";

// Ids de los eventos guardados por el usuario. Se cargan al iniciar sesión y así cualquier tarjeta o pantalla puede
// mostrar el marcador lleno o vacío y guardar/quitar un evento al instante, sin pedir la lista de favoritos cada vez
const FavoritosContext = createContext(null);

export function FavoritosProvider({ children }) {
  const { usuario } = useUsuario();
  const { mostrarError, mostrarExito } = useAvisos();
  const [ids, setIds] = useState(() => new Set());
  const idsActuales = useRef(ids);
  idsActuales.current = ids;

  useEffect(() => {
    if (!usuario) {
      setIds(new Set());
      return undefined;
    }
    let vigente = true;
    listarFavoritos()
      .then((favoritos) => vigente && setIds(new Set(favoritos.map((evento) => evento.id))))
      .catch(() => {
        // Sin la lista inicial los marcadores arrancan vacíos; guardar un evento igual funciona
      });
    return () => {
      vigente = false;
    };
  }, [usuario]);

  const cambiar = useCallback((eventoId, guardado) => {
    setIds((anteriores) => {
      const nuevos = new Set(anteriores);
      if (guardado) nuevos.add(eventoId);
      else nuevos.delete(eventoId);
      return nuevos;
    });
  }, []);

  // Se actualiza el marcador antes de que responda el backend y, si falla, se deshace y se avisa
  const alternar = useCallback(
    async (eventoId) => {
      const guardar = !idsActuales.current.has(eventoId);
      cambiar(eventoId, guardar);
      try {
        await (guardar ? agregarFavorito(eventoId) : quitarFavorito(eventoId));
        mostrarExito(guardar ? "Guardado en tus favoritos" : "Quitado de tus favoritos");
      } catch (e) {
        cambiar(eventoId, !guardar);
        mostrarError(mensajeDeError(e));
      }
    },
    [cambiar, mostrarError, mostrarExito],
  );

  const valor = useMemo(() => ({ ids, alternar }), [ids, alternar]);

  return <FavoritosContext.Provider value={valor}>{children}</FavoritosContext.Provider>;
}

export function useFavoritos() {
  const contexto = useContext(FavoritosContext);
  if (!contexto) {
    throw new Error("useFavoritos se tiene que usar dentro de un FavoritosProvider");
  }
  return contexto;
}
