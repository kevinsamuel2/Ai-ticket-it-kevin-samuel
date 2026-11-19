import { useState } from "react";
import { Image, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { colores, espaciado } from "../theme";
import { urlDeImagen } from "../utils/imagen";

// Todas las imágenes del evento (Evento.multimedia del diagrama): se deslizan de costado, una por página
export function Galeria({ imagenes, nombre }) {
  const { width } = useWindowDimensions();
  const [actual, setActual] = useState(0);

  if (imagenes.length === 0) return null;

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setActual(Math.round(e.nativeEvent.contentOffset.x / width))}
        accessibilityLabel={`Imágenes de ${nombre}`}
      >
        {imagenes.map((url, indice) => (
          <Image
            key={url + indice}
            source={{ uri: urlDeImagen(url) }}
            style={[styles.imagen, { width }]}
            accessible
            accessibilityLabel={`Imagen ${indice + 1} de ${imagenes.length} de ${nombre}`}
          />
        ))}
      </ScrollView>
      {imagenes.length > 1 && (
        <View style={styles.puntos} importantForAccessibility="no-hide-descendants">
          {imagenes.map((url, indice) => (
            <View key={url + indice} style={[styles.punto, indice === actual && styles.puntoActual]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imagen: { aspectRatio: 16 / 9, backgroundColor: colores.primarioSuave },
  puntos: {
    position: "absolute",
    bottom: espaciado.s,
    alignSelf: "center",
    flexDirection: "row",
    gap: espaciado.xs,
  },
  punto: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.6)" },
  puntoActual: { backgroundColor: colores.primario },
});
