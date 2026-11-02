import { UnauthorizedError } from "../errors/UnauthorizedError.js";

export const HEADER_USUARIO = "x-usuario-id";

// Identificación simple de usuarios: la app manda el id del usuario elegido en el header X-Usuario-Id.
// No hay contraseñas porque el TP no pide autenticación; lo importante es que el backend sepa quién hace
// cada operación para aplicar los permisos (ej: solo el organizador ve las ventas de su evento).
export function crearMiddlewareIdentificacion(usuarioRepository) {
  return async function identificarUsuario(req, res, next) {
    req.usuario = null;
    const usuarioId = req.get(HEADER_USUARIO);
    if (usuarioId !== undefined) {
      req.usuario = await usuarioRepository.buscarPorId(usuarioId);
      if (!req.usuario) {
        throw new UnauthorizedError(`No existe un usuario con id ${usuarioId}`);
      }
    }
    next();
  };
}

// Para las rutas que no se pueden usar sin identificarse
export function requerirUsuario(req, res, next) {
  if (!req.usuario) {
    throw new UnauthorizedError();
  }
  next();
}
