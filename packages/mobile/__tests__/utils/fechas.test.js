import { FILTROS_DE_FECHA, rangoDeFecha } from "../../src/utils/fechas";
import { urlDelMapa } from "../../src/utils/mapa";

// Todas las fechas se arman en hora local, igual que el celular
const local = (anio, mes, dia, hora = 12) => new Date(anio, mes - 1, dia, hora, 0);
const dia = (iso) => {
  const fecha = new Date(iso);
  return [fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate(), fecha.getHours(), fecha.getMinutes()];
};

describe("rangoDeFecha", () => {
  // 2026-11-19 es jueves
  const jueves = local(2026, 11, 19);

  it("sin filtro no devuelve ningún rango", () => {
    expect(rangoDeFecha(null, jueves)).toEqual({});
    expect(rangoDeFecha("inexistente", jueves)).toEqual({});
  });

  it("hoy: desde el inicio hasta el final del día", () => {
    const { fechaDesde, fechaHasta } = rangoDeFecha("hoy", jueves);

    expect(dia(fechaDesde)).toEqual([2026, 11, 19, 0, 0]);
    expect(dia(fechaHasta)).toEqual([2026, 11, 19, 23, 59]);
  });

  it("esta semana: desde hoy hasta el domingo", () => {
    const { fechaDesde, fechaHasta } = rangoDeFecha("semana", jueves);

    expect(dia(fechaDesde)).toEqual([2026, 11, 19, 0, 0]);
    expect(dia(fechaHasta)).toEqual([2026, 11, 22, 23, 59]);
  });

  it("este fin de semana: sábado y domingo cuando todavía no llegó", () => {
    const { fechaDesde, fechaHasta } = rangoDeFecha("finde", jueves);

    expect(dia(fechaDesde)).toEqual([2026, 11, 21, 0, 0]);
    expect(dia(fechaHasta)).toEqual([2026, 11, 22, 23, 59]);
  });

  it("este fin de semana: empieza hoy si hoy ya es sábado o domingo", () => {
    const sabado = rangoDeFecha("finde", local(2026, 11, 21));
    const domingo = rangoDeFecha("finde", local(2026, 11, 22));

    expect(dia(sabado.fechaDesde)).toEqual([2026, 11, 21, 0, 0]);
    expect(dia(sabado.fechaHasta)).toEqual([2026, 11, 22, 23, 59]);
    expect(dia(domingo.fechaDesde)).toEqual([2026, 11, 22, 0, 0]);
    expect(dia(domingo.fechaHasta)).toEqual([2026, 11, 22, 23, 59]);
  });

  it("esta semana el domingo es solo hoy", () => {
    const { fechaDesde, fechaHasta } = rangoDeFecha("semana", local(2026, 11, 22));

    expect(dia(fechaDesde)).toEqual([2026, 11, 22, 0, 0]);
    expect(dia(fechaHasta)).toEqual([2026, 11, 22, 23, 59]);
  });

  it("este mes: desde hoy hasta el último día del mes", () => {
    const { fechaDesde, fechaHasta } = rangoDeFecha("mes", jueves);

    expect(dia(fechaDesde)).toEqual([2026, 11, 19, 0, 0]);
    expect(dia(fechaHasta)).toEqual([2026, 11, 30, 23, 59]);
  });

  it("este mes en febrero termina el 28 (o el 29 si es bisiesto)", () => {
    expect(dia(rangoDeFecha("mes", local(2027, 2, 10)).fechaHasta)).toEqual([2027, 2, 28, 23, 59]);
    expect(dia(rangoDeFecha("mes", local(2028, 2, 10)).fechaHasta)).toEqual([2028, 2, 29, 23, 59]);
  });

  it("todos los filtros del selector tienen un rango (menos 'cualquier fecha')", () => {
    const conRango = FILTROS_DE_FECHA.filter(({ valor }) => Object.keys(rangoDeFecha(valor, jueves)).length === 2);

    expect(conRango.map(({ valor }) => valor)).toEqual(["hoy", "semana", "finde", "mes"]);
  });
});

describe("urlDelMapa", () => {
  it("arma la búsqueda con el lugar y la ciudad codificados", () => {
    expect(urlDelMapa({ lugar: "Estadio Obras", ciudad: "Buenos Aires" })).toBe(
      "https://www.google.com/maps/search/?api=1&query=Estadio%20Obras%2C%20Buenos%20Aires",
    );
  });

  it("funciona con el lugar solo", () => {
    expect(urlDelMapa({ lugar: "Teatro Colón", ciudad: null })).toBe(
      "https://www.google.com/maps/search/?api=1&query=Teatro%20Col%C3%B3n",
    );
  });
});
