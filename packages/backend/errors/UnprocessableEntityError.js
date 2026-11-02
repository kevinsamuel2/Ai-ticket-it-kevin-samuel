import { AppError } from "./AppError.js";

// La request está bien formada pero viola una regla de negocio del dominio
export class UnprocessableEntityError extends AppError {
  constructor(message = "La entidad no cumple con las reglas de negocio") {
    super(message, 422);
  }
}
