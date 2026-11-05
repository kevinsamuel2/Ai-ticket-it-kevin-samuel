import { UnauthorizedError } from "../errors/UnauthorizedError.js";

// Identificación del usuario: la app manda el token que recibió al iniciar sesión en el header
// "Authorization: Bearer <token>". Si es válido, se deja el usuario en req.usuario para que los
// services apliquen los permisos (ej: solo el organizador ve las ventas de su evento).
// Si el token es inválido o expiró no se corta la request acá: las rutas públicas (ej: buscar eventos)
// tienen que seguir funcionando, y es requerirUsuario el que responde 401 en las rutas protegidas.
export function crearMiddlewareIdentificacion(authService) {
  return async function identificarUsuario(req, res, next) {
    req.usuario = null;
    req.token = null;
    req.motivoSesionInvalida = null;
    const autorizacion = req.get("Authorization");
    if (autorizacion !== undefined) {
      const [tipo, token] = autorizacion.split(" ");
      if (tipo !== "Bearer" || !token) {
        req.motivoSesionInvalida = 'El header Authorization debe tener el formato "Bearer <token>"';
      } else {
        try {
          req.usuario = await authService.usuarioDeLaSesion(token);
          req.token = token;
        } catch (error) {
          if (!(error instanceof UnauthorizedError)) throw error;
          req.motivoSesionInvalida = error.message;
        }
      }
    }
    next();
  };
}

// Para las rutas que no se pueden usar sin iniciar sesión
export function requerirUsuario(req, res, next) {
  if (!req.usuario) {
    throw new UnauthorizedError(req.motivoSesionInvalida ?? "Tenés que iniciar sesión para realizar esta operación");
  }
  next();
}
