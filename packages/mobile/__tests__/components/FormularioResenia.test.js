import { render, screen, userEvent } from "@testing-library/react-native";
import { FormularioResenia } from "../../src/components/FormularioResenia";
import { reseniar } from "../../src/services/compras.service";

// Mock del service: el componente se prueba sin llamar al backend
jest.mock("../../src/services/compras.service", () => ({ reseniar: jest.fn() }));

jest.useFakeTimers();

describe("FormularioResenia", () => {
  beforeEach(() => reseniar.mockReset());

  it("pide puntuación y comentario antes de enviar", async () => {
    const user = userEvent.setup();
    await render(<FormularioResenia compraId={5} onReseniado={jest.fn()} />);

    await user.press(screen.getByRole("button", { name: "Enviar reseña" }));

    expect(screen.getByText("Elegí una puntuación")).toBeOnTheScreen();
    expect(screen.getByText("Contanos cómo fue tu experiencia")).toBeOnTheScreen();
    expect(reseniar).not.toHaveBeenCalled();
  });

  it("envía la puntuación elegida y el comentario", async () => {
    const user = userEvent.setup();
    const onReseniado = jest.fn();
    reseniar.mockResolvedValue({});
    await render(<FormularioResenia compraId={5} onReseniado={onReseniado} />);

    await user.press(screen.getByRole("radio", { name: "4 estrellas, Muy bueno" }));
    await user.type(screen.getByLabelText("Comentario"), "Muy buena obra");
    await user.press(screen.getByRole("button", { name: "Enviar reseña" }));

    expect(reseniar).toHaveBeenCalledWith(5, { detalle: "Muy buena obra", puntuacion: 4 });
    expect(onReseniado).toHaveBeenCalled();
  });

  it("muestra el error del servidor", async () => {
    const user = userEvent.setup();
    reseniar.mockRejectedValue({ response: { data: { message: "Esta compra ya tiene una reseña" } } });
    await render(<FormularioResenia compraId={5} onReseniado={jest.fn()} />);

    await user.press(screen.getByRole("radio", { name: "5 estrellas, Excelente" }));
    await user.type(screen.getByLabelText("Comentario"), "Otra");
    await user.press(screen.getByRole("button", { name: "Enviar reseña" }));

    expect(await screen.findByText("Esta compra ya tiene una reseña")).toBeOnTheScreen();
  });
});
