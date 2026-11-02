import { api } from "./api";

export async function listarUsuarios() {
  const { data } = await api.get("/usuarios");
  return data;
}

export async function obtenerReputacion(usuarioId) {
  const { data } = await api.get(`/usuarios/${usuarioId}/resenias`);
  return data;
}

export async function listarEventosDeOrganizador(usuarioId) {
  const { data } = await api.get(`/usuarios/${usuarioId}/eventos`);
  return data;
}
