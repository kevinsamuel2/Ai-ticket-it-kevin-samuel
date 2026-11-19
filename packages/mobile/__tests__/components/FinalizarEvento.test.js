import { render, screen, userEvent } from "@testing-library/react-native";
import { FinalizarEvento } from "../../src/components/FinalizarEvento";
import { CompraCard } from "../../src/components/CompraCard";
import { finalizarEvento } from "../../src/services/eventos.service";
import { confirmar } from "../../src/utils/confirmar";
import { Proveedores } from "../../test-utils/Proveedores";

// Se mockean el service y el diálogo de confirmación: el componente se prueba sin backend ni Alert nativo
jest.mock("../../src/services/eventos.service", () => ({ finalizarEvento: jest.fn() }));
jest.mock("../../src/utils/confirmar", () => ({ confirmar: jest.fn() }));

jest.useFakeTimers();

describe("FinalizarEvento", () => {
  const evento = { id: 5, nombre: "Esperando la carroza", finalizado: false };

  beforeEach(() => {
    finalizarEvento.mockReset();
    confirmar.mockReset();
  });

  it("finaliza el evento solo si el organizador confirma y avisa cuántas compras cambiaron", async () => {
    const user = userEvent.setup();
    const onFinalizado = jest.fn();
    confirmar.mockResolvedValue(true);
    finalizarEvento.mockResolvedValue({ comprasUtilizadas: 2, comprasCanceladas: 1 });
    await render(<FinalizarEvento evento={evento} onFinalizado={onFinalizado} />, { wrapper: Proveedores });

    await user.press(screen.getByRole("button", { name: "Finalizar evento" }));

    expect(confirmar).toHaveBeenCalledWith(expect.objectContaining({ titulo: "Finalizar evento" }));
    expect(finalizarEvento).toHaveBeenCalledWith(5);
    expect(onFinalizado).toHaveBeenCalled();
    expect(
      await screen.findByText(
        "Evento finalizado. Ya pueden reseñarlo los compradores de 2 compras. Se cancelaron 1 compra sin pagar.",
      ),
    ).toBeOnTheScreen();
  });

  it("no hace nada si el organizador se arrepiente en la confirmación", async () => {
    const user = userEvent.setup();
    confirmar.mockResolvedValue(false);
    await render(<FinalizarEvento evento={evento} onFinalizado={jest.fn()} />, { wrapper: Proveedores });

    await user.press(screen.getByRole("button", { name: "Finalizar evento" }));

    expect(finalizarEvento).not.toHaveBeenCalled();
  });

  it("muestra el error del servidor", async () => {
    const user = userEvent.setup();
    confirmar.mockResolvedValue(true);
    finalizarEvento.mockRejectedValue({ response: { data: { message: "El evento ya fue finalizado" } } });
    await render(<FinalizarEvento evento={evento} onFinalizado={jest.fn()} />, { wrapper: Proveedores });

    await user.press(screen.getByRole("button", { name: "Finalizar evento" }));

    expect(await screen.findByText("El evento ya fue finalizado")).toBeOnTheScreen();
  });

  it("si el evento ya está finalizado no ofrece el botón", async () => {
    await render(<FinalizarEvento evento={{ ...evento, finalizado: true }} onFinalizado={jest.fn()} />, {
      wrapper: Proveedores,
    });

    expect(screen.queryByRole("button", { name: "Finalizar evento" })).not.toBeOnTheScreen();
    expect(screen.getByLabelText("Evento finalizado")).toBeOnTheScreen();
  });
});

describe("CompraCard: aviso de reseña pendiente", () => {
  const compra = {
    id: 1,
    estado: "UTILIZADA",
    cantidad: 1,
    total: 22000,
    fechaCompra: "2026-11-01T12:00:00.000Z",
    diasParaElEvento: null,
    pagarAntesDe: null,
    cantidadMensajes: 0,
    puedeReseniar: true,
    evento: { id: 5, nombre: "Esperando la carroza", fecha: "2026-12-01T23:30:00.000Z", imagen: null },
    tipoEntrada: { id: 1, nombre: "Platea", precio: 22000 },
    comprador: { id: 4, nombreCompleto: "Agustina Benítez" },
  };

  it("el comprador ve que el evento finalizó y que falta su reseña", async () => {
    await render(<CompraCard compra={compra} onPress={jest.fn()} />);

    expect(screen.getByText("El evento finalizó: calificá tu experiencia")).toBeOnTheScreen();
  });

  it("no se muestra si ya reseñó ni en la vista del organizador", async () => {
    const { rerender } = await render(<CompraCard compra={{ ...compra, puedeReseniar: false }} onPress={jest.fn()} />);
    expect(screen.queryByText("El evento finalizó: calificá tu experiencia")).not.toBeOnTheScreen();

    await rerender(<CompraCard compra={compra} onPress={jest.fn()} mostrarComprador />);
    expect(screen.queryByText("El evento finalizó: calificá tu experiencia")).not.toBeOnTheScreen();
  });
});
