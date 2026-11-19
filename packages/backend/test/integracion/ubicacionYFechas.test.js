import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("API: ubicación y fechas de los eventos", () => {
  let app;
  let usuarios;
  let comoUsuario;

  beforeEach(async () => {
    ({ app, usuarios, comoUsuario } = await crearAppConDatosDePrueba());
  });

  const nombres = (res) => res.body.items.map((e) => e.nombre);
  const enDias = (dias) => new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString();

  it("el listado y el detalle de un evento incluyen su lugar y su ciudad", async () => {
    const listado = await request(app).get("/eventos").query({ texto: "Escalandrum" });
    const detalle = await request(app).get("/eventos/3");

    expect(listado.body.items[0]).toMatchObject({ lugar: "Bebop Club", ciudad: "Buenos Aires" });
    expect(detalle.body).toMatchObject({ lugar: "Bebop Club", ciudad: "Buenos Aires" });
  });

  describe("GET /eventos/ciudades", () => {
    it("lista las ciudades de los eventos próximos, sin repetir y en orden alfabético", async () => {
      const res = await request(app).get("/eventos/ciudades");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(["Buenos Aires", "Córdoba", "San Isidro", "Vicente López"]);
    });
  });

  describe("GET /eventos?ciudad=", () => {
    it("filtra por ciudad sin distinguir mayúsculas ni tildes", async () => {
      const res = await request(app).get("/eventos").query({ ciudad: "cordoba" });

      expect(nombres(res)).toEqual(["Cosquín Rock"]);
    });

    it("se combina con los demás filtros", async () => {
      const res = await request(app).get("/eventos").query({ ciudad: "Buenos Aires", categoria: "Teatro" });

      expect(nombres(res)).toEqual(["Esperando la carroza"]);
    });

    it("una ciudad sin eventos devuelve una lista vacía", async () => {
      const res = await request(app).get("/eventos").query({ ciudad: "Rosario" });

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(0);
    });

    it("la búsqueda por texto también encuentra por lugar", async () => {
      const res = await request(app).get("/eventos").query({ texto: "bombonera" });

      expect(nombres(res)).toEqual(["Superclásico: Boca vs. River"]);
    });
  });

  describe("GET /eventos?fechaDesde=&fechaHasta=", () => {
    it("filtra los eventos de un rango de fechas", async () => {
      const res = await request(app)
        .get("/eventos")
        .query({ fechaDesde: enDias(2), fechaHasta: enDias(9) });

      expect(nombres(res)).toEqual(["Stand-up en Belushi", "Escalandrum en Bebop Club", "Esperando la carroza"]);
    });

    it("cada extremo se puede usar solo", async () => {
      const desde = await request(app)
        .get("/eventos")
        .query({ fechaDesde: enDias(100) });
      const hasta = await request(app)
        .get("/eventos")
        .query({ fechaHasta: enDias(4) });

      expect(nombres(desde)).toEqual(["Lollapalooza Argentina"]);
      expect(nombres(hasta)).toEqual(["Stand-up en Belushi"]);
    });

    it("responde 400 si una fecha es inválida o si el rango está al revés", async () => {
      const invalida = await request(app).get("/eventos").query({ fechaDesde: "ayer" });
      const alReves = await request(app)
        .get("/eventos")
        .query({ fechaDesde: enDias(10), fechaHasta: enDias(1) });

      expect(invalida.status).toBe(400);
      expect(invalida.body.message).toBe("El parámetro fechaDesde debe ser una fecha válida (formato ISO 8601)");
      expect(alReves.status).toBe(400);
    });
  });

  describe("POST /eventos con lugar y ciudad", () => {
    const evento = (cambios = {}) => ({
      nombre: "Ciclo de cine de terror",
      descripcion: "Proyección de clásicos del género",
      categoriaId: 6,
      fecha: enDias(30),
      tiposEntrada: [{ nombre: "General", precio: 5000, cupo: 40 }],
      ...cambios,
    });

    it("guarda el lugar y la ciudad, y la ciudad nueva aparece en el filtro", async () => {
      const res = await request(app)
        .post("/eventos")
        .set(comoUsuario(usuarios.nahuel))
        .send(evento({ lugar: "Cine Gaumont", ciudad: "Rosario" }));

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ lugar: "Cine Gaumont", ciudad: "Rosario" });
      expect((await request(app).get("/eventos/ciudades")).body).toContain("Rosario");
    });

    it("son opcionales", async () => {
      const res = await request(app).post("/eventos").set(comoUsuario(usuarios.nahuel)).send(evento());

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ lugar: null, ciudad: null });
    });

    it("responde 422 si el lugar viene vacío", async () => {
      const res = await request(app)
        .post("/eventos")
        .set(comoUsuario(usuarios.nahuel))
        .send(evento({ lugar: "   " }));

      expect(res.status).toBe(422);
      expect(res.body.message).toBe("El lugar del evento no puede estar vacío");
    });
  });
});
