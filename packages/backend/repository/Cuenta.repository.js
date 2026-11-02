import { RepositorioEnMemoria } from "./RepositorioEnMemoria.js";

export class CuentaRepository extends RepositorioEnMemoria {
  async buscarPorEmail(email) {
    const [cuenta] = await this.buscarDonde((c) => c.tieneEmail(email));
    return cuenta ?? null;
  }
}
