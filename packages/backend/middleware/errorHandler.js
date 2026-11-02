import { AppError } from "../errors/AppError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

// Se registra después de todas las rutas: cualquier request que llegue acá no matcheó ningún endpoint
export function rutaNoEncontrada(req, res, next) {
  next(new NotFoundError(`No existe el endpoint ${req.method} ${req.originalUrl}`));
}

// Middleware de errores de Express (4 parámetros). Traduce los errores de la aplicación a respuestas HTTP.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: err.status, message: err.message });
  }
  // JSON mal formado en el body (lo lanza express.json)
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ status: "fail", message: "El cuerpo de la request no es un JSON válido" });
  }

  console.error(err);
  return res.status(500).json({ status: "error", message: "Error interno del servidor" });
}
