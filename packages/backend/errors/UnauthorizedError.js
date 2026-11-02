import { AppError } from "./AppError.js";

// No se pudo identificar al usuario que hace la request
export class UnauthorizedError extends AppError {
  constructor(message = "Tenés que identificarte para realizar esta operación") {
    super(message, 401);
  }
}
