import { UnprocessableEntityError } from "../errors/UnprocessableEntityError.js";

// Validaciones reutilizadas por las entidades del dominio, para no repetir la misma regla en cada clase

export function validarTextoNoVacio(valor, mensaje) {
  if (typeof valor !== "string" || !valor.trim()) {
    throw new UnprocessableEntityError(mensaje);
  }
  return valor.trim();
}

// Para los datos que no son obligatorios: si no se informan quedan en null, pero si se informan no pueden estar vacíos
export function validarTextoOpcional(valor, mensaje) {
  if (valor === undefined || valor === null) {
    return null;
  }
  return validarTextoNoVacio(valor, mensaje);
}

// Para comparar y buscar texto sin distinguir mayúsculas ni tildes ("Córdoba" == "cordoba")
export function normalizarTexto(valor) {
  return valor
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
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
