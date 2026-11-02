import { cargarDatosDePrueba } from "../../data/datosDePrueba.js";
import { UsuarioRepository } from "../../repository/Usuario.repository.js";
import { CategoriaRepository } from "../../repository/Categoria.repository.js";
import { EventoRepository } from "../../repository/Evento.repository.js";
import { CompraRepository } from "../../repository/Compra.repository.js";
import { EstadoCompra } from "../../domain/EstadoCompra.js";
import { Resenia } from "../../domain/Resenia.js";

// Además de probar que los datos de prueba sean consistentes, ejercita los repositorios específicos
describe("Datos de prueba y repositorios", () => {
  const ahora = new Date();
  let repos;
  let usuarios;

  beforeAll(async () => {
    repos = {
      usuarioRepository: new UsuarioRepository(),
      categoriaRepository: new CategoriaRepository(),
      eventoRepository: new EventoRepository(),
      compraRepository: new CompraRepository(),
    };
    ({ usuarios } = await cargarDatosDePrueba(repos, ahora));
  });

  it("carga usuarios, categorías, eventos y compras", async () => {
    expect(await repos.usuarioRepository.buscarTodos()).toHaveLength(4);
    expect(await repos.categoriaRepository.buscarTodos()).toHaveLength(6);
    expect(await repos.eventoRepository.buscarTodos()).toHaveLength(10);
    expect((await repos.compraRepository.buscarTodos()).length).toBeGreaterThan(0);
  });

  it("hay eventos futuros para comprar y eventos pasados", async () => {
    const eventos = await repos.eventoRepository.buscarTodos();

    expect(eventos.filter((e) => !e.yaSeRealizo(ahora))).toHaveLength(7);
    expect(eventos.filter((e) => e.yaSeRealizo(ahora))).toHaveLength(3);
  });

  it("hay compras en todos los estados excepto CANCELADA, que la genera el uso de la app", async () => {
    const estados = new Set((await repos.compraRepository.buscarTodos()).map((c) => c.estado));

    expect(estados).toEqual(
      new Set([EstadoCompra.PENDIENTE, EstadoCompra.CONFIRMADA, EstadoCompra.UTILIZADA, EstadoCompra.REEMBOLSADA]),
    );
  });

  it("las compras pendientes se crean ahora (para que no venzan apenas levanta el servidor)", async () => {
    const pendientes = await repos.compraRepository.buscarPendientesAnterioresA(ahora);

    expect(pendientes).toHaveLength(0);
  });

  it("categoriaRepository busca por nombre sin distinguir mayúsculas", async () => {
    expect((await repos.categoriaRepository.buscarPorNombre("teatro")).nombre).toBe("Teatro");
    expect(await repos.categoriaRepository.buscarPorNombre("Ópera")).toBeNull();
  });

  it("eventoRepository busca los eventos de un organizador", async () => {
    const eventosDeLucia = await repos.eventoRepository.buscarPorOrganizador(usuarios.lucia);

    expect(eventosDeLucia).toHaveLength(5);
    expect(eventosDeLucia.every((e) => e.organizador === usuarios.lucia)).toBe(true);
  });

  it("compraRepository busca compras por comprador y por evento", async () => {
    const comprasDeJuan = await repos.compraRepository.buscarPorComprador(usuarios.juan);
    const [rock] = (await repos.eventoRepository.buscarTodos()).filter((e) => e.nombre === "Noche de Rock Nacional");

    expect(comprasDeJuan).toHaveLength(5);
    expect(await repos.compraRepository.buscarPorEvento(rock)).toHaveLength(2);
  });

  it("la reputación de cada organizador sale de las reseñas de sus eventos", async () => {
    const reseniasLucia = await repos.compraRepository.buscarReseniasDeOrganizador(usuarios.lucia);
    const reseniasMartin = await repos.compraRepository.buscarReseniasDeOrganizador(usuarios.martin);

    expect(Resenia.promedio(reseniasLucia)).toBe(4.5);
    expect(Resenia.promedio(reseniasMartin)).toBe(3.8);
  });

  it("Juan tiene una entrada utilizada sin reseñar, para probar la reseña desde la app", async () => {
    const comprasDeJuan = await repos.compraRepository.buscarPorComprador(usuarios.juan);

    expect(comprasDeJuan.filter((c) => c.puedeReseniarse())).toHaveLength(1);
  });
});
