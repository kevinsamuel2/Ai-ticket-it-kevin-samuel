import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAvisos } from "../context/AvisosContext";
import { mensajeDeError } from "../services/api";
import { dejarDeSeguirOrganizador, seguirOrganizador } from "../services/seguidos.service";
import { colores, fuente } from "../theme";

// "Seguir" / "Siguiendo" para un organizador, como en la ficha de un evento de Punch. Cambia al instante al tocarlo
// y, si el backend responde con error, vuelve al estado anterior y avisa.
export function BotonSeguir({ organizadorId, nombre, loSigo, onCambio }) {
  const [siguiendo, setSiguiendo] = useState(loSigo);
  const [enCurso, setEnCurso] = useState(false);
  const { mostrarError, mostrarExito } = useAvisos();

  // Si la pantalla recarga y llega otro valor del backend, se respeta
  useEffect(() => setSiguiendo(loSigo), [loSigo]);

  const alternar = async () => {
    const nuevoValor = !siguiendo;
    setSiguiendo(nuevoValor);
    setEnCurso(true);
    try {
      await (nuevoValor ? seguirOrganizador(organizadorId) : dejarDeSeguirOrganizador(organizadorId));
      mostrarExito(nuevoValor ? `Ahora seguís a ${nombre}` : `Dejaste de seguir a ${nombre}`);
      onCambio?.(nuevoValor);
    } catch (e) {
      setSiguiendo(!nuevoValor);
      mostrarError(mensajeDeError(e));
    } finally {
      setEnCurso(false);
    }
  };

  return (
    <Pressable
      onPress={alternar}
      disabled={enCurso}
      accessibilityRole="button"
      accessibilityLabel={siguiendo ? `Dejar de seguir a ${nombre}` : `Seguir a ${nombre}`}
      accessibilityState={{ selected: siguiendo, busy: enCurso }}
      style={({ pressed }) => [styles.boton, siguiendo && styles.siguiendo, pressed && styles.presionado]}
    >
      <Ionicons
        name={siguiendo ? "checkmark" : "add"}
        size={16}
        color={siguiendo ? colores.primarioClaro : colores.sobrePrimario}
      />
      <Text style={[styles.texto, siguiendo && styles.textoSiguiendo]}>{siguiendo ? "Siguiendo" : "Seguir"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1.5,
    borderColor: colores.primario,
    backgroundColor: colores.primario,
  },
  siguiendo: { backgroundColor: colores.primarioSuave },
  presionado: { opacity: 0.7 },
  texto: { ...fuente, fontSize: 13, fontWeight: "800", color: colores.sobrePrimario },
  textoSiguiendo: { color: colores.primarioClaro },
});
