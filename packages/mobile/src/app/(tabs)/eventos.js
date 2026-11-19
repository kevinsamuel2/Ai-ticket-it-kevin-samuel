import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCarga } from "../../hooks/useCarga";
import { useValorDiferido } from "../../hooks/useValorDiferido";
import { usePaginado } from "../../hooks/usePaginado";
import { buscarEventos, listarCategorias } from "../../services/eventos.service";
import { Buscador } from "../../components/Buscador";
import { EventoCard } from "../../components/EventoCard";
import { Chips } from "../../components/Chips";
import { EncabezadoGrande } from "../../components/EncabezadoGrande";
import { Cargando, MensajeError, SinResultados } from "../../components/EstadosDeCarga";
import { colores, espaciado, espacioParaLaBarra } from "../../theme";
import { iconoDeCategoria } from "../../utils/categorias";

// Opciones de orden que pide el enunciado: precio, fecha del evento y puntaje del organizador
const ORDENES = [
  { valor: "fecha", etiqueta: "Más próximos", orden: "fecha", direccion: "asc", icono: "time-outline" },
  { valor: "precio-asc", etiqueta: "Menor precio", orden: "precio", direccion: "asc", icono: "arrow-down-outline" },
  { valor: "precio-desc", etiqueta: "Mayor precio", orden: "precio", direccion: "desc", icono: "arrow-up-outline" },
  { valor: "puntaje", etiqueta: "Mejor puntaje", orden: "puntaje", direccion: "desc", icono: "star-outline" },
];

// Todos los eventos con búsqueda, categoría y orden. Se puede llegar con una búsqueda o categoría ya elegidas desde Inicio.
export default function Eventos() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState(null);
  const [orden, setOrden] = useState("fecha");
  const textoABuscar = useValorDiferido(texto.trim());

  // Al volver desde Inicio con "Ver todo" o una búsqueda, se aplican esos filtros
  useEffect(() => {
    setTexto(typeof params.texto === "string" ? params.texto : "");
    setCategoria(typeof params.categoria === "string" ? params.categoria : null);
  }, [params.texto, params.categoria]);

  const { datos: categorias } = useCarga(useCallback(() => listarCategorias(), []));

  const { orden: criterio, direccion } = ORDENES.find((opcion) => opcion.valor === orden);
  // Los eventos se traen de a una página y se suman las siguientes al llegar al final de la lista
  const {
    items: eventos,
    cargando,
    cargandoMas,
    error,
    recargar,
    cargarMas,
  } = usePaginado(
    useCallback(
      (page) => buscarEventos({ texto: textoABuscar, categoria, orden: criterio, direccion, page }),
      [textoABuscar, categoria, criterio, direccion],
    ),
  );

  const opcionesDeCategoria = [
    { valor: null, etiqueta: "Todos", icono: "grid-outline" },
    ...(categorias ?? []).map((c) => ({ valor: c.nombre, etiqueta: c.nombre, icono: iconoDeCategoria(c.nombre) })),
  ];

  const renderizarResultados = () => {
    if (error) return <MensajeError mensaje={error} onReintentar={recargar} />;
    if (!eventos) return <Cargando mensaje="Buscando eventos..." />;
    return (
      <FlatList
        data={eventos}
        keyExtractor={(evento) => String(evento.id)}
        contentContainerStyle={styles.lista}
        refreshing={cargando}
        onRefresh={recargar}
        onEndReached={cargarMas}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          cargandoMas ? <ActivityIndicator color={colores.primario} accessibilityLabel="Cargando más eventos" /> : null
        }
        renderItem={({ item: evento }) => (
          <EventoCard evento={evento} onPress={() => router.push(`/eventos/${evento.id}`)} />
        )}
        ListEmptyComponent={
          <SinResultados mensaje={texto ? `No encontramos eventos para "${texto}"` : "No hay eventos próximos"} />
        }
      />
    );
  };

  return (
    <View style={styles.contenedor}>
      <EncabezadoGrande titulo="Eventos" />
      <View style={styles.filtros}>
        <Buscador valor={texto} onCambiar={setTexto} />
        <Chips
          etiquetaAccesible="Categorías"
          opciones={opcionesDeCategoria}
          seleccionada={categoria}
          onSeleccionar={setCategoria}
        />
        <Chips etiquetaAccesible="Ordenar por" opciones={ORDENES} seleccionada={orden} onSeleccionar={setOrden} />
      </View>
      {renderizarResultados()}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  filtros: { gap: espaciado.m, paddingBottom: espaciado.s, backgroundColor: colores.fondo },
  lista: { padding: espaciado.l, gap: espaciado.m, flexGrow: 1, paddingBottom: espacioParaLaBarra + espaciado.l },
});
