import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritos } from "../context/FavoritosContext";
import { colores } from "../theme";

// Marcador para guardar un evento en favoritos (el botón cuadrado con marcador de las tarjetas de Punch)
export function BotonGuardar({ eventoId, nombre, tamanio = 38 }) {
  const { ids, alternar } = useFavoritos();
  const guardado = ids.has(eventoId);
  return (
    <Pressable
      onPress={() => alternar(eventoId)}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={guardado ? `Quitar ${nombre} de favoritos` : `Guardar ${nombre} en favoritos`}
      accessibilityState={{ selected: guardado }}
      style={({ pressed }) => [
        styles.boton,
        { width: tamanio, height: tamanio },
        guardado && styles.guardado,
        pressed && styles.presionado,
      ]}
    >
      <Ionicons
        name={guardado ? "bookmark" : "bookmark-outline"}
        size={tamanio * 0.5}
        color={guardado ? colores.primario : colores.textoSecundario}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficieAlta,
  },
  guardado: { borderColor: colores.primario, backgroundColor: colores.primarioSuave },
  presionado: { opacity: 0.7, transform: [{ scale: 0.95 }] },
});
