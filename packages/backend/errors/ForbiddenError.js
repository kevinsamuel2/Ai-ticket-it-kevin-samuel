import { AppError } from "./AppError.js";

// El usuario está identificado pero no tiene permiso sobre el recurso (ej: ver las ventas de un evento ajeno)
export class ForbiddenError extends AppError {
  constructor(message = "No tenés permiso para realizar esta operación") {
    super(message, 403);
  }
}
