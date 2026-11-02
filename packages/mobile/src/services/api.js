import axios from "axios";
import { API_URL } from "../config";

// Única instancia de axios para toda la app: la URL base, el timeout y el token se configuran
// en un solo lugar en vez de repetirse en cada llamada
export const api = axios.create({ baseURL: API_URL, timeout: 10000 });

let tokenActual = null;
let alExpirarLaSesion = () => {};

export function establecerToken(token) {
  tokenActual = token;
}

export function alExpirarSesion(callback) {
  alExpirarLaSesion = callback;
}

// El backend identifica al usuario por el token que devolvió el login
api.interceptors.request.use((config) => {
  if (tokenActual) {
    config.headers.Authorization = `Bearer ${tokenActual}`;
  }
  return config;
});

// Si el backend responde 401 con una sesión abierta (ej: se reinició el servidor y se perdieron las sesiones
// en memoria), se cierra la sesión en la app para volver al login
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401 && tokenActual) {
      alExpirarLaSesion();
    }
    return Promise.reject(error);
  },
);

// Traduce cualquier error de axios a un texto para mostrarle al usuario
export function mensajeDeError(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.request) {
    return `No se pudo conectar con el servidor (${API_URL}). Revisá que el backend esté levantado.`;
  }
  return error?.message ?? "Ocurrió un error inesperado";
}
