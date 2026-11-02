// Formateo de datos para mostrar (el backend manda números y fechas ISO)

export function formatearPrecio(precio) {
  if (precio === 0) return "Gratis";
  return `$${Math.round(precio).toLocaleString("es-AR")}`;
}

const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const dosDigitos = (numero) => String(numero).padStart(2, "0");

// "vie 12 dic · 21:00"
export function formatearFecha(fechaIso) {
  const fecha = new Date(fechaIso);
  const hora = `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
  return `${DIAS[fecha.getDay()]} ${fecha.getDate()} ${MESES[fecha.getMonth()]} · ${hora}`;
}

// "12/12/2026 21:00"
export function formatearFechaCompleta(fechaIso) {
  const fecha = new Date(fechaIso);
  return (
    `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()} ` +
    `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`
  );
}

export function textoDiasRestantes(dias) {
  if (dias === 0) return "¡Es hoy!";
  if (dias === 1) return "Falta 1 día";
  return `Faltan ${dias} días`;
}

export function formatearPuntaje(puntaje) {
  return puntaje === null || puntaje === undefined ? "Sin reseñas" : puntaje.toFixed(1);
}
