import { useCallback, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
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
import { FormularioResenia } from "../../../components/FormularioResenia";
import { Estrellas } from "../../../components/ReseniaItem";
import { colores, espaciado, estilosDeEstado, radio, texto } from "../../../theme";
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
  CONFIRMADA: () => "¡Pago confirmado! Ya tenés tus entradas.",
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
        {compra.evento.imagen && (
          <Image source={{ uri: compra.evento.imagen }} style={styles.imagen} accessibilityIgnoresInvertColors />
        )}
        <View style={styles.cuerpoTarjeta}>
          <EstadoBadge estado={compra.estado} grande />
          {compra.diasParaElEvento !== null && (
            <View style={styles.diasRestantes}>
              <Ionicons name="hourglass-outline" size={18} color={colores.blanco} />
              <Text style={styles.diasRestantesTexto}>{textoDiasRestantes(compra.diasParaElEvento)}</Text>
            </View>
          )}
          {compra.pagarAntesDe && (
            <View style={styles.plazo} accessibilityRole="alert">
              <Ionicons name="alarm-outline" size={18} color={colores.negro} />
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

      {acciones.puedeReseniar && <FormularioResenia compraId={compra.id} onReseniado={recargar} />}
      {compra.resenia && (
        <View style={styles.seccion}>
          <Text style={texto.subtitulo}>{esComprador ? "Tu reseña" : "Reseña del comprador"}</Text>
          <View style={styles.resenia}>
            <Estrellas puntuacion={compra.resenia.puntuacion} tamanio={18} />
            <Text style={texto.cuerpo}>{compra.resenia.detalle}</Text>
          </View>
        </View>
      )}

      <View style={styles.seccion}>
        <Text style={texto.subtitulo}>Historial</Text>
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
    overflow: "hidden",
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
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
    borderRadius: radio.m,
    backgroundColor: colores.negro,
  },
  diasRestantesTexto: { color: colores.blanco, fontWeight: "800", fontSize: 16 },
  plazo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.s,
    padding: espaciado.m,
    borderRadius: radio.m,
    borderWidth: 1.5,
    borderColor: colores.negro,
    backgroundColor: colores.superficie,
  },
  plazoTexto: { flex: 1, fontSize: 14, fontWeight: "600", color: colores.texto },
  separador: { height: 1, backgroundColor: colores.borde, marginVertical: espaciado.xs },
  fila: { flexDirection: "row", justifyContent: "space-between" },
  destacado: { fontWeight: "800", color: colores.primarioOscuro, fontSize: 17 },
  acciones: { gap: espaciado.m },
  seccion: { gap: espaciado.s },
  resenia: {
    gap: espaciado.xs,
    padding: espaciado.m,
    borderRadius: radio.m,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  cambio: { flexDirection: "row", gap: espaciado.m, alignItems: "flex-start" },
  punto: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  flex: { flex: 1 },
  cambioEstado: { fontWeight: "700", color: colores.texto },
});
