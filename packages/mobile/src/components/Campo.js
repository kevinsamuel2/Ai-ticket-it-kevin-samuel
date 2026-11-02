import { StyleSheet, Text, TextInput, View } from "react-native";
import { colores, espaciado, radio } from "../theme";

// Input con etiqueta y mensaje de error, reutilizado en todos los formularios
export function Campo({ etiqueta, error, ayuda, oscuro = false, style, ...propsDelInput }) {
  return (
    <View style={[styles.contenedor, style]}>
      <Text style={[styles.etiqueta, oscuro && styles.etiquetaOscura]}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor={colores.textoSecundario}
        style={[styles.input, error && styles.inputConError]}
        {...propsDelInput}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : (
        ayuda && <Text style={[styles.ayuda, oscuro && styles.ayudaOscura]}>{ayuda}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: espaciado.xs },
  etiqueta: { fontSize: 14, fontWeight: "600", color: colores.texto },
  etiquetaOscura: { color: colores.blanco },
  input: {
    minHeight: 48,
    paddingHorizontal: espaciado.m,
    borderRadius: radio.m,
    borderWidth: 1.5,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    fontSize: 16,
    color: colores.texto,
  },
  inputConError: { borderColor: colores.peligro },
  error: { fontSize: 13, color: colores.peligro },
  ayuda: { fontSize: 12, color: colores.textoSecundario },
  ayudaOscura: { color: "#A1A1AA" },
});
