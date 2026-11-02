import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { enviarMensaje, listarMensajes } from "../../../services/compras.service";
import { mensajeDeError } from "../../../services/api";
import { Cargando, MensajeError, SinResultados } from "../../../components/EstadosDeCarga";
import { colores, espaciado, radio, texto } from "../../../theme";
import { formatearFechaCompleta } from "../../../utils/formato";

const SEGUNDOS_ENTRE_ACTUALIZACIONES = 5;

export default function Chat() {
  const { id } = useLocalSearchParams();
  const [mensajes, setMensajes] = useState(null);
  const [error, setError] = useState(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const lista = useRef(null);

  const actualizar = useCallback(async () => {
    try {
      setMensajes(await listarMensajes(id));
      setError(null);
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }, [id]);

  // Mientras la pantalla está abierta se buscan mensajes nuevos cada tanto (polling), así se ve
  // la respuesta del otro sin tener que salir y volver a entrar
  useFocusEffect(
    useCallback(() => {
      actualizar();
      const intervalo = setInterval(actualizar, SEGUNDOS_ENTRE_ACTUALIZACIONES * 1000);
      return () => clearInterval(intervalo);
    }, [actualizar]),
  );

  useEffect(() => {
    if (mensajes?.length) lista.current?.scrollToEnd({ animated: true });
  }, [mensajes?.length]);

  const enviar = async () => {
    const mensaje = texto.trim();
    if (!mensaje) return;
    setEnviando(true);
    try {
      const enviado = await enviarMensaje(id, mensaje);
      setMensajes((anteriores) => [...(anteriores ?? []), enviado]);
      setTexto("");
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  };

  if (!mensajes && error) return <MensajeError mensaje={error} onReintentar={actualizar} />;
  if (!mensajes) return <Cargando />;

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={lista}
        data={mensajes}
        keyExtractor={(_, indice) => String(indice)}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => <Burbuja mensaje={item} />}
        ListEmptyComponent={
          <SinResultados
            icono="chatbubbles-outline"
            mensaje="Todavía no hay mensajes. Escribí tu consulta sobre el evento, el acceso o cambios de fecha."
          />
        }
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.barra}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribí un mensaje..."
          placeholderTextColor={colores.textoSecundario}
          accessibilityLabel="Mensaje"
          multiline
          maxLength={1000}
          style={styles.input}
        />
        <Pressable
          onPress={enviar}
          disabled={enviando || !texto.trim()}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensaje"
          style={[styles.enviar, (enviando || !texto.trim()) && styles.enviarDeshabilitado]}
        >
          <Ionicons name="send" size={18} color={colores.negro} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Burbuja({ mensaje }) {
  const { esMio } = mensaje;
  return (
    <View style={[styles.burbuja, esMio ? styles.mia : styles.ajena]}>
      {!esMio && (
        <Text style={styles.autor}>
          {mensaje.autor.nombreCompleto} · {mensaje.autor.rol}
        </Text>
      )}
      <Text style={[texto.cuerpo, esMio && styles.textoMio]}>{mensaje.mensaje}</Text>
      <Text style={[styles.hora, esMio && styles.horaMia]}>{formatearFechaCompleta(mensaje.enviado)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  lista: { padding: espaciado.l, gap: espaciado.s, flexGrow: 1 },
  burbuja: { maxWidth: "82%", padding: espaciado.m, borderRadius: radio.l, gap: 2 },
  mia: { alignSelf: "flex-end", backgroundColor: colores.primario, borderBottomRightRadius: 4 },
  ajena: {
    alignSelf: "flex-start",
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderBottomLeftRadius: 4,
  },
  autor: { fontSize: 12, fontWeight: "700", color: colores.primarioOscuro },
  textoMio: { color: colores.blanco },
  hora: { fontSize: 11, color: colores.textoSecundario, alignSelf: "flex-end" },
  horaMia: { color: "#DCFCE7" },
  error: { color: colores.peligro, textAlign: "center", paddingHorizontal: espaciado.l },
  barra: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: espaciado.s,
    padding: espaciado.m,
    backgroundColor: colores.negro,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: espaciado.m,
    paddingVertical: espaciado.s,
    borderRadius: radio.l,
    backgroundColor: colores.superficie,
    fontSize: 15,
    color: colores.texto,
  },
  enviar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colores.primario,
    alignItems: "center",
    justifyContent: "center",
  },
  enviarDeshabilitado: { opacity: 0.4 },
});
