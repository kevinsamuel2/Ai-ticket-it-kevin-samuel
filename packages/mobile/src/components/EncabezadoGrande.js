import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colores, espaciado, texto } from "../theme";

// Título grande de las pantallas principales, con la barra verde a la izquierda que usa Punch en sus secciones.
// Respeta la zona segura de arriba (notch) y puede llevar una acción a la derecha.
export function EncabezadoGrande({ titulo, children }) {
  const { top } = useSafeAreaInsets();
  return (
    <View style={[styles.contenedor, { paddingTop: top + espaciado.m }]}>
      <View style={styles.izquierda}>
        <View style={styles.barra} />
        <Text accessibilityRole="header" style={[texto.grande, styles.titulo]} numberOfLines={1}>
          {titulo}
        </Text>
      </View>
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
    paddingBottom: espaciado.m,
    backgroundColor: colores.fondo,
  },
  izquierda: { flex: 1, flexDirection: "row", alignItems: "center", gap: espaciado.m },
  barra: { width: 4, height: 28, borderRadius: 2, backgroundColor: colores.primario },
  titulo: { flex: 1 },
});
