import "dotenv/config";
import { armarApp } from "./config/armarApp.js";
import { cargarDatosDePrueba } from "./data/datosDePrueba.js";

import { UsuarioRepository } from "./repository/Usuario.repository.js";
import { CategoriaRepository } from "./repository/Categoria.repository.js";
import { EventoRepository } from "./repository/Evento.repository.js";
import { CompraRepository } from "./repository/Compra.repository.js";

// Repositorios (persistencia en memoria)
const repositorios = {
  usuarioRepository: new UsuarioRepository(),
  categoriaRepository: new CategoriaRepository(),
  eventoRepository: new EventoRepository(),
  compraRepository: new CompraRepository(),
};
await cargarDatosDePrueba(repositorios);

const app = armarApp(repositorios);

// 0.0.0.0 para que el celular (Expo Go) pueda llegar al backend por la IP de la red local
const PORT = process.env.SERVER_PORT || process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
