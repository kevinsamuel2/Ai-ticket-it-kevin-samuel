import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colores, espaciado, fuente, radio } from "../theme";

// Input con etiqueta y mensaje de error, reutilizado en todos los formularios.
// Campo oscuro con borde fino que se pinta de verde al enfocarlo, como el buscador de Punch.
export function Campo({ etiqueta, error, ayuda, style, ...propsDelInput }) {
  const [enfocado, setEnfocado] = useState(false);
  return (
    <View style={[styles.contenedor, style]}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor={colores.textoApagado}
        selectionColor={colores.primario}
        {...propsDelInput}
        onFocus={(e) => {
          setEnfocado(true);
          propsDelInput.onFocus?.(e);
        }}
        onBlur={(e) => {
          setEnfocado(false);
          propsDelInput.onBlur?.(e);
        }}
        style={[styles.input, enfocado && styles.inputEnfocado, error && styles.inputConError]}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : (
        ayuda && <Text style={styles.ayuda}>{ayuda}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: espaciado.xs + 2 },
  etiqueta: { ...fuente, fontSize: 13, fontWeight: "600", color: colores.textoSecundario, paddingLeft: espaciado.xs },
  input: {
    ...fuente,
    minHeight: 50,
    paddingHorizontal: espaciado.l,
    borderRadius: radio.m + 2,
    borderCurve: "continuous",
    borderWidth: 1.5,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    fontSize: 16,
    color: colores.texto,
    outlineStyle: "none",
  },
  inputEnfocado: { borderColor: colores.primario },
  inputConError: { borderColor: colores.peligro },
  error: { ...fuente, fontSize: 13, color: colores.peligro, paddingLeft: espaciado.xs },
  ayuda: { ...fuente, fontSize: 13, color: colores.textoSecundario, paddingLeft: espaciado.xs },
});
