import { formatearFecha, formatearPrecio, formatearPuntaje, textoDiasRestantes } from "../../src/utils/formato";

describe("formato", () => {
  it("formatearPrecio muestra pesos sin decimales y 'Gratis' para precio 0", () => {
    expect(formatearPrecio(25000)).toBe("$25.000");
    expect(formatearPrecio(0)).toBe("Gratis");
  });

  it("formatearFecha muestra día de la semana, día, mes y hora", () => {
    expect(formatearFecha(new Date(2026, 11, 5, 21, 0).toISOString())).toBe("sáb 5 dic · 21:00");
  });

  it("textoDiasRestantes distingue hoy, 1 día y varios días", () => {
    expect(textoDiasRestantes(0)).toBe("¡Es hoy!");
    expect(textoDiasRestantes(1)).toBe("Falta 1 día");
    expect(textoDiasRestantes(12)).toBe("Faltan 12 días");
  });

  it("formatearPuntaje muestra un decimal o 'Sin reseñas'", () => {
    expect(formatearPuntaje(4)).toBe("4.0");
    expect(formatearPuntaje(null)).toBe("Sin reseñas");
  });
});
