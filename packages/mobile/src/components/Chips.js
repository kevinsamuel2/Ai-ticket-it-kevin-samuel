import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { colores, espaciado } from "../theme";

// Fila horizontal de opciones donde se elige una (categorías, orden, estados)
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
            style={[styles.chip, activa && styles.chipActivo]}
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
    paddingHorizontal: espaciado.m,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  chipActivo: { backgroundColor: colores.negro, borderColor: colores.negro },
  texto: { fontSize: 14, fontWeight: "600", color: colores.texto },
  textoActivo: { color: colores.primario },
});
