import { StyleSheet, Text, View } from "react-native";
import { colores } from "../theme";

// Círculo con las iniciales del usuario
export function Avatar({ nombreCompleto, tamanio = 44 }) {
  const iniciales = nombreCompleto
    .split(" ")
    .map((palabra) => palabra[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <View
      style={[styles.avatar, { width: tamanio, height: tamanio, borderRadius: tamanio / 2 }]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Text style={[styles.iniciales, { fontSize: tamanio * 0.38 }]}>{iniciales}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { backgroundColor: colores.primarioSuave, alignItems: "center", justifyContent: "center" },
  iniciales: { color: colores.primario, fontWeight: "700" },
});
