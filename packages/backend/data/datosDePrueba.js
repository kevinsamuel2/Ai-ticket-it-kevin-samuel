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
  // Fotos reales de los eventos actuales (Wikimedia Commons, créditos en el README). Las sirve el backend en
  // /fotos y se guardan con ruta relativa: la app les agrega la dirección del servidor según la red.
  const fotoReal = (archivo) => `/fotos/${archivo}`;

  // --- Usuarios y sus cuentas (todas con la contraseña CONTRASENIA_DE_PRUEBA) ---
  const [florencia, gonzalo, nahuel, agustina, camila, ramiro] = await Promise.all(
    [
      { nombre: "Florencia", apellido: "Acosta", email: "florencia@aiticketit.com" },
      { nombre: "Gonzalo", apellido: "Pereyra", email: "gonzalo@aiticketit.com" },
      { nombre: "Nahuel", apellido: "Quiroga", email: "nahuel@aiticketit.com" },
      { nombre: "Agustina", apellido: "Benítez", email: "agustina@aiticketit.com" },
      { nombre: "Camila", apellido: "Ferreyra", email: "camila@aiticketit.com" },
      { nombre: "Ramiro", apellido: "Domínguez", email: "ramiro@aiticketit.com" },
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
  // Dónde se realiza cada evento (lugar y ciudad), por nombre del evento, para no repetirlo en cada alta
  const UBICACIONES = {
    "Divididos en Obras": { lugar: "Estadio Obras Sanitarias", ciudad: "Buenos Aires" },
    "Quilmes Rock": { lugar: "Tecnópolis", ciudad: "Buenos Aires" },
    "Escalandrum en Bebop Club": { lugar: "Bebop Club", ciudad: "Buenos Aires" },
    "Ferro vs. Obras - Liga Nacional": { lugar: "Estadio Héctor Etchart", ciudad: "Buenos Aires" },
    "Esperando la carroza": { lugar: "Multiteatro", ciudad: "Buenos Aires" },
    "Stand-up en Belushi": { lugar: "Belushi Bar", ciudad: "Buenos Aires" },
    Nerdearla: { lugar: "Ciudad Cultural Konex", ciudad: "Buenos Aires" },
    "Ciro y Los Persas en Vorterix": { lugar: "Teatro Vorterix", ciudad: "Buenos Aires" },
    "El método Grönholm": { lugar: "Teatro Picadero", ciudad: "Buenos Aires" },
    "Stand-up en La Tangente": { lugar: "La Tangente", ciudad: "Buenos Aires" },
    "Bad Bunny en River": { lugar: "Estadio Monumental", ciudad: "Buenos Aires" },
    "Párense de Manos IV": { lugar: "Estadio Ciudad de Vicente López", ciudad: "Vicente López" },
    "Copa Potrero": { lugar: "Complejo Deportivo Potrero", ciudad: "Buenos Aires" },
    "Lollapalooza Argentina": { lugar: "Hipódromo de San Isidro", ciudad: "San Isidro" },
    "Cosquín Rock": { lugar: "Aeroparque Ciudad de Santa María de Punilla", ciudad: "Córdoba" },
    "Superclásico: Boca vs. River": { lugar: "La Bombonera", ciudad: "Buenos Aires" },
    "Párense de Manos III": { lugar: "Estadio Ciudad de Vicente López", ciudad: "Vicente López" },
    "Copa Potrero: fase de grupos": { lugar: "Complejo Deportivo Potrero", ciudad: "Buenos Aires" },
    "Trueno en Movistar Arena": { lugar: "Movistar Arena", ciudad: "Buenos Aires" },
    "Nicki Nicole en el Luna Park": { lugar: "Luna Park", ciudad: "Buenos Aires" },
  };
  const crearEvento = (datos) => eventoRepository.guardar(new Evento({ ...UBICACIONES[datos.nombre], ...datos }));

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
    organizador: ramiro,
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

  // Eventos del momento, con fotos reales. Van al final para no mover los ids de los de arriba.
  await crearEvento({
    nombre: "Bad Bunny en River",
    descripcion: "Bad Bunny con la gira DeBÍ TiRAR MáS FOToS World Tour en el Estadio Monumental, en Núñez.",
    categoria: categorias.Recitales,
    fecha: enDias(45, 21),
    organizador: camila,
    multimedia: [fotoReal("bad-bunny.jpg"), fotoReal("river-monumental-escenario.jpg")],
    tiposEntrada: [
      { nombre: "Campo general", descripcion: "Campo de pie", precio: 175000, cupo: 400 },
      { nombre: "Stage A", descripcion: "Sector más cercano al escenario", precio: 420000, cupo: 40 },
    ],
  });
  await crearEvento({
    nombre: "Párense de Manos IV",
    descripcion:
      "Torneo de boxeo amateur de Luquita Rodríguez con streamers y famosos, en la cancha de Platense (estadio Ciudad de Vicente López).",
    categoria: categorias.Deportes,
    fecha: enDias(25, 19),
    organizador: ramiro,
    multimedia: [fotoReal("platense-ciudad-de-vicente-lopez.jpg"), fotoReal("platense-estadio.jpg")],
    tiposEntrada: [
      { nombre: "Campo General B", precio: 50000, cupo: 300 },
      { nombre: "VIP", descripcion: "Sector VIP cerca del ring", precio: 165000, cupo: 40 },
    ],
  });
  await crearEvento({
    nombre: "Copa Potrero",
    descripcion: "El torneo de fútbol 7 del Kun Agüero, con equipos de barrio y figuras del fútbol y la streaming.",
    categoria: categorias.Deportes,
    fecha: enDias(18, 15),
    organizador: ramiro,
    multimedia: [fotoReal("kun-aguero.jpg")],
    tiposEntrada: [
      { nombre: "General", precio: 8000, cupo: 500 },
      { nombre: "Palco", descripcion: "Sector techado junto a la cancha", precio: 25000, cupo: 60 },
    ],
  });
  await crearEvento({
    nombre: "Lollapalooza Argentina",
    descripcion: "Tres días de música en el Hipódromo de San Isidro, con artistas locales e internacionales.",
    categoria: categorias.Festivales,
    fecha: enDias(120, 12),
    organizador: camila,
    multimedia: [fotoReal("lollapalooza-2015.jpg"), fotoReal("lollapalooza-2025.jpg")],
    tiposEntrada: [
      { nombre: "Pase 1 día", precio: 120000, cupo: 600 },
      { nombre: "Pase 3 días", precio: 280000, cupo: 300 },
    ],
  });
  await crearEvento({
    nombre: "Cosquín Rock",
    descripcion: "El festival de rock más grande del país, en el Aeroparque Ciudad de Santa María de Punilla, Córdoba.",
    categoria: categorias.Festivales,
    fecha: enDias(95, 14),
    organizador: camila,
    multimedia: [fotoReal("cosquin-rock.jpg")],
    tiposEntrada: [
      { nombre: "Abono 1 día", precio: 90000, cupo: 400 },
      { nombre: "Abono 2 días", precio: 150000, cupo: 250 },
    ],
  });
  await crearEvento({
    nombre: "Superclásico: Boca vs. River",
    descripcion: "El clásico más grande del fútbol argentino, en La Bombonera.",
    categoria: categorias.Deportes,
    fecha: enDias(10, 17),
    organizador: ramiro,
    multimedia: [fotoReal("bombonera.jpg"), fotoReal("river-monumental.jpg")],
    tiposEntrada: [
      { nombre: "Popular", precio: 30000, cupo: 300 },
      { nombre: "Platea", precio: 90000, cupo: 100 },
    ],
  });

  // Eventos pasados de Camila y Ramiro: cada organizador tiene reseñas de lo que realmente organiza
  const parenseIII = await crearEvento({
    nombre: "Párense de Manos III",
    descripcion: "La tercera edición del torneo de boxeo amateur de Luquita Rodríguez, con streamers y famosos.",
    categoria: categorias.Deportes,
    fecha: enDias(-45, 19),
    organizador: ramiro,
    multimedia: [foto("1509563268479-0f004cf3f58b")],
    tiposEntrada: [{ nombre: "Campo General", precio: 40000, cupo: 300 }],
  });
  const copaFaseDeGrupos = await crearEvento({
    nombre: "Copa Potrero: fase de grupos",
    descripcion: "Primera jornada del torneo de fútbol 7 del Kun Agüero, con equipos de barrio contra figuras.",
    categoria: categorias.Deportes,
    fecha: enDias(-25, 15),
    organizador: ramiro,
    multimedia: [foto("1574629810360-7efbbe195018")],
    tiposEntrada: [{ nombre: "General", precio: 6000, cupo: 400 }],
  });
  const trueno = await crearEvento({
    nombre: "Trueno en Movistar Arena",
    descripcion: "Trueno presentando sus temas más escuchados en el Movistar Arena, en Villa Crespo.",
    categoria: categorias.Recitales,
    fecha: enDias(-50, 21),
    organizador: camila,
    multimedia: [foto("1459749411175-04bf5292ceea")],
    tiposEntrada: [{ nombre: "Campo", precio: 55000, cupo: 300 }],
  });
  const nicki = await crearEvento({
    nombre: "Nicki Nicole en el Luna Park",
    descripcion: "Nicki Nicole en una noche íntima en el Luna Park, con banda en vivo.",
    categoria: categorias.Recitales,
    fecha: enDias(-30, 21),
    organizador: camila,
    multimedia: [foto("1429962714451-bb934ecdc4ec")],
    tiposEntrada: [{ nombre: "General", precio: 45000, cupo: 200 }],
  });

  // --- Favoritos ---
  nahuel.agregarFavorito(quilmesRock);
  nahuel.agregarFavorito(escalandrum);
  agustina.agregarFavorito(carroza);

  // --- Organizadores que siguen los usuarios ---
  nahuel.seguir(florencia);
  nahuel.seguir(camila);
  agustina.seguir(gonzalo);
  gonzalo.seguir(ramiro);

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

  // Reseñas de Ramiro y Camila, escritas por compradores y por otros organizadores
  await usada(
    { comprador: nahuel, evento: parenseIII },
    {
      detalle: "Las peleas estuvieron buenísimas y el main event valió toda la noche. Lo malo, la salida: un caos.",
      puntuacion: 4.5,
    },
  );
  await usada(
    { comprador: gonzalo, evento: parenseIII, cantidad: 2 },
    {
      detalle: "Muy buena producción, con música en vivo entre pelea y pelea. Eso sí, arrancó casi una hora tarde.",
      puntuacion: 4,
    },
  );
  await usada(
    { comprador: agustina, evento: copaFaseDeGrupos },
    {
      detalle: "Ver a los equipos de barrio jugando contra ex jugadores fue lo mejor. Faltó sombra en las tribunas.",
      puntuacion: 4,
    },
  );
  await usada(
    { comprador: florencia, evento: copaFaseDeGrupos },
    { detalle: "Partidos parejos y mucho clima de barrio. Faltaron puestos de comida y de agua.", puntuacion: 3.5 },
  );
  await usada(
    { comprador: agustina, evento: trueno },
    { detalle: "El sonido impecable y Trueno tocó todos sus temas. Valió cada peso de la entrada.", puntuacion: 5 },
  );
  await usada(
    { comprador: gonzalo, evento: trueno },
    {
      detalle: "Se entraba rápido y desde la platea se veía perfecto. Lo único, la cerveza carísima.",
      puntuacion: 4.5,
    },
  );
  await usada(
    { comprador: nahuel, evento: nicki },
    {
      detalle: "Un show cuidado en cada detalle, se nota el laburo del equipo. El ingreso fue lento.",
      puntuacion: 4.5,
    },
  );
  await usada(
    { comprador: florencia, evento: nicki },
    { detalle: "Muy lindo recital, aunque el sonido en los costados del Luna Park estaba bajo.", puntuacion: 3.5 },
  );

  return { usuarios: { florencia, gonzalo, nahuel, agustina, camila, ramiro }, categorias };
}
