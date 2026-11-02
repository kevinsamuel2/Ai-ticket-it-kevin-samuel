import { crearApp } from "../app.js";
import { crearMiddlewareIdentificacion } from "../middleware/identificacion.js";

import { UsuarioService } from "../services/Usuario.service.js";
import { CategoriaService } from "../services/Categoria.service.js";
import { EventoService } from "../services/Evento.service.js";

import { UsuarioController } from "../controllers/Usuario.controller.js";
import { CategoriaController } from "../controllers/Categoria.controller.js";
import { EventoController } from "../controllers/Evento.controller.js";

import { crearUsuarioRouter } from "../routes/usuario.routes.js";
import { crearCategoriaRouter } from "../routes/categoria.routes.js";
import { crearEventoRouter } from "../routes/evento.routes.js";

// Arma la aplicación completa a partir de los repositorios: inyecta cada dependencia en la capa de arriba
// (repositorios -> services -> controllers -> routes). Lo usan index.js y los tests de integración.
export function armarApp({ usuarioRepository, categoriaRepository, eventoRepository, compraRepository }) {
  // Services
  const usuarioService = new UsuarioService(usuarioRepository);
  const categoriaService = new CategoriaService(categoriaRepository);
  const eventoService = new EventoService(eventoRepository, compraRepository);

  // Controllers
  const usuarioController = new UsuarioController(usuarioService);
  const categoriaController = new CategoriaController(categoriaService);
  const eventoController = new EventoController(eventoService);

  return crearApp({
    middlewares: [crearMiddlewareIdentificacion(usuarioRepository)],
    rutas: {
      "/usuarios": crearUsuarioRouter(usuarioController),
      "/categorias": crearCategoriaRouter(categoriaController),
      "/eventos": crearEventoRouter(eventoController),
    },
  });
}
