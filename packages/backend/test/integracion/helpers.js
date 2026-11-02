import { armarApp } from "../../config/armarApp.js";
import { cargarDatosDePrueba } from "../../data/datosDePrueba.js";
import { UsuarioRepository } from "../../repository/Usuario.repository.js";
import { CategoriaRepository } from "../../repository/Categoria.repository.js";
import { EventoRepository } from "../../repository/Evento.repository.js";
import { CompraRepository } from "../../repository/Compra.repository.js";

// Cada test de integración arranca con repositorios nuevos cargados con los datos de prueba,
// así un test no se ve afectado por lo que modificó otro
export async function crearAppConDatosDePrueba(ahora = new Date()) {
  const repositorios = {
    usuarioRepository: new UsuarioRepository(),
    categoriaRepository: new CategoriaRepository(),
    eventoRepository: new EventoRepository(),
    compraRepository: new CompraRepository(),
  };
  const { usuarios } = await cargarDatosDePrueba(repositorios, ahora);
  return { app: armarApp(repositorios), repositorios, usuarios };
}
