import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCarga } from "../../hooks/useCarga";
import { useUsuario } from "../../context/UsuarioContext";
import { buscarEventos, listarCategorias } from "../../services/eventos.service";
import { Avatar } from "../../components/Avatar";
import { Buscador } from "../../components/Buscador";
import { CabeceraDeLista } from "../../components/CabeceraDeLista";
import { Chips } from "../../components/Chips";
import { Destacados } from "../../components/Destacados";
import { EventoCard } from "../../components/EventoCard";
import { Cargando, MensajeError, SinResultados } from "../../components/EstadosDeCarga";
import { colores, espaciado, espacioParaLaBarra, fuente, radio } from "../../theme";
import { iconoDeCategoria } from "../../utils/categorias";

const CANTIDAD_DE_DESTACADOS = 5;
const CANTIDAD_PARA_TI = 6;

// Inicio, como en la app de Punch: saludo, buscador, categorías, "Eventos destacados" y "Para ti"
export default function Inicio() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { usuario } = useUsuario();
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState(null);

  const { datos: categorias } = useCarga(useCallback(() => listarCategorias(), []));
  // Los destacados son los eventos con foto de los organizadores mejor puntuados
  const destacados = useCarga(useCallback(() => buscarEventos({ orden: "puntaje", direccion: "desc" }), []));
  const paraTi = useCarga(useCallback(() => buscarEventos({ categoria, orden: "fecha" }), [categoria]));

  const abrirEvento = (evento) => router.push(`/eventos/${evento.id}`);
  const verTodos = () => router.push({ pathname: "/eventos", params: categoria ? { categoria } : {} });
  const buscar = (valor) => router.push({ pathname: "/eventos", params: { texto: valor.trim() } });

  const opcionesDeCategoria = [
    { valor: null, etiqueta: "Todos", icono: "grid-outline" },
    ...(categorias ?? []).map((c) => ({ valor: c.nombre, etiqueta: c.nombre, icono: iconoDeCategoria(c.nombre) })),
  ];

  const recargar = () => {
    destacados.recargar();
    paraTi.recargar();
  };

  const renderizarContenido = () => {
    const error = destacados.error ?? paraTi.error;
    if (error) return <MensajeError mensaje={error} onReintentar={recargar} />;
    if (!destacados.datos || !paraTi.datos) return <Cargando mensaje="Buscando eventos..." />;

    const eventosDestacados = destacados.datos.items.filter((evento) => evento.imagen).slice(0, CANTIDAD_DE_DESTACADOS);
    const eventos = paraTi.datos.items.slice(0, CANTIDAD_PARA_TI);

    return (
      <>
        {eventosDestacados.length > 0 && (
          <View style={styles.seccion}>
            <CabeceraDeLista titulo="Eventos destacados" onVerTodo={verTodos} />
            <Destacados eventos={eventosDestacados} onAbrir={abrirEvento} />
          </View>
        )}
        <View style={styles.seccion}>
          <CabeceraDeLista titulo="Para ti" onVerTodo={verTodos} />
          <View style={styles.lista}>
            {eventos.length === 0 ? (
              <SinResultados mensaje="No hay eventos próximos en esta categoría" />
            ) : (
              eventos.map((evento) => (
                <EventoCard key={evento.id} evento={evento} onPress={() => abrirEvento(evento)} />
              ))
            )}
          </View>
        </View>
      </>
    );
  };

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={[styles.contenido, { paddingTop: top + espaciado.m }]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={destacados.cargando || paraTi.cargando}
          onRefresh={recargar}
          tintColor={colores.primario}
        />
      }
    >
      <View style={styles.saludo}>
        <View style={styles.logo}>
          <Ionicons name="ticket" size={22} color={colores.primario} />
        </View>
        <View style={styles.saludoTextos}>
          <Text style={styles.saludoChico}>¡No te lo pierdas!</Text>
          <Text style={styles.saludoGrande} numberOfLines={1}>
            Eventos para vos, <Text style={styles.nombre}>{usuario.nombreCompleto.split(" ")[0]}</Text>
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/perfil")}
          accessibilityRole="button"
          accessibilityLabel="Ir a tu perfil"
        >
          <Avatar nombreCompleto={usuario.nombreCompleto} tamanio={42} />
        </Pressable>
      </View>

      <Buscador valor={texto} onCambiar={setTexto} onBuscar={buscar} />
      <Chips
        etiquetaAccesible="Categorías"
        opciones={opcionesDeCategoria}
        seleccionada={categoria}
        onSeleccionar={setCategoria}
      />

      {renderizarContenido()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { gap: espaciado.l, paddingBottom: espacioParaLaBarra + espaciado.l },
  saludo: { flexDirection: "row", alignItems: "center", gap: espaciado.m, paddingHorizontal: espaciado.l },
  logo: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radio.m + 2,
    borderCurve: "continuous",
    borderWidth: 1.5,
    borderColor: colores.primario,
    backgroundColor: colores.primarioSuave,
  },
  saludoTextos: { flex: 1 },
  saludoChico: { ...fuente, fontSize: 12, fontWeight: "700", color: colores.primarioClaro },
  saludoGrande: { ...fuente, fontSize: 18, fontWeight: "800", letterSpacing: -0.3, color: colores.texto },
  nombre: { color: colores.primarioClaro },
  seccion: { gap: espaciado.m },
  lista: { gap: espaciado.m, paddingHorizontal: espaciado.l },
});
