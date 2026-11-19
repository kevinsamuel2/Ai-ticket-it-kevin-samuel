import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores, espaciado, fuente } from "../theme";

// Encabezado de una sección de Inicio: título chico en mayúsculas y gris a la izquierda y "Ver todo" en verde
export function CabeceraDeLista({ titulo, onVerTodo }) {
  return (
    <View style={styles.fila}>
      <Text accessibilityRole="header" style={styles.titulo}>
        {titulo}
      </Text>
      {onVerTodo && (
        <Pressable
          onPress={onVerTodo}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Ver todo: ${titulo}`}
          style={styles.verTodo}
        >
          <Text style={styles.verTodoTexto}>Ver todo</Text>
          <Ionicons name="chevron-forward" size={14} color={colores.primarioClaro} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: espaciado.l,
  },
  titulo: {
    ...fuente,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colores.textoSecundario,
  },
  verTodo: { flexDirection: "row", alignItems: "center", gap: 2 },
  verTodoTexto: { ...fuente, fontSize: 13, fontWeight: "700", color: colores.primarioClaro },
});
