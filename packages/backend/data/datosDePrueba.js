import { Usuario } from "../domain/Usuario.js";
import { Categoria } from "../domain/Categoria.js";
import { Evento } from "../domain/Evento.js";
import { Compra } from "../domain/Compra.js";
import { Cuenta } from "../domain/Cuenta.js";

export const CONTRASENIA_DE_PRUEBA = "ticket123";

// Datos iniciales para usar la app sin tener que cargar todo a mano. Como la persistencia es en memoria,
// se cargan cada vez que levanta el servidor. Las fechas son relativas a "ahora" para que siempre haya
// eventos próximos (para comprar) y eventos pasados (con entradas utilizadas y reseñas).
export async function cargarDatosDePrueba(
  { usuarioRepository, categoriaRepository, eventoRepository, compraRepository, cuentaRepository },
  ahora = new Date(),
) {
  const enDias = (dias, hora = 21, minutos = 0) => {
    const fecha = new Date(ahora);
    fecha.setDate(fecha.getDate() + dias);
    fecha.setHours(hora, minutos, 0, 0);
    return fecha;
  };
  const imagen = (nombre) => `https://picsum.photos/seed/${nombre}/800/450`;

  // --- Usuarios y sus cuentas (todas con la contraseña CONTRASENIA_DE_PRUEBA) ---
  const [lucia, martin, juan, sofia] = await Promise.all(
    [
      { nombre: "Lucía", apellido: "Fernández", email: "lucia@aiticketit.com" },
      { nombre: "Martín", apellido: "Sosa", email: "martin@aiticketit.com" },
      { nombre: "Juan", apellido: "Gómez", email: "juan@aiticketit.com" },
      { nombre: "Sofía", apellido: "Ramírez", email: "sofia@aiticketit.com" },
    ].map(async ({ nombre, apellido, email }) => {
      const usuario = await usuarioRepository.guardar(new Usuario({ nombre, apellido }));
      await cuentaRepository.guardar(new Cuenta({ email, contrasenia: CONTRASENIA_DE_PRUEBA, usuario }));
      return usuario;
    }),
  );

  // --- Categorías ---
  const categorias = {};
  for (const [nombre, descripcion] of [
    ["Recitales", "Música en vivo"],
    ["Teatro", "Obras y espectáculos teatrales"],
    ["Stand-up", "Comedia en vivo"],
    ["Deportes", "Partidos y competencias"],
    ["Festivales", "Eventos de varios días con múltiples artistas"],
    ["Conferencias", "Charlas, talleres y congresos"],
  ]) {
    categorias[nombre] = await categoriaRepository.guardar(new Categoria({ nombre, descripcion }));
  }

  // --- Eventos ---
  const crearEvento = (datos) => eventoRepository.guardar(new Evento(datos));

  const nocheDeRock = await crearEvento({
    nombre: "Noche de Rock Nacional",
    descripcion: "Las mejores bandas del rock argentino en una sola noche, en el Estadio Obras.",
    categoria: categorias.Recitales,
    fecha: enDias(12, 21),
    organizador: lucia,
    multimedia: [imagen("rock")],
    tiposEntrada: [
      { nombre: "General", descripcion: "Campo general de pie", precio: 25000, cupo: 200 },
      { nombre: "Campo VIP", descripcion: "Sector delantero con barra exclusiva", precio: 60000, cupo: 30 },
    ],
  });
  const festival = await crearEvento({
    nombre: "Festival Primavera Sonora",
    descripcion: "Dos días de música indie, electrónica y pop con más de 20 artistas en Costanera Sur.",
    categoria: categorias.Festivales,
    fecha: enDias(30, 16),
    organizador: lucia,
    multimedia: [imagen("festival"), imagen("escenario")],
    tiposEntrada: [
      { nombre: "Abono 1 día", precio: 45000, cupo: 500 },
      { nombre: "Abono 2 días", precio: 80000, cupo: 300 },
    ],
  });
  const jazz = await crearEvento({
    nombre: "Jazz en el Bosque",
    descripcion: "Concierto de jazz al aire libre en los Bosques de Palermo. Traé tu manta.",
    categoria: categorias.Recitales,
    fecha: enDias(5, 20),
    organizador: lucia,
    multimedia: [imagen("jazz")],
    tiposEntrada: [
      { nombre: "General", precio: 15000, cupo: 80 },
      { nombre: "Mesa preferencial", descripcion: "Mesa para 2 frente al escenario", precio: 30000, cupo: 3 },
    ],
  });
  await crearEvento({
    nombre: "Clásico de básquet: Ferro vs Obras",
    descripcion: "Partido por la Liga Nacional en el estadio Héctor Etchart.",
    categoria: categorias.Deportes,
    fecha: enDias(15, 19),
    organizador: lucia,
    multimedia: [imagen("basquet")],
    tiposEntrada: [
      { nombre: "Popular", precio: 9000, cupo: 400 },
      { nombre: "Platea", precio: 20000, cupo: 150 },
    ],
  });
  const hamlet = await crearEvento({
    nombre: "Hamlet",
    descripcion: "El clásico de Shakespeare en una puesta moderna en el Teatro San Martín.",
    categoria: categorias.Teatro,
    fecha: enDias(8, 20, 30),
    organizador: martin,
    multimedia: [imagen("hamlet")],
    tiposEntrada: [
      { nombre: "Platea", precio: 22000, cupo: 120 },
      { nombre: "Pullman", precio: 16000, cupo: 80 },
    ],
  });
  const risas = await crearEvento({
    nombre: "Stand-up: Risas de Medianoche",
    descripcion: "Cuatro comediantes, una noche. Show para mayores de 18 en Palermo.",
    categoria: categorias["Stand-up"],
    fecha: enDias(3, 23),
    organizador: martin,
    multimedia: [imagen("standup")],
    tiposEntrada: [{ nombre: "General", precio: 12000, cupo: 60 }],
  });
  await crearEvento({
    nombre: "Conferencia: IA en el desarrollo de software",
    descripcion: "Charla abierta sobre herramientas de IA aplicadas al desarrollo, con casos reales.",
    categoria: categorias.Conferencias,
    fecha: enDias(20, 18),
    organizador: martin,
    multimedia: [imagen("conferencia")],
    tiposEntrada: [
      { nombre: "General", descripcion: "Entrada libre y gratuita", precio: 0, cupo: 150 },
      { nombre: "Con certificado", precio: 8000, cupo: 50 },
    ],
  });

  // Eventos que ya pasaron: sirven para mostrar entradas utilizadas y reseñas
  const tributoSoda = await crearEvento({
    nombre: "Tributo a Soda Stereo",
    descripcion: "Banda tributo con el show completo de 'Me verás volver'.",
    categoria: categorias.Recitales,
    fecha: enDias(-20, 21),
    organizador: lucia,
    multimedia: [imagen("soda")],
    tiposEntrada: [{ nombre: "General", precio: 18000, cupo: 300 }],
  });
  const bernarda = await crearEvento({
    nombre: "La Casa de Bernarda Alba",
    descripcion: "La obra de García Lorca, con un elenco íntegramente femenino.",
    categoria: categorias.Teatro,
    fecha: enDias(-10, 20),
    organizador: martin,
    multimedia: [imagen("bernarda")],
    tiposEntrada: [{ nombre: "Platea", precio: 20000, cupo: 100 }],
  });
  const standupOtonio = await crearEvento({
    nombre: "Stand-up: Edición Otoño",
    descripcion: "La edición de otoño del ciclo de comedia.",
    categoria: categorias["Stand-up"],
    fecha: enDias(-40, 23),
    organizador: martin,
    multimedia: [imagen("otonio")],
    tiposEntrada: [{ nombre: "General", precio: 10000, cupo: 60 }],
  });

  // --- Favoritos ---
  juan.agregarFavorito(festival);
  juan.agregarFavorito(jazz);
  sofia.agregarFavorito(hamlet);

  // --- Compras en distintos estados ---
  const UN_DIA = 24 * 60 * 60 * 1000;
  // La compra se hace unos días antes del evento, o ahora si esa fecha todavía no llegó
  const comprar = ({ comprador, evento, tipo = 1, cantidad = 1, diasAntes = 7 }) => {
    const fechaCompra = new Date(Math.min(evento.fecha.getTime() - diasAntes * UN_DIA, ahora.getTime()));
    return new Compra({ comprador, evento, tipoEntrada: evento.buscarTipoEntrada(tipo), cantidad }, fechaCompra);
  };
  // Compra de un evento pasado: se pagó, se usó en la puerta y (opcionalmente) se reseñó al día siguiente
  const usada = (datos, resenia) => {
    const compra = comprar({ ...datos, diasAntes: 15 });
    compra.confirmarPago(datos.comprador, compra.fechaCompra);
    compra.marcarComoUtilizada(datos.evento.organizador, datos.evento.fecha);
    if (resenia) compra.reseniar(resenia, new Date(datos.evento.fecha.getTime() + UN_DIA));
    return compraRepository.guardar(compra);
  };

  // Juan
  const juanRock = comprar({ comprador: juan, evento: nocheDeRock, cantidad: 2 });
  juanRock.confirmarPago(juan, ahora);
  juanRock.enviarMensaje(juan, "Hola! ¿Hasta qué hora se puede ingresar al estadio?", ahora);
  juanRock.enviarMensaje(lucia, "¡Hola Juan! Las puertas abren a las 19 y se puede ingresar hasta las 21:30.", ahora);
  await compraRepository.guardar(juanRock);

  await compraRepository.guardar(comprar({ comprador: juan, evento: hamlet }));

  const juanRisas = comprar({ comprador: juan, evento: risas, cantidad: 2 });
  juanRisas.confirmarPago(juan, ahora);
  juanRisas.cancelar(juan, ahora);
  await compraRepository.guardar(juanRisas);

  await usada(
    { comprador: juan, evento: tributoSoda, cantidad: 2 },
    { detalle: "Increíble, sonaba igual que Soda. La organización impecable.", puntuacion: 5 },
  );
  // Sin reseña todavía: Juan la puede dejar desde la app
  await usada({ comprador: juan, evento: bernarda });

  // Sofía
  const sofiaRock = comprar({ comprador: sofia, evento: nocheDeRock, tipo: 2 });
  await compraRepository.guardar(sofiaRock);

  const sofiaHamlet = comprar({ comprador: sofia, evento: hamlet, tipo: 2, cantidad: 2 });
  sofiaHamlet.confirmarPago(sofia, ahora);
  await compraRepository.guardar(sofiaHamlet);

  await usada(
    { comprador: sofia, evento: tributoSoda },
    { detalle: "Muy buen show, aunque hubo mucha fila para entrar.", puntuacion: 4 },
  );
  await usada(
    { comprador: sofia, evento: bernarda },
    { detalle: "Actuaciones memorables. Volvería a ver una obra de este organizador.", puntuacion: 4.5 },
  );
  await usada(
    { comprador: sofia, evento: standupOtonio, cantidad: 2 },
    { detalle: "Algunos comediantes muy buenos, otros flojos.", puntuacion: 3 },
  );

  return { usuarios: { lucia, martin, juan, sofia }, categorias };
}
