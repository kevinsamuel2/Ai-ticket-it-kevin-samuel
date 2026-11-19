import { esCompraPasada } from "../../src/utils/compras";

const AHORA = new Date("2026-11-19T12:00:00");
const compra = (estado, fecha) => ({ estado, evento: { fecha } });

describe("esCompraPasada", () => {
  it("una compra confirmada de un evento futuro es próxima", () => {
    expect(esCompraPasada(compra("CONFIRMADA", "2026-12-01T21:00:00"), AHORA)).toBe(false);
  });

  it("una compra pendiente de pago de un evento futuro es próxima", () => {
    expect(esCompraPasada(compra("PENDIENTE", "2026-12-01T21:00:00"), AHORA)).toBe(false);
  });

  it.each(["UTILIZADA", "CANCELADA", "REEMBOLSADA"])(
    "una compra %s es pasada aunque el evento sea futuro",
    (estado) => {
      expect(esCompraPasada(compra(estado, "2026-12-01T21:00:00"), AHORA)).toBe(true);
    },
  );

  it("una compra de un evento que ya ocurrió es pasada", () => {
    expect(esCompraPasada(compra("CONFIRMADA", "2026-11-01T21:00:00"), AHORA)).toBe(true);
  });
});
