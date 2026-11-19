import { render, screen } from "@testing-library/react-native";
import { EntradaConQR, codigoDeEntrada, contenidoDelQR } from "../../src/components/EntradaConQR";
import { matrizDeQR } from "../../src/components/CodigoQR";

const compra = {
  id: 12,
  estado: "CONFIRMADA",
  cantidad: 2,
  evento: { id: 7, nombre: "Stand-up en Belushi", fecha: "2026-11-22T23:00:00.000Z" },
  tipoEntrada: { nombre: "General" },
};

describe("EntradaConQR", () => {
  it("arma un código legible con ceros a la izquierda", () => {
    expect(codigoDeEntrada(compra)).toBe("AT-00012");
  });

  it("el QR lleva la compra, el evento y la cantidad de entradas", () => {
    expect(contenidoDelQR(compra)).toBe("aiticketit://entrada/AT-00012?compra=12&evento=7&entradas=2");
  });

  it("genera una matriz cuadrada de módulos agrupados en tramos", () => {
    const { cantidad, filas } = matrizDeQR("hola");
    expect(filas).toHaveLength(cantidad);
    // Cada tramo entra dentro de la fila y hay módulos oscuros (los patrones de las esquinas)
    filas.forEach((tramos) =>
      tramos.forEach(({ inicio, largo }) => expect(inicio + largo).toBeLessThanOrEqual(cantidad)),
    );
    expect(filas.some((tramos) => tramos.length > 0)).toBe(true);
  });

  it("muestra el código y el QR de una entrada confirmada", async () => {
    await render(<EntradaConQR compra={compra} />);
    expect(screen.getByText("Tu entrada")).toBeTruthy();
    expect(screen.getByText("AT-00012")).toBeTruthy();
    expect(screen.getByLabelText("Código QR de la entrada AT-00012")).toBeTruthy();
  });

  it("avisa que la entrada ya se usó cuando está utilizada", async () => {
    await render(<EntradaConQR compra={{ ...compra, estado: "UTILIZADA" }} />);
    expect(screen.getByText("Entrada utilizada")).toBeTruthy();
    expect(screen.getByText("Esta entrada ya se usó para ingresar.")).toBeTruthy();
  });
});
