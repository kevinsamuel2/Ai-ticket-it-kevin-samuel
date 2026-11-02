import { api } from "./api";

export async function comprar({ eventoId, tipoEntradaId, cantidad }) {
  const { data } = await api.post("/compras", { eventoId, tipoEntradaId, cantidad });
  return data;
}

export async function listarMisCompras(estado) {
  const { data } = await api.get("/compras", { params: estado ? { estado } : {} });
  return data;
}

export async function obtenerCompra(compraId) {
  const { data } = await api.get(`/compras/${compraId}`);
  return data;
}

// estado: CONFIRMADA (pagar), CANCELADA (cancelar) o UTILIZADA (el organizador valida la entrada)
export async function cambiarEstado(compraId, estado) {
  const { data } = await api.post(`/compras/${compraId}/cambios-de-estado`, { estado });
  return data;
}

export async function reseniar(compraId, { detalle, puntuacion }) {
  const { data } = await api.post(`/compras/${compraId}/resenia`, { detalle, puntuacion });
  return data;
}

export async function listarMensajes(compraId) {
  const { data } = await api.get(`/compras/${compraId}/mensajes`);
  return data;
}

export async function enviarMensaje(compraId, mensaje) {
  const { data } = await api.post(`/compras/${compraId}/mensajes`, { mensaje });
  return data;
}
