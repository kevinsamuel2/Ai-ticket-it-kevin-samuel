import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores, espaciado, radio } from "../theme";

const VARIANTES = {
  primario: { fondo: colores.primario, texto: "#FFFFFF", borde: colores.primario },
  secundario: { fondo: colores.superficie, texto: colores.primario, borde: colores.primario },
  peligro: { fondo: colores.superficie, texto: colores.peligro, borde: colores.peligro },
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
        { backgroundColor: estilo.fondo, borderColor: estilo.borde },
        (pressed || inactivo) && styles.atenuado,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={estilo.texto} />
      ) : (
        <>
          {icono && <Ionicons name={icono} size={18} color={estilo.texto} />}
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
    minHeight: 48,
    paddingHorizontal: espaciado.l,
    borderRadius: radio.m,
    borderWidth: 1.5,
  },
  texto: { fontSize: 16, fontWeight: "600" },
  atenuado: { opacity: 0.6 },
});
