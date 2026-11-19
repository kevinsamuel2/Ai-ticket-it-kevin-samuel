import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCarga } from "../../../hooks/useCarga";
import { useUsuario } from "../../../context/UsuarioContext";
import { useAvisos } from "../../../context/AvisosContext";
import { cambiarEstado, obtenerCompra } from "../../../services/compras.service";
import { mensajeDeError } from "../../../services/api";
import { Cargando, MensajeError } from "../../../components/EstadosDeCarga";
import { Boton } from "../../../components/Boton";
import { EstadoBadge } from "../../../components/EstadoBadge";
import { Foto } from "../../../components/Foto";
import { FormularioResenia } from "../../../components/FormularioResenia";
import { Estrellas } from "../../../components/ReseniaItem";
import { TituloDeSeccion } from "../../../components/TituloDeSeccion";
import { colores, espaciado, estilosDeEstado, radio, contorno, texto } from "../../../theme";
import { confirmar } from "../../../utils/confirmar";
import {
  formatearDiaYHora,
  formatearFecha,
  formatearFechaCompleta,
  formatearPrecio,
  textoDiasRestantes,
} from "../../../utils/formato";

// Aviso que se muestra según el estado en que quedó la compra después de la acción
const MENSAJES_DE_EXITO = {
  CONFIRMADA: () => "¡Pago confirmado! Tus entradas con QR están en la pestaña Entradas.",
  UTILIZADA: () => "Entrada marcada como utilizada.",
  CANCELADA: () => "Compra cancelada. Las entradas volvieron a estar disponibles.",
  REEMBOLSADA: (compra) => `Compra cancelada. Te vamos a reembolsar ${formatearPrecio(compra.total)}.`,
};

