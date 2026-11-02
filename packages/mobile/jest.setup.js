// Los íconos cargan una fuente como asset nativo, que no existe en el entorno de Jest:
// en los tests se reemplazan por un componente que no renderiza nada
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
