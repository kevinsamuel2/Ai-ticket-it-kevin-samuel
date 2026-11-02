import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { estilosDeEstado, espaciado } from "../theme";

// Etiqueta del estado de una compra: cada estado tiene su ícono y sus colores para distinguirlos de un vistazo
export function EstadoBadge({ estado, grande = false }) {
  const estilo = estilosDeEstado[estado];
  return (
    <View
      style={[styles.badge, { backgroundColor: estilo.fondo, borderColor: estilo.borde }, grande && styles.grande]}
      accessible
      accessibilityLabel={`Estado: ${estilo.etiqueta}`}
    >
      <Ionicons name={estilo.icono} size={grande ? 18 : 14} color={estilo.color} />
      <Text style={[styles.texto, { color: estilo.color }, grande && styles.textoGrande]}>{estilo.etiqueta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: espaciado.xs,
    paddingHorizontal: espaciado.s,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  grande: { paddingHorizontal: espaciado.m, paddingVertical: 6 },
  texto: { fontSize: 12, fontWeight: "700" },
  textoGrande: { fontSize: 15 },
});
