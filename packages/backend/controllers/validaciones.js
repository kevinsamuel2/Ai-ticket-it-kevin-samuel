import { ValidationError } from "../errors/ValidationError.js";

// Validaciones de lo que llega en la request (body y query string). Son responsabilidad del controller:
// traducen el formato HTTP al que esperan los services, antes de llegar al dominio.

// Rechaza bodies que no sean un objeto o que traigan campos fuera de la lista permitida
export function validarCamposPermitidos(body, camposPermitidos) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("El cuerpo de la request es inválido");
  }
  const camposNoPermitidos = Object.keys(body).filter((campo) => !camposPermitidos.includes(campo));
  if (camposNoPermitidos.length > 0) {
    throw new ValidationError(`Campos no permitidos en la request: ${camposNoPermitidos.join(", ")}`);
  }
}

export function validarCamposRequeridos(body, camposRequeridos) {
  const faltantes = camposRequeridos.filter((campo) => body[campo] === undefined || body[campo] === null);
  if (faltantes.length > 0) {
    throw new ValidationError(`Faltan campos obligatorios: ${faltantes.join(", ")}`);
  }
}

export function parsearEnteroPositivo(valor, nombreParametro, valorPorDefecto) {
  if (valor === undefined) return valorPorDefecto;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ValidationError(`El parámetro ${nombreParametro} debe ser un entero positivo`);
  }
  return numero;
}

export function parsearNumeroNoNegativo(valor, nombreParametro) {
  if (valor === undefined) return undefined;
  const numero = Number(valor);
  if (valor === "" || !Number.isFinite(numero) || numero < 0) {
    throw new ValidationError(`El parámetro ${nombreParametro} debe ser un número mayor o igual a 0`);
  }
  return numero;
}

export function parsearOpcion(valor, nombreParametro, opcionesValidas, valorPorDefecto) {
  if (valor === undefined) return valorPorDefecto;
  if (!opcionesValidas.includes(valor)) {
    throw new ValidationError(`El parámetro ${nombreParametro} debe ser uno de: ${opcionesValidas.join(", ")}`);
  }
  return valor;
}

export function parsearBooleano(valor, nombreParametro, valorPorDefecto) {
  if (valor === undefined) return valorPorDefecto;
  if (valor !== "true" && valor !== "false") {
    throw new ValidationError(`El parámetro ${nombreParametro} debe ser true o false`);
  }
  return valor === "true";
}
