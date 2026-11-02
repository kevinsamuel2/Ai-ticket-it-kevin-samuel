import { AppError } from "./AppError.js";

// La operación no se puede hacer por el estado actual del recurso (ej: cancelar una compra ya utilizada)
export class ConflictError extends AppError {
  constructor(message = "La operación entra en conflicto con el estado actual del recurso") {
    super(message, 409);
  }
}
