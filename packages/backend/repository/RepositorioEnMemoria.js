// Persistencia en memoria con un Map, como pide el enunciado. Los métodos son async para que los services
// no dependan de que sea memoria: si mañana se cambia por una base de datos, la interfaz no cambia.
export class RepositorioEnMemoria {
  constructor() {
    this._entidades = new Map();
    this._ultimoId = 0;
  }

  // Si la entidad no tiene id se lo asigna (alta); si ya lo tiene, la reemplaza (modificación)
  async guardar(entidad) {
    if (entidad.id === undefined) {
      this._ultimoId += 1;
      entidad.id = this._ultimoId;
    }
    this._entidades.set(entidad.id, entidad);
    return entidad;
  }

  async buscarPorId(id) {
    return this._entidades.get(Number(id)) ?? null;
  }

  async buscarTodos() {
    return [...this._entidades.values()];
  }

  async eliminar(id) {
    return this._entidades.delete(Number(id));
  }

  async buscarDonde(condicion) {
    return [...this._entidades.values()].filter(condicion);
  }
}
