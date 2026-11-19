import { StyleSheet, Text, TextInput, View } from "react-native";
import { colores, espaciado, fuente, radio } from "../theme";

// Input con etiqueta y mensaje de error, reutilizado en todos los formularios.
// Al estilo iOS: campo relleno sin borde y la etiqueta chica arriba, como en los formularios agrupados.
export function Campo({ etiqueta, error, ayuda, oscuro = false, style, ...propsDelInput }) {
  return (
    <View style={[styles.contenedor, style]}>
      <Text style={[styles.etiqueta, oscuro && styles.etiquetaOscura]}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor={oscuro ? "#8E8E93" : "#8E8E93"}
        selectionColor={colores.primario}
        style={[styles.input, oscuro && styles.inputOscuro, error && styles.inputConError]}
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
  contenedor: { gap: espaciado.xs + 2 },
  etiqueta: { ...fuente, fontSize: 13, fontWeight: "500", color: colores.textoSecundario, paddingLeft: espaciado.xs },
  etiquetaOscura: { color: "#AEAEB2" },
  input: {
    ...fuente,
    minHeight: 50,
    paddingHorizontal: espaciado.l,
    borderRadius: radio.m + 2,
    borderCurve: "continuous",
    borderWidth: 1.5,
    borderColor: "transparent",
    backgroundColor: colores.superficie,
    fontSize: 17,
    color: colores.texto,
  },
  inputOscuro: { backgroundColor: colores.grisOscuro, color: colores.blanco },
  inputConError: { borderColor: colores.peligro },
  error: { ...fuente, fontSize: 13, color: colores.peligro, paddingLeft: espaciado.xs },
  ayuda: { ...fuente, fontSize: 13, color: colores.textoSecundario, paddingLeft: espaciado.xs },
  ayudaOscura: { color: "#8E8E93" },
});
