import { api } from "./api";

// Solo se mandan los filtros con valor, para no ensuciar la query string
export async function buscarEventos({ texto, categoria, orden, direccion } = {}) {
  const params = Object.fromEntries(
    Object.entries({ texto, categoria, orden, direccion, limit: 50 }).filter(([, valor]) => valor),
  );
  const { data } = await api.get("/eventos", { params });
  return data;
}

export async function obtenerEvento(eventoId) {
  const { data } = await api.get(`/eventos/${eventoId}`);
  return data;
}

export async function crearEvento(evento) {
  const { data } = await api.post("/eventos", evento);
  return data;
}

export async function listarCategorias() {
  const { data } = await api.get("/categorias");
  return data;
}

export async function obtenerVentasDeEvento(eventoId, estado) {
  const { data } = await api.get(`/eventos/${eventoId}/compras`, { params: estado ? { estado } : {} });
  return data;
}
