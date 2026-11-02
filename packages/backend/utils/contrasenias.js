import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Las contraseñas nunca se guardan en texto plano: se guarda "sal:hash" calculado con scrypt.
// La sal aleatoria hace que dos contraseñas iguales tengan hashes distintos.
const LARGO_HASH = 64;

export function hashearContrasenia(contrasenia) {
  const sal = randomBytes(16).toString("hex");
  const hash = scryptSync(contrasenia, sal, LARGO_HASH).toString("hex");
  return `${sal}:${hash}`;
}

// timingSafeEqual compara en tiempo constante, para no dar pistas por cuánto tarda la comparación
export function verificarContrasenia(contrasenia, hashGuardado) {
  const [sal, hash] = hashGuardado.split(":");
  const hashIngresado = scryptSync(contrasenia, sal, LARGO_HASH);
  return timingSafeEqual(hashIngresado, Buffer.from(hash, "hex"));
}
