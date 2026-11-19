// Filtros rápidos de fecha de la pantalla Eventos (como el filtro "Fecha" de Punch). Cada uno se traduce a un rango
// fechaDesde/fechaHasta que se manda al backend; el rango se arma acá porque depende de la zona horaria del celular.
export const FILTROS_DE_FECHA = [
  { valor: null, etiqueta: "Cualquier fecha" },
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "semana", etiqueta: "Esta semana" },
  { valor: "finde", etiqueta: "Este fin de semana" },
  { valor: "mes", etiqueta: "Este mes" },
];

const DOMINGO = 0;
const SABADO = 6;

const inicioDelDia = (fecha) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
const finDelDia = (fecha) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999);
const sumarDias = (fecha, dias) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);

// Cuántos días faltan para el próximo día de la semana pedido (0 si hoy ya es ese día)
const diasHasta = (fecha, diaDeLaSemana) => (diaDeLaSemana - fecha.getDay() + 7) % 7;

// Devuelve { fechaDesde, fechaHasta } en formato ISO, o {} si no hay filtro (cualquier fecha)
export function rangoDeFecha(clave, ahora = new Date()) {
  const hoy = inicioDelDia(ahora);
  let desde;
  let hasta;

  switch (clave) {
    case "hoy":
      [desde, hasta] = [hoy, finDelDia(hoy)];
      break;
    case "semana":
      // Hasta el domingo, que es el último día de la semana
      [desde, hasta] = [hoy, finDelDia(sumarDias(hoy, diasHasta(hoy, DOMINGO)))];
      break;
    case "finde": {
      // Sábado y domingo; si hoy ya es fin de semana, empieza hoy
      const sabado = sumarDias(hoy, hoy.getDay() === DOMINGO ? -1 : diasHasta(hoy, SABADO));
      desde = sabado < hoy ? hoy : sabado;
      hasta = finDelDia(sumarDias(sabado, 1));
      break;
    }
    case "mes":
      [desde, hasta] = [hoy, finDelDia(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0))];
      break;
    default:
      return {};
  }
  return { fechaDesde: desde.toISOString(), fechaHasta: hasta.toISOString() };
}
