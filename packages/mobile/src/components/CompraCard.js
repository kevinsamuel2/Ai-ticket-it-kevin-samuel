import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EstadoBadge } from "./EstadoBadge";
import { colores, espaciado, radio, texto } from "../theme";
import { formatearFecha, formatearPrecio, textoDiasRestantes } from "../utils/formato";

// Resumen de una compra: estado, días para el evento (si está confirmada), entradas y total
export function CompraCard({ compra, onPress, mostrarComprador = false }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Compra de ${compra.evento.nombre}`}
      style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}
    >
      {compra.evento.imagen && (
        <Image source={{ uri: compra.evento.imagen }} style={styles.imagen} accessibilityIgnoresInvertColors />
      )}
      <View style={styles.cuerpo}>
        <View style={styles.encabezado}>
          <EstadoBadge estado={compra.estado} />
          {compra.diasParaElEvento !== null && (
            <Text style={styles.dias}>{textoDiasRestantes(compra.diasParaElEvento)}</Text>
          )}
        </View>
        <Text style={texto.subtitulo} numberOfLines={1}>
          {mostrarComprador ? compra.comprador.nombreCompleto : compra.evento.nombre}
        </Text>
        <Text style={texto.secundario}>
          {mostrarComprador ? `Compró el ${formatearFecha(compra.fechaCompra)}` : formatearFecha(compra.evento.fecha)}
        </Text>
        <View style={styles.pie}>
          <Text style={texto.secundario}>
            {compra.cantidad} × {compra.tipoEntrada.nombre}
          </Text>
          <View style={styles.derecha}>
            {compra.cantidadMensajes > 0 && (
              <View style={styles.mensajes} accessibilityLabel={`${compra.cantidadMensajes} mensajes`}>
                <Ionicons name="chatbubble-outline" size={14} color={colores.textoSecundario} />
                <Text style={texto.secundario}>{compra.cantidadMensajes}</Text>
              </View>
            )}
            <Text style={styles.total}>{formatearPrecio(compra.total)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: "hidden",
  },
  presionada: { opacity: 0.85 },
  imagen: { width: 88, backgroundColor: colores.primarioSuave },
  cuerpo: { flex: 1, padding: espaciado.m, gap: 3 },
  encabezado: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: espaciado.s },
  dias: { fontSize: 13, fontWeight: "800", color: colores.primarioOscuro },
  pie: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  derecha: { flexDirection: "row", alignItems: "center", gap: espaciado.m },
  mensajes: { flexDirection: "row", alignItems: "center", gap: 3 },
  total: { fontWeight: "800", color: colores.texto },
});
