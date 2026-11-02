import { RepositorioEnMemoria } from "./RepositorioEnMemoria.js";

export class EventoRepository extends RepositorioEnMemoria {
  async buscarPorOrganizador(organizador) {
    return this.buscarDonde((evento) => evento.estaOrganizadoPor(organizador));
  }
}
