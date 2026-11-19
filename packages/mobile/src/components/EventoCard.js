import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Puntaje } from "./Puntaje";
import { colores, espaciado, fuente, radio, sombra, texto } from "../theme";
import { formatearFecha, formatearPrecio } from "../utils/formato";
import { urlDeImagen } from "../utils/imagen";

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
            <Ionicons name="ticket-outline" size={40} color={colores.primario} />
          </View>
        )}
        <View style={styles.categoria}>
          <Text style={styles.categoriaTexto}>{evento.categoria}</Text>
        </View>
        {evento.agotado && (
          <View style={styles.agotado}>
            <Text style={styles.agotadoTexto}>AGOTADO</Text>
          </View>
        )}
      </View>

      <View style={styles.cuerpo}>
        <Text style={texto.subtitulo} numberOfLines={2}>
          {evento.nombre}
        </Text>
        <View style={styles.fila}>
          <Ionicons name="calendar-outline" size={14} color={colores.textoSecundario} />
          <Text style={texto.secundario}>{formatearFecha(evento.fecha)}</Text>
        </View>
        <View style={styles.pie}>
          <View style={styles.organizador}>
            <Text style={texto.secundario} numberOfLines={1}>
              {evento.organizador.nombreCompleto}
            </Text>
            <Puntaje puntaje={evento.organizador.puntaje} cantidad={evento.organizador.cantidadResenias} />
          </View>
          <View style={styles.precio}>
            <Text style={styles.desde}>{evento.precioMinimo === 0 ? "" : "desde"}</Text>
            <Text style={styles.precioTexto}>{formatearPrecio(evento.precioMinimo)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    borderCurve: "continuous",
    overflow: "hidden",
    ...sombra,
  },
  presionada: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  imagen: { width: "100%", aspectRatio: 16 / 9, backgroundColor: colores.primarioSuave },
  sinImagen: { alignItems: "center", justifyContent: "center" },
  categoria: {
    position: "absolute",
    top: espaciado.s,
    left: espaciado.s,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoriaTexto: { ...fuente, color: colores.blanco, fontSize: 12, fontWeight: "600" },
  agotado: {
    position: "absolute",
    top: espaciado.s,
    right: espaciado.s,
    backgroundColor: colores.blanco,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  agotadoTexto: { ...fuente, color: colores.negro, fontSize: 12, fontWeight: "700", letterSpacing: 0.4 },
  cuerpo: { padding: espaciado.l, gap: espaciado.xs },
  fila: { flexDirection: "row", alignItems: "center", gap: espaciado.xs },
  pie: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: espaciado.xs },
  organizador: { flex: 1, gap: 2 },
  precio: { alignItems: "flex-end" },
  desde: { ...fuente, fontSize: 12, color: colores.textoSecundario },
  precioTexto: { ...fuente, fontSize: 20, fontWeight: "700", letterSpacing: 0.35, color: colores.primarioOscuro },
});
