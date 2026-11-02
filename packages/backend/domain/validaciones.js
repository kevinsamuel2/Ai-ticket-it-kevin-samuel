import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";

// Validaciones reutilizadas por las entidades del dominio, para no repetir la misma regla en cada clase

export function validarTextoNoVacio(valor, mensaje) {
  if (typeof valor !== "string" || !valor.trim()) {
    throw new UnprocessableEntityError(mensaje);
  }
  return valor.trim();
}

export function validarEnteroPositivo(valor, mensaje) {
  if (!Number.isInteger(valor) || valor <= 0) {
    throw new UnprocessableEntityError(mensaje);
  }
  return valor;
}

export function validarNumeroNoNegativo(valor, mensaje) {
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor < 0) {
    throw new UnprocessableEntityError(mensaje);
  }
  return valor;
}

// Acepta un Date o un texto con fecha (como llega en el JSON) y devuelve siempre un Date
export function validarFecha(valor, mensaje) {
  const fecha = valor instanceof Date ? valor : new Date(valor);
  if ((!(valor instanceof Date) && typeof valor !== "string") || Number.isNaN(fecha.getTime())) {
    throw new UnprocessableEntityError(mensaje);
  }
  return fecha;
}
