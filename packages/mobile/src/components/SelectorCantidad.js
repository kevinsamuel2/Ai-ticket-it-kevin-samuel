import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores, espaciado, radio } from "../theme";

// Botones - / + que no dejan bajar de `minimo` ni pasar de `maximo` (el cupo disponible)
export function SelectorCantidad({ valor, minimo = 1, maximo, onCambiar }) {
  const puedeRestar = valor > minimo;
  const puedeSumar = valor < maximo;
  return (
    <View
      style={styles.fila}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Cantidad de entradas"
      accessibilityValue={{ min: minimo, max: maximo, now: valor }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={({ nativeEvent }) => {
        if (nativeEvent.actionName === "increment" && puedeSumar) onCambiar(valor + 1);
        if (nativeEvent.actionName === "decrement" && puedeRestar) onCambiar(valor - 1);
      }}
    >
      <Pressable
        onPress={() => onCambiar(valor - 1)}
        disabled={!puedeRestar}
        accessibilityLabel="Restar una entrada"
        style={[styles.boton, !puedeRestar && styles.deshabilitado]}
      >
        <Ionicons name="remove" size={20} color={colores.blanco} />
      </Pressable>
      <Text style={styles.valor}>{valor}</Text>
      <Pressable
        onPress={() => onCambiar(valor + 1)}
        disabled={!puedeSumar}
        accessibilityLabel="Sumar una entrada"
        style={[styles.boton, !puedeSumar && styles.deshabilitado]}
      >
        <Ionicons name="add" size={20} color={colores.blanco} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: espaciado.m },
  boton: {
    width: 40,
    height: 40,
    borderRadius: radio.m,
    backgroundColor: colores.negro,
    alignItems: "center",
    justifyContent: "center",
  },
  deshabilitado: { backgroundColor: "#A1A1AA" },
  valor: { minWidth: 28, textAlign: "center", fontSize: 20, fontWeight: "700", color: colores.texto },
});