export default function DetalleCompra() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { usuario } = useUsuario();
  const { datos: compra, error, recargar } = useCarga(useCallback(() => obtenerCompra(id), [id]));
  const [accionEnCurso, setAccionEnCurso] = useState(null);
  const { mostrarError, mostrarExito } = useAvisos();

  if (error) return <MensajeError mensaje={error} onReintentar={recargar} />;
  if (!compra) return <Cargando />;

  const esComprador = compra.comprador.id === usuario.id;
  const { acciones } = compra;

  const ejecutar = async (estado) => {
    setAccionEnCurso(estado);
    try {
      const actualizada = await cambiarEstado(compra.id, estado);
      mostrarExito(MENSAJES_DE_EXITO[actualizada.estado](actualizada));
      await recargar();
    } catch (e) {
      mostrarError(mensajeDeError(e));
    } finally {
      setAccionEnCurso(null);
    }
  };

  const cancelar = async () => {
    const yaPagada = compra.estado === "CONFIRMADA";
    const confirmado = await confirmar({
      titulo: "Cancelar compra",
      mensaje: yaPagada
        ? `Se te va a reembolsar ${formatearPrecio(compra.total)}. ¿Querés cancelar la compra?`
        : "¿Querés cancelar la compra?",
      textoConfirmar: "Cancelar compra",
    });
    if (confirmado) ejecutar("CANCELADA");
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Stack.Screen options={{ title: `Compra #${compra.id}` }} />

      <View style={styles.tarjeta}>
        <Foto uri={compra.evento.imagen} style={styles.imagen} tamanioDelIcono={48} />
        <View style={styles.cuerpoTarjeta}>
          <EstadoBadge estado={compra.estado} grande />
          {compra.diasParaElEvento !== null && (
            <View style={styles.diasRestantes}>
              <Ionicons name="hourglass-outline" size={18} color={colores.primarioClaro} />
              <Text style={styles.diasRestantesTexto}>{textoDiasRestantes(compra.diasParaElEvento)}</Text>
            </View>
          )}
          {compra.pagarAntesDe && (
            <View style={styles.plazo} accessibilityRole="alert">
              <Ionicons name="alarm-outline" size={18} color={colores.primarioClaro} />
              <Text style={styles.plazoTexto}>
                {esComprador ? "Pagá" : "El comprador tiene que pagar"} antes del{" "}
                {formatearDiaYHora(compra.pagarAntesDe)} o la compra se cancela automáticamente.
              </Text>
            </View>
          )}
          <Text style={texto.titulo} onPress={() => router.push(`/eventos/${compra.evento.id}`)}>
            {compra.evento.nombre}
          </Text>
          <Text style={texto.secundario}>{formatearFecha(compra.evento.fecha)}</Text>
          <View style={styles.separador} />
          <Fila etiqueta="Entrada" valor={`${compra.cantidad} × ${compra.tipoEntrada.nombre}`} />
          <Fila etiqueta="Precio unitario" valor={formatearPrecio(compra.tipoEntrada.precio)} />
          <Fila etiqueta="Total" valor={formatearPrecio(compra.total)} destacado />
          <Fila
            etiqueta={esComprador ? "Organiza" : "Comprador"}
            valor={esComprador ? compra.organizador.nombreCompleto : compra.comprador.nombreCompleto}
          />
        </View>
      </View>

      {/* Los QR no se muestran acá: una vez paga, cada entrada se ve en la pestaña Entradas */}
      {esComprador && compra.entradas.length > 0 && (
        <View style={styles.avisoDeEntradas}>
          <Ionicons name="qr-code-outline" size={22} color={colores.primarioClaro} />
          <View style={styles.flex}>
            <Text style={styles.tituloDelAviso}>
              {compra.entradas.length === 1
                ? "Tu entrada está lista"
                : `Tus ${compra.entradas.length} entradas están listas`}
            </Text>
            <Text style={texto.pie}>
              {compra.estado === "UTILIZADA"
                ? "Las encontrás en la pestaña Entradas."
                : "Los QR los encontrás en la pestaña Entradas."}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/entradas")}
            accessibilityRole="button"
            accessibilityLabel="Ir a la pestaña Entradas"
            style={({ pressed }) => [styles.irAEntradas, pressed && styles.presionada]}
          >
            <Text style={styles.irAEntradasTexto}>Ir a Entradas</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.acciones}>
        {acciones.puedePagar && (
          <Boton
            titulo={`Pagar ${formatearPrecio(compra.total)}`}
            icono="card"
            onPress={() => ejecutar("CONFIRMADA")}
            cargando={accionEnCurso === "CONFIRMADA"}
          />
        )}
        {acciones.puedeMarcarComoUtilizada && (
          <Boton
            titulo="Marcar entrada como utilizada"
            icono="scan"
            onPress={() => ejecutar("UTILIZADA")}
            cargando={accionEnCurso === "UTILIZADA"}
          />
        )}
        <Boton
          titulo={
            compra.cantidadMensajes > 0
              ? `Chat (${compra.cantidadMensajes})`
              : esComprador
                ? "Chat con el organizador"
                : "Chat con el comprador"
          }
          icono="chatbubbles-outline"
          variante="secundario"
          onPress={() => router.push(`/compras/${compra.id}/chat`)}
        />
        {acciones.puedeCancelar && (
          <Boton
            titulo="Cancelar compra"
            icono="close-circle-outline"
            variante="peligro"
            onPress={cancelar}
            cargando={accionEnCurso === "CANCELADA"}
          />
        )}
      </View>

      {acciones.puedeReseniar && (
        <View style={styles.seccion}>
          <Text style={texto.secundario}>
            {compra.evento.nombre} ya finalizó. Tu reseña se suma a la reputación de {compra.organizador.nombreCompleto}
            .
          </Text>
          <FormularioResenia compraId={compra.id} onReseniado={recargar} />
        </View>
      )}
      {compra.resenia && (
        <View style={styles.seccion}>
          <TituloDeSeccion>{esComprador ? "Tu reseña" : "Reseña del comprador"}</TituloDeSeccion>
          <View style={styles.resenia}>
            <Estrellas puntuacion={compra.resenia.puntuacion} tamanio={18} />
            <Text style={texto.cuerpo}>{compra.resenia.detalle}</Text>
          </View>
        </View>
      )}

      <View style={styles.seccion}>
        <TituloDeSeccion>Historial</TituloDeSeccion>
        {compra.historialEstados.map((cambio, indice) => (
          <View key={indice} style={styles.cambio}>
            <View style={[styles.punto, { backgroundColor: estilosDeEstado[cambio.estado].borde }]} />
            <View style={styles.flex}>
              <Text style={styles.cambioEstado}>{estilosDeEstado[cambio.estado].etiqueta}</Text>
              <Text style={texto.secundario}>
                {cambio.quien} · {formatearFechaCompleta(cambio.fechaHora)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Fila({ etiqueta, valor, destacado = false }) {
  return (
    <View style={styles.fila}>
      <Text style={texto.secundario}>{etiqueta}</Text>
      <Text style={[texto.cuerpo, destacado && styles.destacado]}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: espaciado.l, gap: espaciado.l, paddingBottom: espaciado.xl * 2 },
  tarjeta: {
    borderRadius: radio.l,
    borderCurve: "continuous",
    overflow: "hidden",
    backgroundColor: colores.superficie,
    ...contorno,
  },
  imagen: { width: "100%", aspectRatio: 16 / 7 },
  cuerpoTarjeta: { padding: espaciado.l, gap: espaciado.s },
  diasRestantes: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: espaciado.s,
    paddingHorizontal: espaciado.m,
    paddingVertical: espaciado.s,
    borderRadius: 999,
    backgroundColor: colores.primarioSuave,
  },
  diasRestantesTexto: { color: colores.primarioClaro, fontWeight: "700", fontSize: 16 },
  plazo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.s,
    padding: espaciado.m,
    borderRadius: radio.m + 4,
    borderCurve: "continuous",
    backgroundColor: colores.superficie,
    ...contorno,
  },
  plazoTexto: { flex: 1, fontSize: 15, fontWeight: "600", color: colores.texto },
  separador: { height: StyleSheet.hairlineWidth, backgroundColor: colores.borde, marginVertical: espaciado.xs },
  fila: { flexDirection: "row", justifyContent: "space-between" },
  destacado: { fontWeight: "700", color: colores.primarioClaro, fontSize: 17 },
  acciones: { gap: espaciado.m },
  avisoDeEntradas: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.m,
    padding: espaciado.m,
    borderRadius: radio.m + 4,
    borderCurve: "continuous",
    backgroundColor: colores.primarioSuave,
    borderWidth: 1,
    borderColor: colores.primario,
  },
  tituloDelAviso: { fontSize: 15, fontWeight: "800", color: colores.texto },
  irAEntradas: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: colores.primario,
  },
  irAEntradasTexto: { fontSize: 13, fontWeight: "800", color: colores.sobrePrimario },
  presionada: { opacity: 0.7 },
  seccion: { gap: espaciado.s },
  resenia: {
    gap: espaciado.xs,
    padding: espaciado.m,
    borderRadius: radio.m + 4,
    borderCurve: "continuous",
    backgroundColor: colores.superficie,
    ...contorno,
  },
  cambio: { flexDirection: "row", gap: espaciado.m, alignItems: "flex-start" },
  punto: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  flex: { flex: 1 },
  cambioEstado: { fontWeight: "600", color: colores.texto },
});
