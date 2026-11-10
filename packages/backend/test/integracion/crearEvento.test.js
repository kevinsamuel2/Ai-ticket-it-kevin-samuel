import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: crear eventos", () => {
  let app;
  let usuarios;
  let comoUsuario;

  const enUnMes = () => {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + 1);
    return fecha.toISOString();
  };
  const nuevoEvento = () => ({
    nombre: "Ciclo de cine de terror",
    descripcion: "Proyección de clásicos del género con charla posterior",
    categoriaId: 6,
    fecha: enUnMes(),
    tiposEntrada: [
      { nombre: "General", precio: 5000, cupo: 40 },
      { nombre: "Combo con pochoclos", descripcion: "Entrada + pochoclos grandes", precio: 8000, cupo: 20 },
    ],
  });

  beforeEach(async () => {
    ({ app, usuarios, comoUsuario } = await crearAppConDatosDePrueba());
  });

  it("POST /eventos crea el evento con el usuario identificado como organizador", async () => {
    const res = await request(app).post("/eventos").set(comoUsuario(usuarios.nahuel)).send(nuevoEvento());

    expect(res.status).toBe(201);
    expect(res.headers.location).toBe(`/eventos/${res.body.id}`);
    expect(res.body).toMatchObject({
      nombre: "Ciclo de cine de terror",
      categoria: "Conferencias",
      precioMinimo: 5000,
      organizador: { id: usuarios.nahuel.id, nombreCompleto: "Nahuel Quiroga", puntaje: null, cantidadResenias: 0 },
    });
    expect(res.body.tiposEntrada).toHaveLength(2);

    const busqueda = await request(app).get("/eventos").query({ texto: "terror" });
    expect(busqueda.body.total).toBe(1);
  });

  it("POST /eventos sin identificarse responde 401", async () => {
    const res = await request(app).post("/eventos").send(nuevoEvento());

    expect(res.status).toBe(401);
  });

  it("POST /eventos con un tipo de entrada inválido responde 422 con el motivo", async () => {
    const evento = { ...nuevoEvento(), tiposEntrada: [{ nombre: "General", precio: 5000, cupo: -3 }] };

    const res = await request(app).post("/eventos").set(comoUsuario(usuarios.florencia)).send(evento);

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('El cupo de "General" debe ser un número entero mayor a 0');
  });

  it("POST /eventos con campos desconocidos responde 400", async () => {
    const conCampoExtra = { ...nuevoEvento(), organizadorId: 2 };
    const tipoConCampoExtra = { ...nuevoEvento(), tiposEntrada: [{ nombre: "G", precio: 1, cupo: 1, vendidas: 5 }] };

    const res = await request(app).post("/eventos").set(comoUsuario(usuarios.florencia)).send(conCampoExtra);
    const resTipo = await request(app).post("/eventos").set(comoUsuario(usuarios.florencia)).send(tipoConCampoExtra);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Campos no permitidos en la request: organizadorId");
    expect(resTipo.status).toBe(400);
    expect(resTipo.body.message).toBe("Campos no permitidos en la request: vendidas");
  });

  it("GET /usuarios/:id/eventos lista los eventos del organizador, incluidos los pasados", async () => {
    const res = await request(app).get(`/usuarios/${usuarios.florencia.id}/eventos`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
    expect(res.body[0]).toMatchObject({ nombre: "Ciro y Los Persas en Vorterix", yaSeRealizo: true });
    expect(res.body.every((e) => e.organizador.id === usuarios.florencia.id)).toBe(true);
  });
});
