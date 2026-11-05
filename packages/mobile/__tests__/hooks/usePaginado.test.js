import { act, renderHook, waitFor } from "@testing-library/react-native";
import { usePaginado } from "../../src/hooks/usePaginado";

// Fuera de una pantalla no hay foco de navegación: se simula con un useEffect común
jest.mock("expo-router", () => ({
  useFocusEffect: (callback) => require("react").useEffect(callback, [callback]),
}));

const pagina = (numero, totalPages) => ({
  items: [`evento ${numero}a`, `evento ${numero}b`],
  page: numero,
  totalPages,
});

describe("usePaginado", () => {
  it("carga la primera página y suma la siguiente con cargarMas", async () => {
    const cargarPagina = jest.fn(async (numero) => pagina(numero, 2));
    const { result } = await renderHook(() => usePaginado(cargarPagina));

    await waitFor(() => expect(result.current.items).toEqual(["evento 1a", "evento 1b"]));
    expect(result.current.hayMas).toBe(true);

    await act(() => result.current.cargarMas());

    expect(result.current.items).toEqual(["evento 1a", "evento 1b", "evento 2a", "evento 2b"]);
    expect(result.current.hayMas).toBe(false);
    expect(cargarPagina.mock.calls).toEqual([[1], [2]]);
  });

  it("no pide más páginas cuando ya trajo todas", async () => {
    const cargarPagina = jest.fn(async (numero) => pagina(numero, 1));
    const { result } = await renderHook(() => usePaginado(cargarPagina));
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    await act(() => result.current.cargarMas());

    expect(cargarPagina).toHaveBeenCalledTimes(1);
  });

  it("informa el error si falla la carga", async () => {
    const cargarPagina = jest.fn().mockRejectedValue({ response: { data: { message: "Se cayó el servidor" } } });
    const { result } = await renderHook(() => usePaginado(cargarPagina));

    await waitFor(() => expect(result.current.error).toBe("Se cayó el servidor"));
  });
});
