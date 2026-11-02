import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Puntaje } from "./Puntaje";
import { colores, espaciado, radio, texto } from "../theme";
import { formatearFecha, formatearPrecio } from "../utils/formato";

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
          <Image source={{ uri: evento.imagen }} style={styles.imagen} accessibilityIgnoresInvertColors />
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
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: "hidden",
  },
  presionada: { opacity: 0.85 },
  imagen: { width: "100%", aspectRatio: 16 / 8, backgroundColor: colores.primarioSuave },
  sinImagen: { alignItems: "center", justifyContent: "center" },
  categoria: {
    position: "absolute",
    top: espaciado.s,
    left: espaciado.s,
    backgroundColor: colores.negro,
    paddingHorizontal: espaciado.s,
    paddingVertical: 3,
    borderRadius: radio.s,
  },
  categoriaTexto: { color: colores.blanco, fontSize: 12, fontWeight: "700" },
  agotado: {
    position: "absolute",
    top: espaciado.s,
    right: espaciado.s,
    backgroundColor: colores.blanco,
    paddingHorizontal: espaciado.s,
    paddingVertical: 3,
    borderRadius: radio.s,
  },
  agotadoTexto: { color: colores.negro, fontSize: 12, fontWeight: "800" },
  cuerpo: { padding: espaciado.m, gap: espaciado.xs },
  fila: { flexDirection: "row", alignItems: "center", gap: espaciado.xs },
  pie: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: espaciado.xs },
  organizador: { flex: 1, gap: 2 },
  precio: { alignItems: "flex-end" },
  desde: { fontSize: 11, color: colores.textoSecundario },
  precioTexto: { fontSize: 18, fontWeight: "800", color: colores.primarioOscuro },
});
