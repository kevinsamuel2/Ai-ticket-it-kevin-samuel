import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const carpetaDeDocs = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "docs");

// La documentación se escribe en archivos YAML (uno por recurso, en `docs/`) y swagger-jsdoc
// los une en una única especificación OpenAPI. Así no se mezcla con el código de las rutas.
const opciones = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "AI Ticket It - API REST",
      version: "1.0.0",
      description:
        "API de la plataforma de publicación de eventos y venta de entradas. Para operar como un usuario, " +
        "mandá su id en el header `X-Usuario-Id` (los usuarios de prueba son 1 a 4).",
    },
    servers: [{ url: "/", description: "Servidor actual" }],
    tags: [
      { name: "Salud", description: "Estado del servicio" },
      { name: "Usuarios", description: "Usuarios de la plataforma y reputación de organizadores" },
      { name: "Categorías", description: "Categorías para explorar eventos" },
      { name: "Eventos", description: "Búsqueda, detalle y publicación de eventos" },
      { name: "Compras", description: "Compra de entradas y seguimiento de su estado" },
      { name: "Chat", description: "Mensajes entre comprador y organizador dentro de una compra" },
    ],
  },
  // swagger-jsdoc usa globs, que necesitan barras "/" aunque estemos en Windows
  apis: [path.join(carpetaDeDocs, "*.yaml").replaceAll("\\", "/")],
};

export const especificacion = swaggerJSDoc(opciones);

// Interfaz en /api-docs y especificación en crudo en /api-docs.json
export function montarSwagger(app) {
  app.get("/api-docs.json", (req, res) => res.json(especificacion));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(especificacion));
}
