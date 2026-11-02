import { UsuarioRepository } from "../repository/Usuario.repository.js";
import { CategoriaRepository } from "../repository/Categoria.repository.js";
import { EventoRepository } from "../repository/Evento.repository.js";
import { CompraRepository } from "../repository/Compra.repository.js";
import { CuentaRepository } from "../repository/Cuenta.repository.js";
import { SesionRepository } from "../repository/Sesion.repository.js";

// Todos los repositorios de la aplicación (persistencia en memoria)
export function crearRepositorios() {
  return {
    usuarioRepository: new UsuarioRepository(),
    categoriaRepository: new CategoriaRepository(),
    eventoRepository: new EventoRepository(),
    compraRepository: new CompraRepository(),
    cuentaRepository: new CuentaRepository(),
    sesionRepository: new SesionRepository(),
  };
}
