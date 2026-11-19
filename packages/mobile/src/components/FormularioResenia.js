import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Campo } from "./Campo";
import { Boton } from "./Boton";
import { reseniar } from "../services/compras.service";
import { mensajeDeError } from "../services/api";
import { useAvisos } from "../context/AvisosContext";
import { colores, espaciado, radio, sombra, texto } from "../theme";

const ETIQUETAS = ["", "Malo", "Regular", "Bueno", "Muy bueno", "Excelente"];

// Puntuación con estrellas (1 a 5) y comentario. Se muestra cuando la entrada ya se usó.
export function FormularioResenia({ compraId, onReseniado }) {
  const [puntuacion, setPuntuacion] = useState(0);
  const [detalle, setDetalle] = useState("");
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const { mostrarError, mostrarExito } = useAvisos();

  const enviar = async () => {
    const erroresDeValidacion = {};
    if (puntuacion === 0) erroresDeValidacion.puntuacion = "Elegí una puntuación";
    if (!detalle.trim()) erroresDeValidacion.detalle = "Contanos cómo fue tu experiencia";
    setErrores(erroresDeValidacion);
    if (Object.keys(erroresDeValidacion).length > 0) return;

    setEnviando(true);
    try {
      await reseniar(compraId, { detalle: detalle.trim(), puntuacion });
      mostrarExito("¡Gracias por tu reseña!");
      onReseniado();
    } catch (e) {
      mostrarError(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={styles.tarjeta}>
      <Text style={texto.subtitulo}>¿Cómo estuvo el evento?</Text>
      <View style={styles.estrellas} accessibilityRole="radiogroup" accessibilityLabel="Puntuación">
        {[1, 2, 3, 4, 5].map((valor) => (
          <Pressable
            key={valor}
            onPress={() => setPuntuacion(valor)}
            accessibilityRole="radio"
            accessibilityLabel={`${valor} estrellas, ${ETIQUETAS[valor]}`}
            accessibilityState={{ checked: puntuacion === valor }}
            hitSlop={6}
          >
            <Ionicons name={valor <= puntuacion ? "star" : "star-outline"} size={34} color={colores.estrella} />
          </Pressable>
        ))}
      </View>
      <Text style={[texto.secundario, styles.centrado]}>{ETIQUETAS[puntuacion] || "Tocá una estrella"}</Text>
      {errores.puntuacion && <Text style={styles.error}>{errores.puntuacion}</Text>}
      <Campo
        etiqueta="Comentario"
        value={detalle}
        onChangeText={setDetalle}
        error={errores.detalle}
        placeholder="¿Qué te gustó? ¿Qué se podría mejorar?"
        multiline
        maxLength={500}
        style={styles.comentario}
      />
      <Boton titulo="Enviar reseña" icono="star" onPress={enviar} cargando={enviando} />
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    gap: espaciado.s,
    padding: espaciado.l,
    borderRadius: radio.l,
    borderCurve: "continuous",
    backgroundColor: colores.superficie,
    ...sombra,
  },
  estrellas: { flexDirection: "row", justifyContent: "center", gap: espaciado.s },
  centrado: { textAlign: "center" },
  comentario: { marginTop: espaciado.xs },
  error: { color: colores.peligro, fontSize: 13 },
});
