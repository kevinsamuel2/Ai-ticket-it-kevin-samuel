import { RepositorioEnMemoria } from "./RepositorioEnMemoria.js";

export class CategoriaRepository extends RepositorioEnMemoria {
  async buscarPorNombre(nombre) {
    const [categoria] = await this.buscarDonde((c) => c.esLaMismaQue({ nombre }));
    return categoria ?? null;
  }
}
