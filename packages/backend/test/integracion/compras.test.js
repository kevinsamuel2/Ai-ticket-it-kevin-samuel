import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: comprar entradas y consultar compras", () => {
  let app;
  let usuarios;
  let comoUsuario;
  let repositorios;

  // Jazz en el Bosque (id 3) tiene una "Mesa preferencial" (tipo 2) con solo 3 lugares
  const JAZZ = 3;
  const MESA = 2;

  beforeEach(async () => {
    ({ app, usuarios, repositorios, comoUsuario } = await crearAppConDatosDePrueba());
  });

  it("POST /compras crea una compra pendiente y descuenta el cupo del evento", async () => {
    const res = await request(app)
      .post("/compras")
      .set(comoUsuario(usuarios.sofia))
      .send({ eventoId: JAZZ, tipoEntradaId: MESA, cantidad: 2 });

    expect(res.status).toBe(201);
    expect(res.headers.location).toBe(`/compras/${res.body.id}`);
    expect(res.body).toMatchObject({ estado: "PENDIENTE", cantidad: 2, total: 60000 });

    const evento = await request(app).get(`/eventos/${JAZZ}`);
    expect(evento.body.tiposEntrada[1]).toMatchObject({ nombre: "Mesa preferencial", disponibles: 1 });
  });

  it("POST /compras no deja superar el cupo disponible (409)", async () => {
    const res = await request(app)
      .post("/compras")
      .set(comoUsuario(usuarios.sofia))
      .send({ eventoId: JAZZ, tipoEntradaId: MESA, cantidad: 4 });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('No hay cupo suficiente para "Mesa preferencial": se pidieron 4 y quedan 3');
  });

  it("POST /compras valida los campos y la cantidad", async () => {
    const faltaCantidad = await request(app)
      .post("/compras")
      .set(comoUsuario(usuarios.sofia))
      .send({ eventoId: JAZZ, tipoEntradaId: MESA });
    const cantidadInvalida = await request(app)
      .post("/compras")
      .set(comoUsuario(usuarios.sofia))
      .send({ eventoId: JAZZ, tipoEntradaId: MESA, cantidad: 0 });

    expect(faltaCantidad.status).toBe(400);
    expect(faltaCantidad.body.message).toBe("Faltan campos obligatorios: cantidad");
    expect(cantidadInvalida.status).toBe(422);
  });

  it("POST /compras para un evento pasado responde 409", async () => {
    const [tributo] = (await repositorios.eventoRepository.buscarTodos()).filter((e) => e.nombre.startsWith("Tributo"));

    const res = await request(app)
      .post("/compras")
      .set(comoUsuario(usuarios.sofia))
      .send({ eventoId: tributo.id, tipoEntradaId: 1, cantidad: 1 });

    expect(res.status).toBe(409);
  });

  it("las rutas de compras requieren identificarse", async () => {
    expect((await request(app).get("/compras")).status).toBe(401);
    expect((await request(app).post("/compras").send({})).status).toBe(401);
  });

  it("GET /compras lista solo las compras del usuario identificado", async () => {
    const res = await request(app).get("/compras").set(comoUsuario(usuarios.juan));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
    expect(res.body.every((c) => c.comprador.id === usuarios.juan.id)).toBe(true);
    const confirmada = res.body.find((c) => c.estado === "CONFIRMADA");
    expect(confirmada.diasParaElEvento).toBe(12);
  });

  it("GET /compras?estado= filtra por estado y valida el estado", async () => {
    const utilizadas = await request(app)
      .get("/compras")
      .query({ estado: "utilizada" })
      .set(comoUsuario(usuarios.juan));
    const invalido = await request(app).get("/compras").query({ estado: "PAGADA" }).set(comoUsuario(usuarios.juan));

    expect(utilizadas.body).toHaveLength(2);
    expect(invalido.status).toBe(400);
  });

  it("GET /compras/:id la ven el comprador y el organizador, pero no otro usuario", async () => {
    const [compraDeJuan] = (await request(app).get("/compras").set(comoUsuario(usuarios.juan))).body.filter(
      (c) => c.evento.nombre === "Noche de Rock Nacional",
    );

    const comoComprador = await request(app).get(`/compras/${compraDeJuan.id}`).set(comoUsuario(usuarios.juan));
    const comoOrganizador = await request(app).get(`/compras/${compraDeJuan.id}`).set(comoUsuario(usuarios.lucia));
    const comoOtro = await request(app).get(`/compras/${compraDeJuan.id}`).set(comoUsuario(usuarios.sofia));

    expect(comoComprador.status).toBe(200);
    expect(comoComprador.body.historialEstados.map((h) => h.estado)).toEqual(["PENDIENTE", "CONFIRMADA"]);
    expect(comoOrganizador.status).toBe(200);
    expect(comoOtro.status).toBe(403);
  });
});
