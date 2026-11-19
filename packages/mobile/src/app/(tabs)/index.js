import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCarga } from "../../hooks/useCarga";
import { useValorDiferido } from "../../hooks/useValorDiferido";
import { usePaginado } from "../../hooks/usePaginado";
import { buscarEventos, listarCategorias } from "../../services/eventos.service";
import { EventoCard } from "../../components/EventoCard";
import { Chips } from "../../components/Chips";
import { EncabezadoGrande } from "../../components/EncabezadoGrande";
import { Cargando, MensajeError, SinResultados } from "../../components/EstadosDeCarga";
import { colores, espaciado, fuente, radio } from "../../theme";

// Opciones de orden que pide el enunciado: precio, fecha del evento y puntaje del organizador
const ORDENES = [
  { valor: "fecha", etiqueta: "Más próximos", orden: "fecha", direccion: "asc" },
  { valor: "precio-asc", etiqueta: "Menor precio", orden: "precio", direccion: "asc" },
  { valor: "precio-desc", etiqueta: "Mayor precio", orden: "precio", direccion: "desc" },
  { valor: "puntaje", etiqueta: "Mejor puntaje", orden: "puntaje", direccion: "desc" },
];

export default function Explorar() {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState(null);
  const [orden, setOrden] = useState("fecha");
  const textoABuscar = useValorDiferido(texto.trim());

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
    { valor: null, etiqueta: "Todas" },
    ...(categorias ?? []).map((c) => ({ valor: c.nombre, etiqueta: c.nombre })),
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
      <EncabezadoGrande titulo="Explorar" />
      <View style={styles.filtros}>
        <View style={styles.buscador}>
          <Ionicons name="search" size={18} color={colores.textoSecundario} />
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Buscar eventos, artistas, lugares..."
            placeholderTextColor={colores.textoSecundario}
            accessibilityLabel="Buscar eventos"
            returnKeyType="search"
            style={styles.input}
          />
          {texto.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color={colores.textoSecundario}
              onPress={() => setTexto("")}
              accessibilityRole="button"
              accessibilityLabel="Borrar búsqueda"
            />
          )}
        </View>
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
  filtros: {
    gap: espaciado.m,
    paddingBottom: espaciado.s,
    backgroundColor: colores.fondo,
  },
  buscador: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.s,
    marginHorizontal: espaciado.l,
    paddingHorizontal: espaciado.m,
    minHeight: 40,
    borderRadius: radio.m,
    borderCurve: "continuous",
    backgroundColor: "#E3E3E8",
  },
  input: { ...fuente, flex: 1, fontSize: 17, color: colores.texto, paddingVertical: espaciado.s, outlineStyle: "none" },
  lista: { padding: espaciado.l, gap: espaciado.l, flexGrow: 1 },
});
