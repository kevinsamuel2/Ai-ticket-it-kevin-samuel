// Validaciones de formularios del lado de la app. El backend vuelve a validar todo: estas son para
// darle feedback inmediato al usuario sin esperar la respuesta del servidor.

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarLogin({ email, contrasenia }) {
  const errores = {};
  if (!email.trim()) errores.email = "Ingresá tu email";
  else if (!FORMATO_EMAIL.test(email.trim())) errores.email = "El email no tiene un formato válido";
  if (!contrasenia) errores.contrasenia = "Ingresá tu contraseña";
  return errores;
}

export const hayErrores = (errores) => Object.keys(errores).length > 0;
