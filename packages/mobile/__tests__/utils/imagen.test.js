import { urlDeImagen } from "../../src/utils/imagen";

jest.mock("../../src/config", () => ({ API_URL: "http://192.168.0.10:3001" }));

describe("urlDeImagen", () => {
  it("completa con la dirección del backend las imágenes que se guardaron con ruta relativa", () => {
    expect(urlDeImagen("/fotos/bad-bunny.jpg")).toBe("http://192.168.0.10:3001/fotos/bad-bunny.jpg");
  });

  it("deja igual las URLs completas que cargó un usuario", () => {
    expect(urlDeImagen("https://images.unsplash.com/photo-1?w=800")).toBe("https://images.unsplash.com/photo-1?w=800");
  });

  it("devuelve lo mismo si no hay imagen", () => {
    expect(urlDeImagen(undefined)).toBeUndefined();
    expect(urlDeImagen(null)).toBeNull();
  });
});
