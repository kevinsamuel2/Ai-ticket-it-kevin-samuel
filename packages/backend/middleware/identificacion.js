import { UnauthorizedError } from "../errors/UnauthorizedError.js";

// Identificación del usuario: la app manda el token que recibió al iniciar sesión en el header
// "Authorization: Bearer <token>". Si viene, se deja el usuario en req.usuario para que los
// services apliquen los permisos (ej: solo el organizador ve las ventas de su evento).
export function crearMiddlewareIdentificacion(authService) {
  return async function identificarUsuario(req, res, next) {
    req.usuario = null;
    req.token = null;
    const autorizacion = req.get("Authorization");
    if (autorizacion !== undefined) {
      const [tipo, token] = autorizacion.split(" ");
      if (tipo !== "Bearer" || !token) {
        throw new UnauthorizedError('El header Authorization debe tener el formato "Bearer <token>"');
      }
      req.usuario = await authService.usuarioDeLaSesion(token);
      req.token = token;
    }
    next();
  };
}

// Para las rutas que no se pueden usar sin iniciar sesión
export function requerirUsuario(req, res, next) {
  if (!req.usuario) {
    throw new UnauthorizedError("Tenés que iniciar sesión para realizar esta operación");
  }
  next();
}
