import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colores, espaciado, texto } from "../theme";

// Título grande de las pantallas principales, como el "large title" de iOS.
// Respeta la zona segura de arriba (notch) y puede llevar una acción a la derecha.
export function EncabezadoGrande({ titulo, children }) {
  const { top } = useSafeAreaInsets();
  return (
    <View style={[styles.contenedor, { paddingTop: top + espaciado.m }]}>
      <Text accessibilityRole="header" style={[texto.grande, styles.titulo]} numberOfLines={1}>
        {titulo}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.m,
    paddingHorizontal: espaciado.l,
    paddingBottom: espaciado.s,
    backgroundColor: colores.fondo,
  },
  titulo: { flex: 1 },
});
