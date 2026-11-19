import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { EstadoBadge } from "./EstadoBadge";
import { Foto } from "./Foto";
import { colores, contorno, espaciado, fuente, radio, texto } from "../theme";
import { formatearDiaYHora, formatearFecha, formatearPrecio, textoDiasRestantes } from "../utils/formato";

// Compra con formato de ticket, como en "Mis Tickets" de Punch: foto con el nombre del evento y el estado, los datos
// de la compra y, abajo, el botón para ver los QR (uno por cada entrada). Tocar la tarjeta abre el detalle de la compra
// y tocar el botón del QR abre sus entradas. Si la ve el organizador (mostrarComprador) en lugar del QR se muestra
// quién compró.
export function CompraCard({ compra, onPress, onVerEntradas, mostrarComprador = false }) {
  const cantidadDeEntradas = compra.entradas?.length ?? 0;
  const tieneQR = !mostrarComprador && cantidadDeEntradas > 0 && Boolean(onVerEntradas);

  let etiquetaDelPie = "COMPRA";
  let valorDelPie = `#${compra.id}`;
  if (mostrarComprador) {
    etiquetaDelPie = "COMPRADOR";
    valorDelPie = compra.comprador.nombreCompleto;
  } else if (tieneQR) {
    etiquetaDelPie = "TUS ENTRADAS";
    valorDelPie = `${cantidadDeEntradas} ${cantidadDeEntradas === 1 ? "código QR" : "códigos QR"}`;
  }

  return (
    <View style={styles.tarjeta}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Compra de ${compra.evento.nombre}`}
        style={({ pressed }) => pressed && styles.presionada}
      >
        <View style={styles.portada}>
          <Foto uri={compra.evento.imagen} style={StyleSheet.absoluteFill} tamanioDelIcono={48} />
          <LinearGradient
            colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.9)"]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.estado}>
            <EstadoBadge estado={compra.estado} />
          </View>
          <Text style={styles.nombre} numberOfLines={2}>
            {compra.evento.nombre}
          </Text>
        </View>

        <View style={styles.cuerpo}>
          <Dato icono="calendar-outline" valor={formatearFecha(compra.evento.fecha)} />
          <Dato icono="ticket-outline" valor={`${compra.cantidad} × ${compra.tipoEntrada.nombre}`} />
          <Dato icono="cash-outline" valor={formatearPrecio(compra.total)} />
          {compra.diasParaElEvento !== null && (
            <Dato icono="hourglass-outline" valor={textoDiasRestantes(compra.diasParaElEvento)} destacado />
          )}
          {compra.pagarAntesDe && (
            <Dato
              icono="alarm-outline"
              valor={`${mostrarComprador ? "Vence el" : "Pagá antes del"} ${formatearDiaYHora(compra.pagarAntesDe)}`}
              destacado
            />
          )}
          {/* El comprador ve que el evento terminó y todavía falta su reseña (el organizador no necesita este aviso) */}
          {!mostrarComprador && compra.puedeReseniar && (
            <View style={styles.pendienteDeResenia}>
              <Ionicons name="star" size={14} color={colores.primarioClaro} />
              <Text style={styles.textoPendiente}>El evento finalizó: calificá tu experiencia</Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* El botón del QR es un Pressable aparte (no está adentro del de arriba) para no anidar botones */}
      <View style={styles.pie}>
        <View style={styles.izquierda}>
          <Text style={styles.etiquetaPie}>{etiquetaDelPie}</Text>
          <Text style={styles.valorPie} numberOfLines={1}>
            {valorDelPie}
          </Text>
        </View>
        {compra.cantidadMensajes > 0 && (
          <View style={styles.mensajes} accessibilityLabel={`${compra.cantidadMensajes} mensajes`}>
            <Ionicons name="chatbubble-outline" size={14} color={colores.textoSecundario} />
            <Text style={texto.pie}>{compra.cantidadMensajes}</Text>
          </View>
        )}
        {tieneQR && (
          <Pressable
            onPress={onVerEntradas}
            accessibilityRole="button"
            accessibilityLabel={`Ver ${cantidadDeEntradas === 1 ? "el QR" : `los ${cantidadDeEntradas} QR`} de ${compra.evento.nombre}`}
            style={({ pressed }) => [styles.escanear, pressed && styles.presionada]}
          >
            <View style={styles.textosDelQR}>
              <Text style={styles.etiquetaPie}>TAP PARA</Text>
              <Text style={styles.valorPie}>ESCANEAR</Text>
            </View>
            <View style={styles.botonQR}>
              <Ionicons name="qr-code-outline" size={24} color={colores.primarioClaro} />
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Dato({ icono, valor, destacado = false }) {
  return (
    <View style={styles.dato}>
      <Ionicons name={icono} size={15} color={destacado ? colores.primarioClaro : colores.textoSecundario} />
      <Text style={[texto.secundario, destacado && styles.datoDestacado]}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.l + 4,
    borderCurve: "continuous",
    overflow: "hidden",
    ...contorno,
  },
  presionada: { opacity: 0.85 },
  portada: { height: 150, justifyContent: "flex-end", padding: espaciado.l, backgroundColor: colores.relleno },
  estado: { position: "absolute", top: espaciado.m, left: espaciado.m },
  nombre: { ...fuente, fontSize: 24, lineHeight: 27, fontWeight: "800", letterSpacing: -0.5, color: colores.blanco },
  cuerpo: { gap: 6, padding: espaciado.l },
  dato: { flexDirection: "row", alignItems: "center", gap: espaciado.s },
  datoDestacado: { color: colores.primarioClaro, fontWeight: "700" },
  pendienteDeResenia: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: espaciado.s,
    borderRadius: radio.s,
    backgroundColor: colores.primarioSuave,
  },
  textoPendiente: { ...fuente, fontSize: 12, fontWeight: "700", color: colores.primarioClaro },
  pie: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.m,
    padding: espaciado.l,
    borderTopWidth: 1,
    borderTopColor: colores.separador,
  },
  izquierda: { flex: 1, gap: 2 },
  etiquetaPie: { ...fuente, fontSize: 10, fontWeight: "800", letterSpacing: 1, color: colores.textoApagado },
  valorPie: { ...fuente, fontSize: 15, fontWeight: "800", letterSpacing: 0.3, color: colores.texto },
  escanear: { flexDirection: "row", alignItems: "center", gap: espaciado.m },
  textosDelQR: { alignItems: "flex-end", gap: 2 },
  mensajes: { flexDirection: "row", alignItems: "center", gap: 3 },
  botonQR: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: 1.5,
    borderColor: colores.primario,
    backgroundColor: colores.primarioSuave,
  },
});
