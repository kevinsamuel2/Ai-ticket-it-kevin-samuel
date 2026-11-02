import {
  validarTextoNoVacio,
  validarEnteroPositivo,
  validarNumeroNoNegativo,
  validarFecha,
} from "../../domain/validaciones.js";
import { UnprocessableEntityError } from "../../errors/UnprocessableEntityError.js";

describe("Dominio: validaciones", () => {
  it("validarTextoNoVacio devuelve el texto sin espacios o lanza error", () => {
    expect(validarTextoNoVacio("  hola ", "error")).toBe("hola");
    expect(() => validarTextoNoVacio("   ", "vacío")).toThrow(UnprocessableEntityError);
    expect(() => validarTextoNoVacio(123, "no es texto")).toThrow("no es texto");
  });

  it("validarEnteroPositivo solo acepta enteros mayores a cero", () => {
    expect(validarEnteroPositivo(3, "error")).toBe(3);
    expect(() => validarEnteroPositivo(0, "cero")).toThrow("cero");
    expect(() => validarEnteroPositivo(1.5, "decimal")).toThrow("decimal");
    expect(() => validarEnteroPositivo("2", "texto")).toThrow("texto");
  });

  it("validarNumeroNoNegativo acepta cero y decimales pero no negativos", () => {
    expect(validarNumeroNoNegativo(0, "error")).toBe(0);
    expect(validarNumeroNoNegativo(1500.5, "error")).toBe(1500.5);
    expect(() => validarNumeroNoNegativo(-1, "negativo")).toThrow("negativo");
    expect(() => validarNumeroNoNegativo(Number.NaN, "nan")).toThrow("nan");
  });

  it("validarFecha convierte textos a Date y rechaza fechas inválidas", () => {
    expect(validarFecha("2026-12-01T21:00:00.000Z", "error").toISOString()).toBe("2026-12-01T21:00:00.000Z");
    const fecha = new Date();
    expect(validarFecha(fecha, "error")).toBe(fecha);
    expect(() => validarFecha("no-es-fecha", "inválida")).toThrow("inválida");
    expect(() => validarFecha(12345, "número")).toThrow("número");
    expect(() => validarFecha(undefined, "falta")).toThrow("falta");
  });
});
