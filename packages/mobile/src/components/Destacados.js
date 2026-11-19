import { useEffect, useRef, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BotonGuardar } from "./BotonGuardar";
import { colores, espaciado, fuente, radio, texto } from "../theme";
import { formatearFecha, formatearPrecio } from "../utils/formato";
import { urlDeImagen } from "../utils/imagen";

const MARGEN = espaciado.l;
const SEPARACION = espaciado.m;
const CADA_CUANTO_AVANZA_MS = 5000;

// "Eventos destacados" de Inicio, como en la app de Punch: tarjeta ancha con la foto a la derecha, el texto sobre un
// degradé oscuro a la izquierda y el botón verde "Ver entradas". Se desliza de costado, avanza sola y marca
// con puntos en cuál está.
export function Destacados({ eventos, onAbrir }) {
  const { width } = useWindowDimensions();
  const [actual, setActual] = useState(0);
  const lista = useRef(null);
  const tocando = useRef(false);

  const anchoDeSlide = width - MARGEN * 2;
  const paso = anchoDeSlide + SEPARACION;

  useEffect(() => {
    if (eventos.length < 2) return undefined;
    const temporizador = setInterval(() => {
      if (tocando.current) return;
      setActual((indice) => {
        const siguiente = (indice + 1) % eventos.length;
        lista.current?.scrollToOffset({ offset: siguiente * paso, animated: true });
        return siguiente;
      });
    }, CADA_CUANTO_AVANZA_MS);
    return () => clearInterval(temporizador);
  }, [eventos.length, paso]);

  if (eventos.length === 0) return null;

  return (
    <View style={styles.contenedor}>
      <FlatList
        ref={lista}
        data={eventos}
        horizontal
        keyExtractor={(evento) => String(evento.id)}
        showsHorizontalScrollIndicator={false}
        snapToInterval={paso}
        decelerationRate="fast"
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={Separador}
        onScrollBeginDrag={() => {
          tocando.current = true;
        }}
        onMomentumScrollEnd={(e) => {
          tocando.current = false;
          setActual(Math.round(e.nativeEvent.contentOffset.x / paso));
        }}
        getItemLayout={(_, indice) => ({ length: paso, offset: paso * indice, index: indice })}
        accessibilityLabel="Eventos destacados"
        renderItem={({ item }) => <Slide evento={item} ancho={anchoDeSlide} onAbrir={onAbrir} />}
      />
      {eventos.length > 1 && (
        <View style={styles.puntos} importantForAccessibility="no-hide-descendants">
          {eventos.map((evento, indice) => (
            <View key={evento.id} style={[styles.punto, indice === actual && styles.puntoActual]} />
          ))}
        </View>
      )}
    </View>
  );
}

function Separador() {
  return <View style={{ width: SEPARACION }} />;
}

function Slide({ evento, ancho, onAbrir }) {
  return (
    <Pressable
      onPress={() => onAbrir(evento)}
      accessibilityRole="button"
      accessibilityLabel={`Destacado: ${evento.nombre}, ${formatearFecha(evento.fecha)}. Ver entradas`}
      style={({ pressed }) => [styles.slide, { width: ancho }, pressed && styles.presionado]}
    >
      <Image
        source={{ uri: urlDeImagen(evento.imagen) }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.96)", "rgba(0,0,0,0.82)", "rgba(0,0,0,0.1)"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.contenido}>
        <Text style={texto.etiqueta}>{evento.categoria}</Text>
        <Text style={styles.titulo} numberOfLines={2}>
          {evento.nombre}
        </Text>
        <Text style={texto.pie} numberOfLines={1}>
          Organiza {evento.organizador.nombreCompleto}
        </Text>
        <View style={styles.dato}>
          <Ionicons name="calendar-outline" size={13} color={colores.textoSecundario} />
          <Text style={texto.pie}>{formatearFecha(evento.fecha)}</Text>
        </View>
        <View style={styles.dato}>
          <Ionicons name="pricetag-outline" size={13} color={colores.textoSecundario} />
          <Text style={texto.pie}>
            {evento.precioMinimo === 0 ? "Gratis" : `Desde ${formatearPrecio(evento.precioMinimo)}`}
          </Text>
        </View>
        <View style={styles.boton}>
          <Text style={styles.botonTexto}>{evento.agotado ? "Agotado" : "Ver entradas"}</Text>
          <Ionicons name="arrow-forward" size={15} color={colores.sobrePrimario} />
        </View>
      </View>
      <View style={styles.guardar}>
        <BotonGuardar eventoId={evento.id} nombre={evento.nombre} tamanio={34} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: espaciado.m },
  lista: { paddingHorizontal: MARGEN },
  slide: {
    height: 232,
    justifyContent: "center",
    borderRadius: radio.l + 4,
    borderCurve: "continuous",
    overflow: "hidden",
    backgroundColor: colores.relleno,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  presionado: { opacity: 0.9 },
  contenido: { width: "62%", padding: espaciado.l, gap: 3 },
  titulo: { ...fuente, fontSize: 22, lineHeight: 25, fontWeight: "800", letterSpacing: -0.5, color: colores.blanco },
  dato: { flexDirection: "row", alignItems: "center", gap: 5 },
  boton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: espaciado.s,
    marginTop: espaciado.s,
    paddingHorizontal: espaciado.l,
    paddingVertical: 10,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: colores.primario,
  },
  botonTexto: { ...fuente, fontSize: 13, fontWeight: "800", color: colores.sobrePrimario },
  guardar: { position: "absolute", top: espaciado.m, right: espaciado.m },
  puntos: { flexDirection: "row", justifyContent: "center", gap: 6 },
  punto: { width: 6, height: 6, borderRadius: 3, backgroundColor: colores.borde },
  puntoActual: { width: 20, backgroundColor: colores.primario },
});
