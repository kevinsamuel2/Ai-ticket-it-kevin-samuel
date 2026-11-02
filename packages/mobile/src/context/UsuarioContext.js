import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { alExpirarSesion, establecerToken } from "../services/api";
import * as sesionesService from "../services/sesiones.service";

// Estado global de la sesión. Con Context cualquier pantalla lee el usuario con useUsuario()
// sin tener que pasarlo por props de componente en componente
const UsuarioContext = createContext(null);

export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  const iniciarSesion = useCallback(async (email, contrasenia) => {
    const { token, usuario: usuarioLogueado } = await sesionesService.iniciarSesion(email, contrasenia);
    establecerToken(token);
    setUsuario(usuarioLogueado);
  }, []);

  const olvidarSesion = useCallback(() => {
    establecerToken(null);
    setUsuario(null);
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await sesionesService.cerrarSesion();
    } finally {
      // Aunque falle el request (ej: sin conexión), en la app la sesión se cierra igual
      olvidarSesion();
    }
  }, [olvidarSesion]);

  useEffect(() => {
    alExpirarSesion(olvidarSesion);
  }, [olvidarSesion]);

  const valor = useMemo(() => ({ usuario, iniciarSesion, cerrarSesion }), [usuario, iniciarSesion, cerrarSesion]);

  return <UsuarioContext.Provider value={valor}>{children}</UsuarioContext.Provider>;
}

export function useUsuario() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) {
    throw new Error("useUsuario se tiene que usar dentro de un UsuarioProvider");
  }
  return contexto;
}
