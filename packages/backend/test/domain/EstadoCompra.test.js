import { EstadoCompra, estadoCompraDesdeNombre } from "../../domain/EstadoCompra.js";
import { ConflictError } from "../../errors/ConflictError.js";
import { ValidationError } from "../../errors/ValidationError.js";

describe("Dominio: EstadoCompra", () => {
  const { PENDIENTE, CONFIRMADA, UTILIZADA, CANCELADA, REEMBOLSADA } = EstadoCompra;

  it("define las transiciones válidas entre estados", () => {
    expect(PENDIENTE.puedePasarA(CONFIRMADA)).toBe(true);
    expect(PENDIENTE.puedePasarA(CANCELADA)).toBe(true);
    expect(PENDIENTE.puedePasarA(UTILIZADA)).toBe(false);
    expect(CONFIRMADA.puedePasarA(UTILIZADA)).toBe(true);
    expect(CONFIRMADA.puedePasarA(REEMBOLSADA)).toBe(true);
    expect(CONFIRMADA.puedePasarA(PENDIENTE)).toBe(false);
  });

  it("UTILIZADA, CANCELADA y REEMBOLSADA son finales", () => {
    for (const estado of [UTILIZADA, CANCELADA, REEMBOLSADA]) {
      expect(estado.esFinal()).toBe(true);
      expect(estado.puedePasarA(PENDIENTE)).toBe(false);
    }
    expect(PENDIENTE.esFinal()).toBe(false);
  });

  it("cancelar una compra pendiente la deja CANCELADA y una confirmada la deja REEMBOLSADA", () => {
    expect(PENDIENTE.estadoAlCancelar()).toBe(CANCELADA);
    expect(CONFIRMADA.estadoAlCancelar()).toBe(REEMBOLSADA);
  });

  it("no se puede cancelar en un estado final", () => {
    expect(UTILIZADA.permiteCancelar()).toBe(false);
    expect(() => UTILIZADA.estadoAlCancelar()).toThrow("No se puede cancelar una compra en estado UTILIZADA");
    expect(() => CANCELADA.estadoAlCancelar()).toThrow(ConflictError);
  });

  it("solo CANCELADA y REEMBOLSADA liberan el cupo", () => {
    expect(Object.values(EstadoCompra).filter((e) => e.liberaCupo)).toEqual([CANCELADA, REEMBOLSADA]);
  });

  it("se serializa a JSON como su nombre", () => {
    expect(JSON.stringify({ estado: CONFIRMADA })).toBe('{"estado":"CONFIRMADA"}');
  });

  it("estadoCompraDesdeNombre busca sin distinguir mayúsculas y falla con un estado inexistente", () => {
    expect(estadoCompraDesdeNombre("confirmada")).toBe(CONFIRMADA);
    expect(() => estadoCompraDesdeNombre("PAGADA")).toThrow(
      'El estado "PAGADA" no existe. Estados válidos: PENDIENTE, CONFIRMADA, UTILIZADA, CANCELADA, REEMBOLSADA',
    );
    expect(() => estadoCompraDesdeNombre(undefined)).toThrow(ValidationError);
  });
});
