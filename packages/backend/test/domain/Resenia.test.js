import { Resenia } from "../../domain/Resenia.js";

describe("Dominio: Resenia", () => {
  const datosValidos = { comprador: { id: 1 }, evento: { id: 1 }, detalle: "Excelente show", puntuacion: 5 };

  it("crea una reseña válida", () => {
    expect(new Resenia(datosValidos)).toMatchObject({ detalle: "Excelente show", puntuacion: 5 });
  });

  it("acepta puntuaciones con decimales dentro del rango", () => {
    expect(new Resenia({ ...datosValidos, puntuacion: 3.5 }).puntuacion).toBe(3.5);
  });

  it("error si la puntuación está fuera de 1 a 5 o no es un número", () => {
    for (const puntuacion of [0, 5.5, "4", undefined]) {
      expect(() => new Resenia({ ...datosValidos, puntuacion })).toThrow(
        "La puntuación debe ser un número entre 1 y 5",
      );
    }
  });

  it("error si no tiene comentario", () => {
    expect(() => new Resenia({ ...datosValidos, detalle: "" })).toThrow("La reseña debe tener un comentario");
  });

  it("promedio redondea a un decimal y devuelve null sin reseñas", () => {
    const resenias = [5, 4, 4].map((puntuacion) => new Resenia({ ...datosValidos, puntuacion }));

    expect(Resenia.promedio(resenias)).toBe(4.3);
    expect(Resenia.promedio([])).toBeNull();
  });
});
