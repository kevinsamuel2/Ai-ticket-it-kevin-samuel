import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colores, espaciado, fuente, radio } from "../theme";

// Botón de filtro con una lista que se abre desde abajo, como "Ubicación" y "Fecha" en el buscador de Punch.
// Muestra la opción elegida (en verde) o su nombre por defecto. `opciones` es [{ valor, etiqueta }] y el valor
// `null` es "sin filtro".
export function FiltroDesplegable({ icono, nombre, titulo = nombre, opciones, valor, onSeleccionar }) {
  const [abierto, setAbierto] = useState(false);
  const { bottom } = useSafeAreaInsets();
  const elegida = opciones.find((opcion) => opcion.valor === valor);
  const activo = valor !== null && elegida !== undefined;

  const elegir = (opcion) => {
    onSeleccionar(opcion.valor);
    setAbierto(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setAbierto(true)}
        accessibilityRole="button"
        accessibilityLabel={`${nombre}: ${activo ? elegida.etiqueta : "sin filtro"}`}
        accessibilityState={{ expanded: abierto, selected: activo }}
        style={({ pressed }) => [styles.boton, activo && styles.botonActivo, pressed && styles.presionado]}
      >
        <Ionicons name={icono} size={15} color={activo ? colores.primarioClaro : colores.textoSecundario} />
        <Text style={[styles.textoDelBoton, activo && styles.textoActivo]} numberOfLines={1}>
          {activo ? elegida.etiqueta : nombre}
        </Text>
        <Ionicons name="chevron-down" size={14} color={activo ? colores.primarioClaro : colores.textoSecundario} />
      </Pressable>

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <View style={styles.fondo}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setAbierto(false)}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          />
          <View style={[styles.hoja, { paddingBottom: Math.max(bottom, espaciado.l) }]}>
            <View style={styles.agarre} />
            <Text accessibilityRole="header" style={styles.titulo}>
              {titulo}
            </Text>
            <ScrollView style={styles.lista} bounces={false}>
              {opciones.map((opcion) => {
                const seleccionada = opcion.valor === valor;
                return (
                  <Pressable
                    key={String(opcion.valor)}
                    onPress={() => elegir(opcion)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: seleccionada }}
                    accessibilityLabel={opcion.etiqueta}
                    style={({ pressed }) => [styles.opcion, pressed && styles.opcionPresionada]}
                  >
                    <Text style={[styles.textoDeLaOpcion, seleccionada && styles.textoActivo]}>{opcion.etiqueta}</Text>
                    {seleccionada && <Ionicons name="checkmark-circle" size={22} color={colores.primario} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderCurve: "continuous",
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  botonActivo: { backgroundColor: colores.primarioSuave, borderColor: colores.primario },
  presionado: { opacity: 0.7 },
  textoDelBoton: { ...fuente, fontSize: 14, fontWeight: "600", color: colores.textoSecundario, maxWidth: 160 },
  textoActivo: { color: colores.primarioClaro, fontWeight: "700" },
  fondo: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.65)" },
  hoja: {
    maxHeight: "70%",
    paddingTop: espaciado.s,
    paddingHorizontal: espaciado.l,
    borderTopLeftRadius: radio.l + 8,
    borderTopRightRadius: radio.l + 8,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  agarre: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: espaciado.m,
    backgroundColor: colores.borde,
  },
  titulo: { ...fuente, fontSize: 20, fontWeight: "800", letterSpacing: -0.4, color: colores.texto, marginBottom: 4 },
  lista: { flexGrow: 0 },
  opcion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colores.separador,
  },
  opcionPresionada: { opacity: 0.6 },
  textoDeLaOpcion: { ...fuente, fontSize: 16, fontWeight: "600", color: colores.texto },
});
