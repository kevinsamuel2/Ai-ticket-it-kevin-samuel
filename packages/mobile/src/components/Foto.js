import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colores } from "../theme";
import { urlDeImagen } from "../utils/imagen";

// Foto de un evento. Siempre se recorta para llenar su recuadro (contentFit "cover") en vez de estirarse, así una foto
// horizontal no se deforma en una miniatura vertical. Muestra un fondo oscuro mientras carga, aparece con una pequeña
// transición, queda en caché y, si no hay foto o falla la descarga, muestra el ícono del ticket.
export function Foto({ uri, style, tamanioDelIcono = 32, ...resto }) {
  const [fallo, setFallo] = useState(false);

  if (!uri || fallo) {
    return (
      <View style={[styles.vacia, style]} accessibilityElementsHidden importantForAccessibility="no">
        <Ionicons name="ticket-outline" size={tamanioDelIcono} color={colores.primario} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: urlDeImagen(uri) }}
      style={[styles.foto, style]}
      contentFit="cover"
      contentPosition="center"
      transition={200}
      cachePolicy="memory-disk"
      onError={() => setFallo(true)}
      accessibilityIgnoresInvertColors
      {...resto}
    />
  );
}

const styles = StyleSheet.create({
  foto: { backgroundColor: colores.relleno },
  vacia: { backgroundColor: colores.relleno, alignItems: "center", justifyContent: "center" },
});
