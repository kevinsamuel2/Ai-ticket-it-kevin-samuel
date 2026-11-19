import request from "supertest";
import { crearAppConDatosDePrueba } from "./helpers.js";
import { CONTRASENIA_DE_PRUEBA } from "../../data/datosDePrueba.js";

describe("API: usuarios y categorías", () => {
  let app;
  let usuarios;
  let comoUsuario;

  beforeEach(async () => {
    ({ app, usuarios, comoUsuario } = await crearAppConDatosDePrueba());
  });

  it("GET /usuarios lista los usuarios a quien inició sesión", async () => {
    const res = await request(app).get("/usuarios").set(comoUsuario(usuarios.nahuel));

    expect(res.status).toBe(200);
    expect(res.body.map((u) => u.nombreCompleto)).toEqual([
      "Florencia Acosta",
      "Gonzalo Pereyra",
      "Nahuel Quiroga",
      "Agustina Benítez",
      "Camila Ferreyra",
      "Ramiro Domínguez",
    ]);
  });

  it("GET /usuarios/:id devuelve un usuario o 404", async () => {
    const encontrado = await request(app).get("/usuarios/3").set(comoUsuario(usuarios.nahuel));
    const inexistente = await request(app).get("/usuarios/99").set(comoUsuario(usuarios.nahuel));

    expect(encontrado.status).toBe(200);
    expect(encontrado.body).toEqual({ id: 3, nombre: "Nahuel", apellido: "Quiroga", nombreCompleto: "Nahuel Quiroga" });
    expect(inexistente.status).toBe(404);
    expect(inexistente.body.message).toBe("El usuario con id 99 no existe");
  });

  it("GET /usuarios sin iniciar sesión responde 401 (no expone los datos de los usuarios)", async () => {
    expect((await request(app).get("/usuarios")).status).toBe(401);
    expect((await request(app).get("/usuarios/3")).status).toBe(401);
  });

  it("la reputación y los eventos de un organizador siguen siendo públicos", async () => {
    expect((await request(app).get("/usuarios/1/resenias")).status).toBe(200);
    expect((await request(app).get("/usuarios/1/eventos")).status).toBe(200);
  });

  it("GET /categorias lista las categorías", async () => {
    const res = await request(app).get("/categorias");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
    expect(res.body[0]).toEqual({ id: 1, nombre: "Recitales", descripcion: "Música en vivo" });
  });
});

describe("API: sesiones (login)", () => {
  let app;

  beforeEach(async () => {
    ({ app } = await crearAppConDatosDePrueba());
  });

  const iniciarSesion = (email, contrasenia) => request(app).post("/sesiones").send({ email, contrasenia });

  it("POST /sesiones con credenciales correctas devuelve un token y el usuario", async () => {
    const res = await iniciarSesion("Nahuel@AITicketIt.com ", CONTRASENIA_DE_PRUEBA);

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.usuario).toEqual({
      id: 3,
      nombre: "Nahuel",
      apellido: "Quiroga",
      nombreCompleto: "Nahuel Quiroga",
      email: "nahuel@aiticketit.com",
    });
  });

  it("POST /sesiones responde 401 con el mismo mensaje si el email no existe o la contraseña es incorrecta", async () => {
    const contraseniaIncorrecta = await iniciarSesion("nahuel@aiticketit.com", "otra-clave");
    const emailInexistente = await iniciarSesion("nadie@aiticketit.com", CONTRASENIA_DE_PRUEBA);

    expect(contraseniaIncorrecta.status).toBe(401);
    expect(emailInexistente.status).toBe(401);
    expect(contraseniaIncorrecta.body.message).toBe("Email o contraseña incorrectos");
    expect(emailInexistente.body.message).toBe(contraseniaIncorrecta.body.message);
  });

  it("POST /sesiones sin email o contraseña responde 400", async () => {
    const res = await request(app).post("/sesiones").send({ email: "nahuel@aiticketit.com" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Faltan campos obligatorios: contrasenia");
  });

  it("el token identifica al usuario en las rutas protegidas", async () => {
    const { body } = await iniciarSesion("agustina@aiticketit.com", CONTRASENIA_DE_PRUEBA);

    const compras = await request(app).get("/compras").set("Authorization", `Bearer ${body.token}`);

    expect(compras.status).toBe(200);
    expect(compras.body.every((c) => c.comprador.nombreCompleto === "Agustina Benítez")).toBe(true);
  });

  it("sin token las rutas protegidas responden 401", async () => {
    const res = await request(app).get("/compras");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Tenés que iniciar sesión para realizar esta operación");
  });

  it("un token inválido o mal formado responde 401 en las rutas protegidas", async () => {
    const inventado = await request(app).get("/compras").set("Authorization", "Bearer token-inventado");
    const malFormado = await request(app).get("/compras").set("Authorization", "token-sin-bearer");

    expect(inventado.status).toBe(401);
    expect(inventado.body.message).toBe("La sesión no es válida o expiró. Volvé a iniciar sesión");
    expect(malFormado.status).toBe(401);
    expect(malFormado.body.message).toBe('El header Authorization debe tener el formato "Bearer <token>"');
  });

  it("un token vencido no impide usar las rutas públicas", async () => {
    const eventos = await request(app).get("/eventos").set("Authorization", "Bearer token-vencido");
    const categorias = await request(app).get("/categorias").set("Authorization", "Bearer token-vencido");

    expect(eventos.status).toBe(200);
    expect(categorias.status).toBe(200);
  });

  it("DELETE /sesiones/actual cierra la sesión y el token deja de servir", async () => {
    const { body } = await iniciarSesion("nahuel@aiticketit.com", CONTRASENIA_DE_PRUEBA);
    const autorizacion = { Authorization: `Bearer ${body.token}` };

    const cierre = await request(app).delete("/sesiones/actual").set(autorizacion);
    const despues = await request(app).get("/compras").set(autorizacion);

    expect(cierre.status).toBe(204);
    expect(despues.status).toBe(401);
  });
});
