import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BotonGuardar } from "./BotonGuardar";
import { Puntaje } from "./Puntaje";
import { colores, contorno, espaciado, fuente, radio, texto } from "../theme";
import { formatearFecha, formatearPrecio } from "../utils/formato";
import { urlDeImagen } from "../utils/imagen";

// Tarjeta compacta de evento como la de la app de Punch: foto cuadrada a la izquierda, categoría en verde,
// nombre, fecha, el marcador para guardar arriba a la derecha y la flecha verde para ver las entradas
export function EventoCard({ evento, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${evento.nombre}, ${formatearFecha(evento.fecha)}, desde ${formatearPrecio(evento.precioMinimo)}`}
      style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}
    >
      <View>
        {evento.imagen ? (
          <Image source={{ uri: urlDeImagen(evento.imagen) }} style={styles.imagen} accessibilityIgnoresInvertColors />
        ) : (
          <View style={[styles.imagen, styles.sinImagen]}>
            <Ionicons name="ticket-outline" size={32} color={colores.primario} />
          </View>
        )}
        {evento.agotado && (
          <View style={styles.agotado}>
            <Text style={styles.agotadoTexto}>AGOTADO</Text>
          </View>
        )}
      </View>

      <View style={styles.cuerpo}>
        <View style={styles.cabecera}>
          <Text style={[texto.etiqueta, styles.categoria]} numberOfLines={1}>
            {evento.categoria}
          </Text>
          <BotonGuardar eventoId={evento.id} nombre={evento.nombre} tamanio={32} />
        </View>
        <Text style={styles.nombre} numberOfLines={2}>
          {evento.nombre}
        </Text>
        <View style={styles.fila}>
          <Ionicons name="calendar-outline" size={13} color={colores.textoSecundario} />
          <Text style={[texto.pie, styles.fecha]} numberOfLines={1}>
            {formatearFecha(evento.fecha)}
          </Text>
          <Puntaje puntaje={evento.organizador.puntaje} cantidad={evento.organizador.cantidadResenias} tamanio={12} />
        </View>
        <View style={styles.pie}>
          <Text style={styles.precio}>
            {evento.precioMinimo === 0 ? "Gratis" : `Desde ${formatearPrecio(evento.precioMinimo)}`}
          </Text>
          <View style={styles.flecha}>
            <Ionicons name="arrow-forward" size={16} color={colores.primario} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    gap: espaciado.m,
    padding: espaciado.m - 2,
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    borderCurve: "continuous",
    ...contorno,
  },
  presionada: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  imagen: { width: 104, height: "100%", minHeight: 124, borderRadius: radio.m, backgroundColor: colores.relleno },
  sinImagen: { alignItems: "center", justifyContent: "center" },
  agotado: {
    position: "absolute",
    left: 6,
    bottom: 6,
    backgroundColor: colores.blanco,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  agotadoTexto: { ...fuente, color: colores.negro, fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  cuerpo: { flex: 1, gap: 3 },
  cabecera: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: espaciado.s },
  categoria: { flex: 1 },
  nombre: { ...fuente, fontSize: 17, fontWeight: "800", letterSpacing: -0.3, color: colores.texto },
  fila: { flexDirection: "row", alignItems: "center", gap: 5 },
  fecha: { flex: 1 },
  pie: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: "auto" },
  precio: { ...fuente, fontSize: 15, fontWeight: "800", letterSpacing: -0.2, color: colores.primarioClaro },
  flecha: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colores.primario,
    backgroundColor: colores.primarioSuave,
  },
});
