import { API_URL } from "../config";

// Las imágenes de ejemplo las sirve el backend y se guardan con la ruta relativa ("/fotos/bad-bunny.jpg"),
// porque la IP del backend cambia según la red. Las que cargó un usuario son URLs completas y quedan como están.
export function urlDeImagen(url) {
  return url?.startsWith("/") ? `${API_URL}${url}` : url;
}
