import { AppError } from "./AppError.js";

// La request está mal formada (campos faltantes, tipos inválidos, parámetros de query incorrectos)
export class ValidationError extends AppError {
  constructor(message = "Datos de validación inválidos") {
    super(message, 400);
  }
}
