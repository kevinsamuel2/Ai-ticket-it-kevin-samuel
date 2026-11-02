export class CategoriaService {
  constructor(categoriaRepository) {
    this.categoriaRepository = categoriaRepository;
  }

  toDTO(categoria) {
    return { id: categoria.id, nombre: categoria.nombre, descripcion: categoria.descripcion };
  }

  async listarCategorias() {
    const categorias = await this.categoriaRepository.buscarTodos();
    return categorias.map((categoria) => this.toDTO(categoria));
  }
}
