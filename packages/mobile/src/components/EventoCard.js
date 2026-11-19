import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BotonGuardar } from "./BotonGuardar";
import { Foto } from "./Foto";
import { Puntaje } from "./Puntaje";
import { colores, contorno, espaciado, fuente, radio, texto } from "../theme";
import { formatearFecha, formatearPrecio } from "../utils/formato";

// Tarjeta compacta de evento como la de la app de Punch: foto a la izquierda, categoría en verde, nombre, fecha y
// lugar, el marcador para guardar arriba a la derecha y la flecha verde para ver las entradas.
// El marcador va fuera del Pressable de la tarjeta para no anidar un botón dentro de otro.
export function EventoCard({ evento, onPress }) {
  return (
    <View style={styles.tarjeta}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${evento.nombre}, ${formatearFecha(evento.fecha)}, desde ${formatearPrecio(evento.precioMinimo)}`}
        style={({ pressed }) => [styles.contenido, pressed && styles.presionada]}
      >
        <View style={styles.marcoDeLaFoto}>
          <Foto uri={evento.imagen} style={StyleSheet.absoluteFill} />
          {evento.agotado && (
            <View style={styles.agotado}>
              <Text style={styles.agotadoTexto}>AGOTADO</Text>
            </View>
          )}
        </View>

        <View style={styles.cuerpo}>
          <Text style={[texto.etiqueta, styles.categoria]} numberOfLines={1}>
            {evento.categoria}
          </Text>
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
          {evento.lugar && (
            <View style={styles.fila}>
              <Ionicons name="location-outline" size={13} color={colores.textoSecundario} />
              <Text style={[texto.pie, styles.fecha]} numberOfLines={1}>
                {[evento.lugar, evento.ciudad].filter(Boolean).join(" · ")}
              </Text>
            </View>
          )}
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

      <View style={styles.guardar}>
        <BotonGuardar eventoId={evento.id} nombre={evento.nombre} tamanio={32} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    borderCurve: "continuous",
    ...contorno,
  },
  contenido: { flexDirection: "row", gap: espaciado.m, padding: espaciado.m - 2, borderRadius: radio.l },
  presionada: { opacity: 0.85 },
  marcoDeLaFoto: {
    width: 108,
    minHeight: 128,
    borderRadius: radio.m,
    borderCurve: "continuous",
    overflow: "hidden",
    backgroundColor: colores.relleno,
  },
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
  // Deja lugar a la derecha para el marcador que se dibuja encima
  categoria: { paddingRight: 40, paddingTop: 2 },
  nombre: { ...fuente, fontSize: 17, fontWeight: "800", letterSpacing: -0.3, color: colores.texto },
  fila: { flexDirection: "row", alignItems: "center", gap: 5 },
  fecha: { flex: 1 },
  pie: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: espaciado.xs,
  },
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
  guardar: { position: "absolute", top: espaciado.m - 2, right: espaciado.m - 2 },
});
