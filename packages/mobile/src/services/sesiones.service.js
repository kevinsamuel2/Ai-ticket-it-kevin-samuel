import { api } from "./api";

export async function iniciarSesion(email, contrasenia) {
  const { data } = await api.post("/sesiones", { email, contrasenia });
  return data;
}

export async function cerrarSesion() {
  await api.delete("/sesiones/actual");
}
