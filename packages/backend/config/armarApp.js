import { crearApp } from "../app.js";
import { crearMiddlewareIdentificacion } from "../middleware/identificacion.js";

import { UsuarioService } from "../services/Usuario.service.js";
import { CategoriaService } from "../services/Categoria.service.js";

import { UsuarioController } from "../controllers/Usuario.controller.js";
import { CategoriaController } from "../controllers/Categoria.controller.js";

import { crearUsuarioRouter } from "../routes/usuario.routes.js";
import { crearCategoriaRouter } from "../routes/categoria.routes.js";

// Arma la aplicación completa a partir de los repositorios: inyecta cada dependencia en la capa de arriba
// (repositorios -> services -> controllers -> routes). Lo usan index.js y los tests de integración.
export function armarApp({ usuarioRepository, categoriaRepository }) {
  // Services
  const usuarioService = new UsuarioService(usuarioRepository);
  const categoriaService = new CategoriaService(categoriaRepository);

  // Controllers
  const usuarioController = new UsuarioController(usuarioService);
  const categoriaController = new CategoriaController(categoriaService);

  return crearApp({
    middlewares: [crearMiddlewareIdentificacion(usuarioRepository)],
    rutas: {
      "/usuarios": crearUsuarioRouter(usuarioController),
      "/categorias": crearCategoriaRouter(categoriaController),
    },
  });
}
