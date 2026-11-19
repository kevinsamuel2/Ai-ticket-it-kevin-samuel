import { StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores, espaciado, fuente, radio } from "../theme";

// Buscador de eventos de Inicio y Eventos: campo oscuro con la lupa verde, como el de la app de Punch
export function Buscador({ valor, onCambiar, onBuscar, placeholder = "Buscar eventos, artistas, lugares..." }) {
  return (
    <View style={styles.buscador}>
      <Ionicons name="search" size={18} color={colores.primario} />
      <TextInput
        value={valor}
        onChangeText={onCambiar}
        onSubmitEditing={onBuscar ? () => onBuscar(valor) : undefined}
        placeholder={placeholder}
        placeholderTextColor={colores.textoApagado}
        selectionColor={colores.primario}
        accessibilityLabel="Buscar eventos"
        returnKeyType="search"
        style={styles.input}
      />
      {valor.length > 0 && (
        <Ionicons
          name="close-circle"
          size={18}
          color={colores.textoSecundario}
          onPress={() => onCambiar("")}
          accessibilityRole="button"
          accessibilityLabel="Borrar búsqueda"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buscador: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.s + 2,
    marginHorizontal: espaciado.l,
    paddingHorizontal: espaciado.m + 2,
    minHeight: 50,
    borderRadius: radio.m + 2,
    borderCurve: "continuous",
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  input: { ...fuente, flex: 1, fontSize: 15, color: colores.texto, paddingVertical: espaciado.s, outlineStyle: "none" },
});
