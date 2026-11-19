import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CodigoQR } from "./CodigoQR";
import { colores, contorno, espaciado, fuente, radio, texto } from "../theme";
import { formatearFecha } from "../utils/formato";

const TAMANIO_QR = 196;

// Lo que se codifica en el QR de una entrada: su código (que emite el backend) más la compra y el evento, para que
// quien controla el acceso identifique esa entrada puntual entre las que se compraron juntas
export function contenidoDelQR(compra, entrada) {
  return `aiticketit://entrada/${entrada.codigo}?compra=${compra.id}&evento=${compra.evento.id}&entrada=${entrada.numero}&de=${compra.cantidad}`;
}

// Una entrada digital al estilo Punch: tarjeta oscura con los datos del evento, una línea punteada con muescas como las
// de un ticket y el QR sobre fondo blanco para que se lea bien. Cada entrada comprada tiene su propia tarjeta y su
// propio QR (una compra de 3 entradas muestra 3). Una entrada ya usada se muestra apagada.
export function EntradaConQR({ compra, entrada }) {
  const utilizada = compra.estado === "UTILIZADA";

  return (
    <View style={styles.entrada} accessible={false}>
      <View style={styles.datos}>
        <Text style={texto.etiqueta}>
          {utilizada ? "Entrada utilizada" : `Entrada ${entrada.numero} de ${compra.cantidad}`}
        </Text>
        <Text style={styles.evento} numberOfLines={2}>
          {compra.evento.nombre}
        </Text>
        <View style={styles.fila}>
          <Ionicons name="calendar-outline" size={14} color={colores.textoSecundario} />
          <Text style={texto.secundario}>{formatearFecha(compra.evento.fecha)}</Text>
        </View>
        <View style={styles.fila}>
          <Ionicons name="ticket-outline" size={14} color={colores.textoSecundario} />
          <Text style={texto.secundario}>{compra.tipoEntrada.nombre}</Text>
        </View>
      </View>

      <View style={styles.corte}>
        <View style={[styles.muesca, styles.muescaIzquierda]} />
        <View style={styles.punteada} />
        <View style={[styles.muesca, styles.muescaDerecha]} />
      </View>

      <View style={styles.qr}>
        <View style={[styles.marcoQR, utilizada && styles.apagado]}>
          <CodigoQR
            contenido={contenidoDelQR(compra, entrada)}
            tamanio={TAMANIO_QR}
            accessibilityLabel={`Código QR de la entrada ${entrada.codigo}`}
          />
        </View>
        <Text style={styles.codigo} selectable>
          {entrada.codigo}
        </Text>
        <Text style={[texto.pie, styles.centrado]}>
          {utilizada
            ? "Esta entrada ya se usó para ingresar."
            : "Mostrá este código en el ingreso. Cada entrada tiene su propio QR y se escanea por separado."}
        </Text>
      </View>
    </View>
  );
}

const MUESCA = 22;

const styles = StyleSheet.create({
  entrada: {
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    borderCurve: "continuous",
    overflow: "hidden",
    ...contorno,
    borderColor: colores.primario,
  },
  datos: { padding: espaciado.l, gap: espaciado.xs },
  evento: { ...fuente, fontSize: 22, fontWeight: "800", letterSpacing: -0.4, color: colores.texto },
  fila: { flexDirection: "row", alignItems: "center", gap: espaciado.xs },
  // Las muescas tienen el color del fondo de la pantalla para parecer recortes del ticket
  corte: { height: MUESCA, justifyContent: "center" },
  punteada: {
    marginHorizontal: MUESCA,
    borderTopWidth: 2,
    borderColor: colores.borde,
    borderStyle: "dashed",
  },
  muesca: {
    position: "absolute",
    width: MUESCA,
    height: MUESCA,
    borderRadius: MUESCA / 2,
    backgroundColor: colores.fondo,
    borderWidth: 1,
    borderColor: colores.primario,
  },
  muescaIzquierda: { left: -MUESCA / 2 - 1 },
  muescaDerecha: { right: -MUESCA / 2 - 1 },
  qr: { alignItems: "center", gap: espaciado.m, padding: espaciado.l, paddingTop: espaciado.m },
  marcoQR: { padding: espaciado.m, borderRadius: radio.m, backgroundColor: colores.blanco },
  apagado: { opacity: 0.25 },
  codigo: { ...fuente, fontSize: 18, fontWeight: "800", letterSpacing: 3, color: colores.texto },
  centrado: { textAlign: "center" },
});
