import { armarApp, armarServices } from "../../config/armarApp.js";
import { crearRepositorios } from "../../config/repositorios.js";
import { cargarDatosDePrueba, CONTRASENIA_DE_PRUEBA } from "../../data/datosDePrueba.js";

// Cada test de integración arranca con repositorios nuevos cargados con los datos de prueba,
// así un test no se ve afectado por lo que modificó otro. Además inicia sesión con cada usuario
// de prueba: comoUsuario(usuario) devuelve el header Authorization para hacer requests en su nombre.
export async function crearAppConDatosDePrueba(ahora = new Date()) {
  const repositorios = crearRepositorios();
  const { usuarios } = await cargarDatosDePrueba(repositorios, ahora);
  const services = armarServices(repositorios);

  const tokens = new Map();
  for (const [nombre, usuario] of Object.entries(usuarios)) {
    const { token } = await services.authService.iniciarSesion(`${nombre}@aiticketit.com`, CONTRASENIA_DE_PRUEBA);
    tokens.set(usuario.id, token);
  }
  const comoUsuario = (usuario) => ({ Authorization: `Bearer ${tokens.get(usuario.id)}` });

  return { app: armarApp(repositorios, services), repositorios, usuarios, comoUsuario };
}
