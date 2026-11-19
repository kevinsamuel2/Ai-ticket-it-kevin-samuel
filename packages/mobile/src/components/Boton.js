import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores, espaciado, fuente, radio } from "../theme";

// Botones al estilo iOS: el principal es sólido y los demás son "tintados" (fondo suave con el color del texto)
const VARIANTES = {
  primario: { fondo: colores.primario, texto: colores.blanco },
  secundario: { fondo: colores.primarioSuave, texto: colores.primarioOscuro },
  peligro: { fondo: colores.peligroSuave, texto: colores.peligro },
};

export function Boton({ titulo, onPress, variante = "primario", icono, cargando = false, deshabilitado = false }) {
  const estilo = VARIANTES[variante];
  const inactivo = deshabilitado || cargando;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      style={({ pressed }) => [
        styles.boton,
        { backgroundColor: estilo.fondo },
        pressed && styles.presionado,
        inactivo && styles.atenuado,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={estilo.texto} />
      ) : (
        <>
          {icono && <Ionicons name={icono} size={20} color={estilo.texto} />}
          <Text style={[styles.texto, { color: estilo.texto }]}>{titulo}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.s,
    minHeight: 50,
    paddingHorizontal: espaciado.l,
    borderRadius: radio.m + 2,
    borderCurve: "continuous",
  },
  texto: { ...fuente, fontSize: 17, fontWeight: "600", letterSpacing: -0.41 },
  // Como en iOS, al presionar el botón se atenúa y se achica apenas
  presionado: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  atenuado: { opacity: 0.4 },
});
