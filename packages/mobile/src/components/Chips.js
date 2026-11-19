import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { colores, espaciado, fuente } from "../theme";

// Fila horizontal de opciones donde se elige una (categorías, orden, estados).
// Cápsulas al estilo iOS: grises las inactivas y negra la seleccionada.
export function Chips({ opciones, seleccionada, onSeleccionar, etiquetaAccesible }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.fila}
      accessibilityLabel={etiquetaAccesible}
    >
      {opciones.map(({ valor, etiqueta }) => {
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colores.relleno,
  },
  chipActivo: { backgroundColor: colores.negro },
  presionado: { opacity: 0.7 },
  texto: { ...fuente, fontSize: 15, fontWeight: "500", letterSpacing: -0.24, color: colores.texto },
  textoActivo: { color: colores.blanco },
});
