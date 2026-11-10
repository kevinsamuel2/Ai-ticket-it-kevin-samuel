import request from "supertest";
import { especificacion } from "../../config/swagger.js";
import { crearAppConDatosDePrueba } from "./helpers.js";

describe("Documentación Swagger", () => {
  let app;
  let usuarios;
  let comoUsuario;

  beforeAll(async () => {
    ({ app, usuarios, comoUsuario } = await crearAppConDatosDePrueba());
  });

  const endpointsDocumentados = Object.entries(especificacion.paths).flatMap(([path, metodos]) =>
    Object.keys(metodos).map((metodo) => [metodo.toUpperCase(), path]),
  );

  it("documenta todos los recursos de la API", () => {
    expect(endpointsDocumentados.map(([metodo, path]) => `${metodo} ${path}`)).toEqual(
      expect.arrayContaining([
        "GET /eventos",
        "POST /eventos",
        "GET /eventos/{eventoId}",
        "GET /eventos/{eventoId}/compras",
        "GET /compras",
        "POST /compras",
        "GET /compras/{compraId}",
        "POST /compras/{compraId}/cambios-de-estado",
        "POST /compras/{compraId}/resenia",
        "GET /compras/{compraId}/mensajes",
        "POST /compras/{compraId}/mensajes",
        "GET /usuarios/{usuarioId}/resenias",
      ]),
    );
  });

  // Si alguien cambia una ruta y no actualiza la documentación (o al revés), este test lo detecta
  it.each(endpointsDocumentados)("%s %s existe en la app", async (metodo, path) => {
    const url = path.replace(/\{[^}]+\}/g, "1");

    const res = await request(app)[metodo.toLowerCase()](url).set(comoUsuario(usuarios.florencia)).send({});

    expect(res.body.message ?? "").not.toMatch(/^No existe el endpoint/);
  });

  it("sirve la interfaz en /api-docs y la especificación en /api-docs.json", async () => {
    const ui = await request(app).get("/api-docs/");
    const json = await request(app).get("/api-docs.json");

    expect(ui.status).toBe(200);
    expect(json.body.info.title).toBe("AI Ticket It - API REST");
  });
});
