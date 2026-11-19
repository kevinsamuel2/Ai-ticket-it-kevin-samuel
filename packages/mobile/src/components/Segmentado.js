import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores, espaciado, fuente } from "../theme";

// Selector de dos o tres opciones en una cápsula (Próximos / Pasados en Entradas): la elegida se marca en verde
export function Segmentado({ opciones, valor, onCambiar, etiquetaAccesible }) {
  return (
    <View style={styles.contenedor} accessibilityRole="tablist" accessibilityLabel={etiquetaAccesible}>
      {opciones.map(({ valor: opcion, etiqueta, icono }) => {
        const activa = opcion === valor;
        const color = activa ? colores.primarioClaro : colores.textoSecundario;
        return (
          <Pressable
            key={opcion}
            onPress={() => onCambiar(opcion)}
            accessibilityRole="tab"
            accessibilityLabel={etiqueta}
            accessibilityState={{ selected: activa }}
            style={[styles.opcion, activa && styles.opcionActiva]}
          >
            {icono && <Ionicons name={icono} size={15} color={color} />}
            <Text style={[styles.texto, { color }]}>{etiqueta}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: "row",
    gap: espaciado.xs,
    marginHorizontal: espaciado.l,
    padding: 4,
    borderRadius: 16,
    borderCurve: "continuous",
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  opcion: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "transparent",
  },
  opcionActiva: { backgroundColor: colores.primarioSuave, borderColor: colores.primario },
  texto: { ...fuente, fontSize: 14, fontWeight: "700" },
});
