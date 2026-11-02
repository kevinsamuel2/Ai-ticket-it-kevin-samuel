import { crearApp } from "../app.js";
import { crearMiddlewareIdentificacion } from "../middleware/identificacion.js";

import { UsuarioService } from "../services/Usuario.service.js";
import { CategoriaService } from "../services/Categoria.service.js";
import { EventoService } from "../services/Evento.service.js";
import { CompraService } from "../services/Compra.service.js";

import { UsuarioController } from "../controllers/Usuario.controller.js";
import { CategoriaController } from "../controllers/Categoria.controller.js";
import { EventoController } from "../controllers/Evento.controller.js";
import { CompraController } from "../controllers/Compra.controller.js";

import { crearUsuarioRouter } from "../routes/usuario.routes.js";
import { crearCategoriaRouter } from "../routes/categoria.routes.js";
import { crearEventoRouter, crearOrganizadorRouter } from "../routes/evento.routes.js";
import { crearCompraRouter, crearComprasDeEventoRouter } from "../routes/compra.routes.js";

// Services a partir de los repositorios. Se arma aparte porque además de la API los usan los cron jobs.
export function armarServices({ usuarioRepository, categoriaRepository, eventoRepository, compraRepository }) {
  return {
    usuarioService: new UsuarioService(usuarioRepository),
    categoriaService: new CategoriaService(categoriaRepository),
    eventoService: new EventoService({ eventoRepository, compraRepository, categoriaRepository, usuarioRepository }),
    compraService: new CompraService({ compraRepository, eventoRepository }),
  };
}

// Arma la aplicación completa a partir de los repositorios: inyecta cada dependencia en la capa de arriba
// (repositorios -> services -> controllers -> routes). Lo usan index.js y los tests de integración.
export function armarApp(repositorios, services = armarServices(repositorios)) {
  const { usuarioService, categoriaService, eventoService, compraService } = services;

  // Controllers
  const usuarioController = new UsuarioController(usuarioService);
  const categoriaController = new CategoriaController(categoriaService);
  const eventoController = new EventoController(eventoService);
  const compraController = new CompraController(compraService);

  return crearApp({
    middlewares: [crearMiddlewareIdentificacion(repositorios.usuarioRepository)],
    rutas: {
      "/usuarios/:usuarioId": crearOrganizadorRouter(eventoController),
      "/usuarios": crearUsuarioRouter(usuarioController),
      "/categorias": crearCategoriaRouter(categoriaController),
      "/eventos/:eventoId/compras": crearComprasDeEventoRouter(compraController),
      "/eventos": crearEventoRouter(eventoController),
      "/compras": crearCompraRouter(compraController),
    },
  });
}
