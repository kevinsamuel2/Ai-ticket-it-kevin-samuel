import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colores, espaciado, radio } from "../theme";

const DURACION_MS = 3500;

const TIPOS = {
  error: { color: colores.peligro, icono: "alert-circle" },
  exito: { color: colores.primario, icono: "checkmark-circle" },
  info: { color: colores.blanco, icono: "information-circle" },
};

// Avisos globales (tipo "toast"): cualquier pantalla puede avisarle al usuario que algo salió mal
// o que una acción se completó, con mostrarError / mostrarExito, sin manejar su propio cartel
const AvisosContext = createContext(null);

export function AvisosProvider({ children }) {
  const [aviso, setAviso] = useState(null);
  const temporizador = useRef(null);

  const ocultar = useCallback(() => {
    clearTimeout(temporizador.current);
    setAviso(null);
  }, []);

  const mostrar = useCallback((tipo, mensaje) => {
    clearTimeout(temporizador.current);
    // Cada aviso tiene una clave nueva para que la animación de entrada se repita aunque el texto sea igual
    setAviso({ tipo, mensaje, clave: Date.now() });
    temporizador.current = setTimeout(() => setAviso(null), DURACION_MS);
  }, []);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const valor = useMemo(
    () => ({
      mostrarError: (mensaje) => mostrar("error", mensaje),
      mostrarExito: (mensaje) => mostrar("exito", mensaje),
      mostrarInfo: (mensaje) => mostrar("info", mensaje),
    }),
    [mostrar],
  );

  return (
    <AvisosContext.Provider value={valor}>
      {children}
      {aviso && <Aviso key={aviso.clave} tipo={aviso.tipo} mensaje={aviso.mensaje} onCerrar={ocultar} />}
    </AvisosContext.Provider>
  );
}

function Aviso({ tipo, mensaje, onCerrar }) {
  const { top } = useSafeAreaInsets();
  const estilo = TIPOS[tipo];

  return (
    <View pointerEvents="box-none" style={[styles.contenedor, { top: top + espaciado.s }]}>
      <Pressable
        onPress={onCerrar}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        accessibilityLabel={mensaje}
        accessibilityHint="Tocá para cerrar el aviso"
        style={[styles.aviso, { borderColor: estilo.color }]}
      >
        <Ionicons name={estilo.icono} size={22} color={estilo.color} />
        <Text style={styles.texto}>{mensaje}</Text>
      </Pressable>
    </View>
  );
}

export function useAvisos() {
  const contexto = useContext(AvisosContext);
  if (!contexto) {
    throw new Error("useAvisos se tiene que usar dentro de un AvisosProvider");
  }
  return contexto;
}

const styles = StyleSheet.create({
  contenedor: { position: "absolute", left: espaciado.l, right: espaciado.l, zIndex: 1000, elevation: 10 },
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.m,
    paddingHorizontal: espaciado.l,
    paddingVertical: espaciado.m,
    borderRadius: radio.m,
    borderWidth: 1.5,
    backgroundColor: colores.superficieAlta,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  texto: { flex: 1, color: colores.blanco, fontSize: 15, fontWeight: "600" },
});
