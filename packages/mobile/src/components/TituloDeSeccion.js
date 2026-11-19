import { StyleSheet, Text, View } from "react-native";
import { colores, espaciado, texto } from "../theme";

// Título de una sección dentro de una pantalla, con la barra verde a la izquierda (como "Próximos eventos" en Punch)
export function TituloDeSeccion({ children }) {
  return (
    <View style={styles.fila}>
      <View style={styles.barra} />
      <Text accessibilityRole="header" style={texto.subtitulo}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: espaciado.s + 2 },
  barra: { width: 3, height: 18, borderRadius: 2, backgroundColor: colores.primario },
});
