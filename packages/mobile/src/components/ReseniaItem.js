import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores, espaciado, radio, texto } from "../theme";
import { formatearFechaCompleta } from "../utils/formato";

export function Estrellas({ puntuacion, tamanio = 14 }) {
  return (
    <View style={styles.estrellas} accessible accessibilityLabel={`${puntuacion} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((posicion) => (
        <Ionicons
          key={posicion}
          size={tamanio}
          color={colores.estrella}
          name={puntuacion >= posicion ? "star" : puntuacion >= posicion - 0.5 ? "star-half" : "star-outline"}
        />
      ))}
    </View>
  );
}

export function ReseniaItem({ resenia }) {
  return (
    <View style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <Text style={styles.autor}>{resenia.comprador}</Text>
        <Estrellas puntuacion={resenia.puntuacion} />
      </View>
      <Text style={texto.cuerpo}>{resenia.detalle}</Text>
      <Text style={texto.secundario}>
        {resenia.evento.nombre} · {formatearFechaCompleta(resenia.fecha).split(" ")[0]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  estrellas: { flexDirection: "row", gap: 1 },
  tarjeta: {
    gap: espaciado.xs,
    padding: espaciado.m,
    borderRadius: radio.m,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  encabezado: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  autor: { fontWeight: "700", color: colores.texto },
});
