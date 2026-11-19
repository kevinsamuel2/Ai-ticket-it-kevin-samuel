import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: comprar entradas y consultar compras", () => {
  let app;
  let usuarios;
  let comoUsuario;
  let repositorios;

  // Escalandrum en Bebop Club (id 3) tiene una "Mesa preferencial" (tipo 2) con solo 3 lugares
  const JAZZ = 3;
  const MESA = 2;

  beforeEach(async () => {
    ({ app, usuarios, repositorios, comoUsuario } = await crearAppConDatosDePrueba());
  });

  it("POST /compras crea una compra pendiente y descuenta el cupo del evento", async () => {
    const res = await request(app)
      .post("/compras")
      .set(comoUsuario(usuarios.agustina))
      .send({ eventoId: JAZZ, tipoEntradaId: MESA, cantidad: 2 });

    expect(res.status).toBe(201);
    expect(res.headers.location).toBe(`/compras/${res.body.id}`);
    expect(res.body).toMatchObject({ estado: "PENDIENTE", cantidad: 2, total: 60000 });

    const evento = await request(app).get(`/eventos/${JAZZ}`);
    expect(evento.body.tiposEntrada[1]).toMatchObject({ nombre: "Mesa preferencial", disponibles: 1 });
  });

  it("una compra de varias entradas emite un código por cada una recién cuando se paga", async () => {
    const compra = await request(app)
      .post("/compras")
      .set(comoUsuario(usuarios.agustina))
      .send({ eventoId: JAZZ, tipoEntradaId: 1, cantidad: 3 });
    expect(compra.body.entradas).toEqual([]);

    const pago = await request(app)
      .post(`/compras/${compra.body.id}/cambios-de-estado`)
      .set(comoUsuario(usuarios.agustina))
      .send({ estado: "CONFIRMADA" });

    const codigos = pago.body.entradas.map((entrada) => entrada.codigo);
    expect(pago.body.entradas.map((entrada) => entrada.numero)).toEqual([1, 2, 3]);
    expect(new Set(codigos).size).toBe(3);
    expect(codigos[0]).toMatch(/^AT-\d{5}-1$/);

    const lista = await request(app).get("/compras").set(comoUsuario(usuarios.agustina));
    expect(lista.body.find((c) => c.id === compra.body.id).entradas).toHaveLength(3);
  });

  it("POST /compras no deja superar el cupo disponible (409)", async () => {
    const res = await request(app)
      .post("/compras")
      .set(comoUsuario(usuarios.agustina))
      .send({ eventoId: JAZZ, tipoEntradaId: MESA, cantidad: 4 });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('No hay cupo suficiente para "Mesa preferencial": se pidieron 4 y quedan 3');
  });

  it("POST /compras valida los campos y la cantidad", async () => {
    const faltaCantidad = await request(app)
      .post("/compras")
      .set(comoUsuario(usuarios.agustina))
      .send({ eventoId: JAZZ, tipoEntradaId: MESA });
    const cantidadInvalida = await request(app)
      .post("/compras")
      .set(comoUsuario(usuarios.agustina))
      .send({ eventoId: JAZZ, tipoEntradaId: MESA, cantidad: 0 });

    expect(faltaCantidad.status).toBe(400);
    expect(faltaCantidad.body.message).toBe("Faltan campos obligatorios: cantidad");
    expect(cantidadInvalida.status).toBe(422);
  });

  it("POST /compras del organizador para su propio evento responde 422", async () => {
    const res = await request(app)
      .post("/compras")
      .set(comoUsuario(usuarios.florencia))
      .send({ eventoId: JAZZ, tipoEntradaId: 1, cantidad: 1 });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe("No podés comprar entradas de un evento que organizás vos");
  });

  it("POST /compras para un evento pasado responde 409", async () => {
    const [ciro] = (await repositorios.eventoRepository.buscarTodos()).filter((e) => e.nombre.startsWith("Ciro"));

    const res = await request(app)
      .post("/compras")
      .set(comoUsuario(usuarios.agustina))
      .send({ eventoId: ciro.id, tipoEntradaId: 1, cantidad: 1 });

    expect(res.status).toBe(409);
  });

  it("las rutas de compras requieren identificarse", async () => {
    expect((await request(app).get("/compras")).status).toBe(401);
    expect((await request(app).post("/compras").send({})).status).toBe(401);
  });

  it("GET /compras lista solo las compras del usuario identificado", async () => {
    const res = await request(app).get("/compras").set(comoUsuario(usuarios.nahuel));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(7);
    expect(res.body.every((c) => c.comprador.id === usuarios.nahuel.id)).toBe(true);
    const confirmada = res.body.find((c) => c.estado === "CONFIRMADA");
    expect(confirmada.diasParaElEvento).toBe(12);
  });

  it("GET /compras?estado= filtra por estado y valida el estado", async () => {
    const utilizadas = await request(app)
      .get("/compras")
      .query({ estado: "utilizada" })
      .set(comoUsuario(usuarios.nahuel));
    const invalido = await request(app).get("/compras").query({ estado: "PAGADA" }).set(comoUsuario(usuarios.nahuel));

    expect(utilizadas.body).toHaveLength(4);
    expect(invalido.status).toBe(400);
  });

  it("GET /compras/:id la ven el comprador y el organizador, pero no otro usuario", async () => {
    const [compraDeNahuel] = (await request(app).get("/compras").set(comoUsuario(usuarios.nahuel))).body.filter(
      (c) => c.evento.nombre === "Divididos en Obras",
    );

    const comoComprador = await request(app).get(`/compras/${compraDeNahuel.id}`).set(comoUsuario(usuarios.nahuel));
    const comoOrganizador = await request(app)
      .get(`/compras/${compraDeNahuel.id}`)
      .set(comoUsuario(usuarios.florencia));
    const comoOtro = await request(app).get(`/compras/${compraDeNahuel.id}`).set(comoUsuario(usuarios.agustina));

    expect(comoComprador.status).toBe(200);
    expect(comoComprador.body.historialEstados.map((h) => h.estado)).toEqual(["PENDIENTE", "CONFIRMADA"]);
    expect(comoOrganizador.status).toBe(200);
    expect(comoOtro.status).toBe(403);
  });
});
