import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCarga } from "../../hooks/useCarga";
import { useValorDiferido } from "../../hooks/useValorDiferido";
import { usePaginado } from "../../hooks/usePaginado";
import { buscarEventos, listarCategorias, listarCiudades } from "../../services/eventos.service";
import { Buscador } from "../../components/Buscador";
import { EventoCard } from "../../components/EventoCard";
import { Chips } from "../../components/Chips";
import { EncabezadoGrande } from "../../components/EncabezadoGrande";
import { FiltroDesplegable } from "../../components/FiltroDesplegable";
import { Cargando, MensajeError, SinResultados } from "../../components/EstadosDeCarga";
import { colores, espaciado, espacioParaLaBarra } from "../../theme";
import { iconoDeCategoria } from "../../utils/categorias";
import { FILTROS_DE_FECHA, rangoDeFecha } from "../../utils/fechas";

// Opciones de orden que pide el enunciado: precio, fecha del evento y puntaje del organizador
const ORDENES = [
  { valor: "fecha", etiqueta: "Más próximos", orden: "fecha", direccion: "asc" },
  { valor: "precio-asc", etiqueta: "Menor precio", orden: "precio", direccion: "asc" },
  { valor: "precio-desc", etiqueta: "Mayor precio", orden: "precio", direccion: "desc" },
  { valor: "puntaje", etiqueta: "Mejor puntaje", orden: "puntaje", direccion: "desc" },
];

// Todos los eventos con búsqueda, categoría, ubicación, fecha y orden. Se puede llegar con una búsqueda o categoría ya
// elegidas desde Inicio.
export default function Eventos() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState(null);
  const [ciudad, setCiudad] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [orden, setOrden] = useState("fecha");
  const textoABuscar = useValorDiferido(texto.trim());

  // Al volver desde Inicio con "Ver todo" o una búsqueda, se aplican esos filtros
  useEffect(() => {
    setTexto(typeof params.texto === "string" ? params.texto : "");
    setCategoria(typeof params.categoria === "string" ? params.categoria : null);
  }, [params.texto, params.categoria]);

  const { datos: categorias } = useCarga(useCallback(() => listarCategorias(), []));
  const { datos: ciudades } = useCarga(useCallback(() => listarCiudades(), []));

  const { orden: criterio, direccion } = ORDENES.find((opcion) => opcion.valor === orden);
  // El rango de fechas se arma en la zona horaria del celular y solo cambia cuando se elige otro filtro
  const rango = useMemo(() => rangoDeFecha(fecha), [fecha]);

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
      (page) => buscarEventos({ texto: textoABuscar, categoria, ciudad, ...rango, orden: criterio, direccion, page }),
      [textoABuscar, categoria, ciudad, rango, criterio, direccion],
    ),
  );

  const opcionesDeCategoria = [
    { valor: null, etiqueta: "Todos", icono: "grid-outline" },
    ...(categorias ?? []).map((c) => ({ valor: c.nombre, etiqueta: c.nombre, icono: iconoDeCategoria(c.nombre) })),
  ];
  const opcionesDeUbicacion = [
    { valor: null, etiqueta: "Todas las ubicaciones" },
    ...(ciudades ?? []).map((nombre) => ({ valor: nombre, etiqueta: nombre })),
  ];

  const hayFiltros = Boolean(texto || categoria || ciudad || fecha);

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
          <SinResultados mensaje={hayFiltros ? "No encontramos eventos con esos filtros" : "No hay eventos próximos"} />
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.desplegables}>
          <FiltroDesplegable
            icono="location-outline"
            nombre="Ubicación"
            titulo="Elegí una ubicación"
            opciones={opcionesDeUbicacion}
            valor={ciudad}
            onSeleccionar={setCiudad}
          />
          <FiltroDesplegable
            icono="calendar-outline"
            nombre="Fecha"
            titulo="Elegí una fecha"
            opciones={FILTROS_DE_FECHA}
            valor={fecha}
            onSeleccionar={setFecha}
          />
          <FiltroDesplegable
            icono="swap-vertical-outline"
            nombre="Ordenar"
            titulo="Ordenar por"
            opciones={ORDENES}
            valor={orden === "fecha" ? null : orden}
            onSeleccionar={(valor) => setOrden(valor ?? "fecha")}
          />
        </ScrollView>
      </View>
      {renderizarResultados()}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  filtros: { gap: espaciado.m, paddingBottom: espaciado.s, backgroundColor: colores.fondo },
  desplegables: { gap: espaciado.s, paddingHorizontal: espaciado.l },
  lista: { padding: espaciado.l, gap: espaciado.m, flexGrow: 1, paddingBottom: espacioParaLaBarra + espaciado.l },
});
