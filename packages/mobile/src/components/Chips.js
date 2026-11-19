import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores, espaciado, fuente } from "../theme";

// Fila horizontal de opciones donde se elige una (categorías, orden, estados). Como en Punch: cápsulas oscuras con
// borde fino y, la seleccionada, con borde y texto verdes. Cada opción puede llevar un ícono.
export function Chips({ opciones, seleccionada, onSeleccionar, etiquetaAccesible }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.fila}
      accessibilityLabel={etiquetaAccesible}
    >
      {opciones.map(({ valor, etiqueta, icono }) => {
        const activa = valor === seleccionada;
        return (
          <Pressable
            key={etiqueta}
            onPress={() => onSeleccionar(valor)}
            accessibilityRole="button"
            accessibilityLabel={etiqueta}
            accessibilityState={{ selected: activa }}
            style={({ pressed }) => [styles.chip, activa && styles.chipActivo, pressed && styles.presionado]}
          >
            {icono && (
              <Ionicons name={icono} size={15} color={activa ? colores.primarioClaro : colores.textoSecundario} />
            )}
            <Text style={[styles.texto, activa && styles.textoActivo]}>{etiqueta}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fila: { gap: espaciado.s, paddingHorizontal: espaciado.l },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderCurve: "continuous",
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  chipActivo: { backgroundColor: colores.primarioSuave, borderColor: colores.primario },
  presionado: { opacity: 0.7 },
  texto: { ...fuente, fontSize: 14, fontWeight: "600", letterSpacing: -0.1, color: colores.textoSecundario },
  textoActivo: { color: colores.primarioClaro, fontWeight: "700" },
});
