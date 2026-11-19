// Ícono de cada categoría para los chips (como en la app de Punch, que lleva un ícono junto al nombre)
const ICONOS = {
  Recitales: "musical-notes-outline",
  Teatro: "film-outline",
  "Stand-up": "mic-outline",
  Deportes: "football-outline",
  Festivales: "sparkles-outline",
  Conferencias: "people-outline",
};

export function iconoDeCategoria(nombre) {
  return ICONOS[nombre] ?? "pricetag-outline";
}
