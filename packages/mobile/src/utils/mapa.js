// "Cómo llegar": abre la búsqueda del lugar en el mapa del celular (Google Maps, que también abre en el navegador)
export function urlDelMapa({ lugar, ciudad }) {
  const consulta = [lugar, ciudad].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}
