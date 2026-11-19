import { api } from "./api";

// Organizadores que sigue el usuario (con su puntaje y cantidad de seguidores)
export async function listarSeguidos() {
  const { data } = await api.get("/seguidos");
  return data;
}

export async function seguirOrganizador(organizadorId) {
  await api.put(`/seguidos/${organizadorId}`);
}

export async function dejarDeSeguirOrganizador(organizadorId) {
  await api.delete(`/seguidos/${organizadorId}`);
}
