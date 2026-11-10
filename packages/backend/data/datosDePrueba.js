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
  // Fotos de Unsplash recortadas a 16:9
  const foto = (id) => `https://images.unsplash.com/photo-${id}?w=800&h=450&fit=crop&q=80`;

  // --- Usuarios y sus cuentas (todas con la contraseña CONTRASENIA_DE_PRUEBA) ---
  const [florencia, gonzalo, nahuel, agustina] = await Promise.all(
    [
      { nombre: "Florencia", apellido: "Acosta", email: "florencia@aiticketit.com" },
      { nombre: "Gonzalo", apellido: "Pereyra", email: "gonzalo@aiticketit.com" },
      { nombre: "Nahuel", apellido: "Quiroga", email: "nahuel@aiticketit.com" },
      { nombre: "Agustina", apellido: "Benítez", email: "agustina@aiticketit.com" },
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

  const divididos = await crearEvento({
    nombre: "Divididos en Obras",
    descripcion: "Divididos vuelve al estadio de Obras Sanitarias con un show de casi tres horas.",
    categoria: categorias.Recitales,
    fecha: enDias(12, 21),
    organizador: florencia,
    multimedia: [foto("1524368535928-5b5e00ddc76b"), foto("1605340406960-f5b496c38b3d")],
    tiposEntrada: [
      { nombre: "General", descripcion: "Campo general de pie", precio: 25000, cupo: 200 },
      { nombre: "Campo VIP", descripcion: "Sector delantero con barra exclusiva", precio: 60000, cupo: 30 },
    ],
  });
  const quilmesRock = await crearEvento({
    nombre: "Quilmes Rock",
    descripcion: "Dos días con más de 20 bandas en Tecnópolis. Se puede ir un solo día o a los dos.",
    categoria: categorias.Festivales,
    fecha: enDias(30, 16),
    organizador: florencia,
    multimedia: [
      foto("1533174072545-7a4b6ad7a6c3"),
      foto("1506157786151-b8491531f063"),
      foto("1470229722913-7c0e2dbbafd3"),
    ],
    tiposEntrada: [
      { nombre: "Abono 1 día", precio: 45000, cupo: 500 },
      { nombre: "Abono 2 días", precio: 80000, cupo: 300 },
    ],
  });
  const escalandrum = await crearEvento({
    nombre: "Escalandrum en Bebop Club",
    descripcion: "El sexteto de Pipi Piazzolla presenta su último disco en Bebop Club, Palermo.",
    categoria: categorias.Recitales,
    fecha: enDias(5, 20),
    organizador: florencia,
    multimedia: [foto("1415201364774-f6f0bb35f28f"), foto("1511192336575-5a79af67a629")],
    tiposEntrada: [
      { nombre: "General", precio: 15000, cupo: 80 },
      { nombre: "Mesa preferencial", descripcion: "Mesa para 2 frente al escenario", precio: 30000, cupo: 3 },
    ],
  });
  await crearEvento({
    nombre: "Ferro vs. Obras - Liga Nacional",
    descripcion: "Partido por la Liga Nacional de básquet en el estadio Héctor Etchart, Caballito.",
    categoria: categorias.Deportes,
    fecha: enDias(15, 19),
    organizador: florencia,
    multimedia: [foto("1504450758481-7338eba7524a"), foto("1563506644863-444710df1e03")],
    tiposEntrada: [
      { nombre: "Popular", precio: 9000, cupo: 400 },
      { nombre: "Platea", precio: 20000, cupo: 150 },
    ],
  });
  const carroza = await crearEvento({
    nombre: "Esperando la carroza",
    descripcion: "La comedia de Jacobo Langsner, en el Multiteatro de Av. Corrientes.",
    categoria: categorias.Teatro,
    fecha: enDias(8, 20, 30),
    organizador: gonzalo,
    multimedia: [foto("1503095396549-807759245b35"), foto("1514306191717-452ec28c7814")],
    tiposEntrada: [
      { nombre: "Platea", precio: 22000, cupo: 120 },
      { nombre: "Pullman", precio: 16000, cupo: 80 },
    ],
  });
  const belushi = await crearEvento({
    nombre: "Stand-up en Belushi",
    descripcion: "Cuatro comediantes en una noche. Solo para mayores de 18.",
    categoria: categorias["Stand-up"],
    fecha: enDias(3, 23),
    organizador: gonzalo,
    multimedia: [foto("1580188928585-0ef5c1a5c4dd"), foto("1527224857830-43a7acc85260")],
    tiposEntrada: [{ nombre: "General", precio: 12000, cupo: 60 }],
  });
  await crearEvento({
    nombre: "Nerdearla",
    descripcion: "Charlas de desarrollo, infraestructura y ciencia de datos en Ciudad Cultural Konex.",
    categoria: categorias.Conferencias,
    fecha: enDias(20, 18),
    organizador: gonzalo,
    multimedia: [foto("1540575467063-178a50c2df87"), foto("1505373877841-8d25f7d46678")],
    tiposEntrada: [
      { nombre: "General", descripcion: "Entrada libre y gratuita", precio: 0, cupo: 150 },
      { nombre: "Con certificado", precio: 8000, cupo: 50 },
    ],
  });

  // Eventos que ya pasaron: sirven para mostrar entradas utilizadas y reseñas
  const ciro = await crearEvento({
    nombre: "Ciro y Los Persas en Vorterix",
    descripcion: "Ciro y Los Persas en el Teatro Vorterix, con varios temas de Los Piojos.",
    categoria: categorias.Recitales,
    fecha: enDias(-20, 21),
    organizador: florencia,
    multimedia: [foto("1540039155733-5bb30b53aa14")],
    tiposEntrada: [{ nombre: "General", precio: 18000, cupo: 300 }],
  });
  const gronholm = await crearEvento({
    nombre: "El método Grönholm",
    descripcion: "Cuatro candidatos, una entrevista de trabajo y un juego cada vez más incómodo.",
    categoria: categorias.Teatro,
    fecha: enDias(-10, 20),
    organizador: gonzalo,
    multimedia: [foto("1558970439-add78fc68990")],
    tiposEntrada: [{ nombre: "Platea", precio: 20000, cupo: 100 }],
  });
  const tangente = await crearEvento({
    nombre: "Stand-up en La Tangente",
    descripcion: "El ciclo de stand-up de los jueves en La Tangente, Palermo.",
    categoria: categorias["Stand-up"],
    fecha: enDias(-40, 23),
    organizador: gonzalo,
    multimedia: [foto("1683304554869-8a871c913096")],
    tiposEntrada: [{ nombre: "General", precio: 10000, cupo: 60 }],
  });

  // --- Favoritos ---
  nahuel.agregarFavorito(quilmesRock);
  nahuel.agregarFavorito(escalandrum);
  agustina.agregarFavorito(carroza);

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

  // Nahuel
  const nahuelDivididos = comprar({ comprador: nahuel, evento: divididos, cantidad: 2 });
  nahuelDivididos.confirmarPago(nahuel, ahora);
  nahuelDivididos.enviarMensaje(nahuel, "Hola, ¿hasta qué hora se puede entrar?", ahora);
  nahuelDivididos.enviarMensaje(florencia, "Hola Nahuel! Abren a las 19 y se puede entrar hasta las 21:30.", ahora);
  await compraRepository.guardar(nahuelDivididos);

  await compraRepository.guardar(comprar({ comprador: nahuel, evento: carroza }));

  const nahuelBelushi = comprar({ comprador: nahuel, evento: belushi, cantidad: 2 });
  nahuelBelushi.confirmarPago(nahuel, ahora);
  nahuelBelushi.cancelar(nahuel, ahora);
  await compraRepository.guardar(nahuelBelushi);

  await usada(
    { comprador: nahuel, evento: ciro, cantidad: 2 },
    { detalle: "Tremendo show, tocaron casi tres horas. Muy bien organizado.", puntuacion: 5 },
  );
  // Sin reseña todavía: Nahuel la puede dejar desde la app
  await usada({ comprador: nahuel, evento: gronholm });

  // Agustina
  const agustinaDivididos = comprar({ comprador: agustina, evento: divididos, tipo: 2 });
  await compraRepository.guardar(agustinaDivididos);

  const agustinaCarroza = comprar({ comprador: agustina, evento: carroza, tipo: 2, cantidad: 2 });
  agustinaCarroza.confirmarPago(agustina, ahora);
  await compraRepository.guardar(agustinaCarroza);

  await usada(
    { comprador: agustina, evento: ciro },
    { detalle: "Buen show, pero la fila para entrar daba la vuelta a la manzana.", puntuacion: 4 },
  );
  await usada(
    { comprador: agustina, evento: gronholm },
    { detalle: "Los cuatro actores están muy bien, te tiene atrapada toda la obra.", puntuacion: 4.5 },
  );
  await usada(
    { comprador: agustina, evento: tangente, cantidad: 2 },
    { detalle: "Dos de los comediantes muy buenos, los otros bastante flojos.", puntuacion: 3 },
  );

  return { usuarios: { florencia, gonzalo, nahuel, agustina }, categorias };
}
