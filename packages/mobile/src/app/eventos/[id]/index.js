import { useCallback, useRef, useState } from "react";
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCarga } from "../../../hooks/useCarga";
import { useUsuario } from "../../../context/UsuarioContext";
import { useAvisos } from "../../../context/AvisosContext";
import { useFavoritos } from "../../../context/FavoritosContext";
import { obtenerEvento } from "../../../services/eventos.service";
import { comprar } from "../../../services/compras.service";
import { mensajeDeError } from "../../../services/api";
import { Cargando, MensajeError } from "../../../components/EstadosDeCarga";
import { Boton } from "../../../components/Boton";
import { BotonSeguir } from "../../../components/BotonSeguir";
import { FinalizarEvento } from "../../../components/FinalizarEvento";
import { Galeria } from "../../../components/Galeria";
import { Puntaje } from "../../../components/Puntaje";
import { ReseniaItem } from "../../../components/ReseniaItem";
import { SelectorCantidad } from "../../../components/SelectorCantidad";
import { TituloDeSeccion } from "../../../components/TituloDeSeccion";
import { colores, contorno, espaciado, fuente, radio, texto } from "../../../theme";
import { formatearFecha, formatearPrecio } from "../../../utils/formato";
import { urlDelMapa } from "../../../utils/mapa";

export default function DetalleEvento() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const { usuario } = useUsuario();
  const { ids: favoritos, alternar } = useFavoritos();
  const { datos: evento, error, recargar } = useCarga(useCallback(() => obtenerEvento(id), [id]));

  const [tipoElegidoId, setTipoElegidoId] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [comprando, setComprando] = useState(false);
  const { mostrarError, mostrarExito } = useAvisos();
  const scroll = useRef(null);
  const [inicioDeEntradas, setInicioDeEntradas] = useState(0);

  if (error) return <MensajeError mensaje={error} onReintentar={recargar} />;
  if (!evento) return <Cargando />;

  const esOrganizador = evento.organizador.id === usuario.id;
  const esFavorito = favoritos.has(evento.id);
  const tipoElegido = evento.tiposEntrada.find((tipo) => tipo.id === tipoElegidoId);
  const sePuedeComprar = !esOrganizador && !evento.yaSeRealizo && !evento.agotado;

  const elegirTipo = (tipo) => {
    setTipoElegidoId(tipo.id);
    setCantidad(1);
  };

  const irALasEntradas = () =>
    scroll.current?.scrollTo({ y: Math.max(inicioDeEntradas - espaciado.l, 0), animated: true });

  const compartir = () =>
    Share.share({
      message: `${evento.nombre} · ${formatearFecha(evento.fecha)}. Conseguí tus entradas en AI Ticket It.`,
    });

  const comoLlegar = () =>
    Linking.openURL(urlDelMapa(evento)).catch(() => mostrarError("No se pudo abrir el mapa en este dispositivo"));

  const confirmarCompra = async () => {
    setComprando(true);
    try {
      const compra = await comprar({ eventoId: evento.id, tipoEntradaId: tipoElegido.id, cantidad });
      mostrarExito(
        `¡Reservaste ${cantidad} ${cantidad === 1 ? "entrada" : "entradas"}! Pagalas para confirmar la compra.`,
      );
      router.replace(`/compras/${compra.id}`);
    } catch (e) {
      // Ej: otra persona compró las últimas entradas mientras se elegía la cantidad
      mostrarError(mensajeDeError(e));
      recargar();
    } finally {
      setComprando(false);
    }
  };

  // El botón fijo de abajo cambia según lo que se puede hacer: elegir entrada, comprar, ver ventas o nada
  const accion = (() => {
    if (esOrganizador) {
      return {
        titulo: "Ver ventas de este evento",
        icono: "stats-chart",
        onPress: () => router.push(`/eventos/${evento.id}/ventas`),
      };
    }
    if (evento.yaSeRealizo)
      return { titulo: "Este evento ya se realizó", icono: "checkmark-done", deshabilitado: true };
    if (evento.agotado) return { titulo: "Entradas agotadas", icono: "close-circle-outline", deshabilitado: true };
    if (tipoElegido) return { titulo: "Comprar", icono: "cart", onPress: confirmarCompra, cargando: comprando };
    return { titulo: "Seleccionar entradas", icono: "ticket", onPress: irALasEntradas };
  })();

  return (
    <View style={styles.pantalla}>
      <Stack.Screen
        options={{
          title: evento.categoria,
          headerRight: () => (
            <View style={styles.accionesDelEncabezado}>
              <Pressable
                onPress={compartir}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Compartir evento"
              >
                <Ionicons name="share-outline" size={24} color={colores.primario} />
              </Pressable>
              <Pressable
                onPress={() => alternar(evento.id)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
                accessibilityState={{ selected: esFavorito }}
              >
                <Ionicons name={esFavorito ? "bookmark" : "bookmark-outline"} size={24} color={colores.primario} />
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView ref={scroll} contentContainerStyle={styles.contenedor}>
        <Galeria imagenes={evento.multimedia} nombre={evento.nombre} relacion={16 / 10} />

        <View style={styles.seccion}>
          <Text style={texto.etiqueta}>{evento.categoria}</Text>
          <Text style={styles.titulo}>{evento.nombre}</Text>
          {evento.yaSeRealizo && <Text style={styles.aviso}>Este evento ya se realizó</Text>}
        </View>

        <View style={styles.datos}>
          <Dato icono="calendar" etiqueta="Fecha" valor={formatearFecha(evento.fecha)} />
          <Dato
            icono="ticket"
            etiqueta="Entradas desde"
            valor={formatearPrecio(Math.min(...evento.tiposEntrada.map((tipo) => tipo.precio)))}
          />
        </View>

        <View style={styles.seccion}>
          <TituloDeSeccion>Sobre el evento</TituloDeSeccion>
          <Text style={[texto.cuerpo, styles.descripcion]}>{evento.descripcion}</Text>
        </View>

        {evento.lugar && (
          <View style={styles.seccion}>
            <TituloDeSeccion>Ubicación</TituloDeSeccion>
            <View style={styles.ubicacion}>
              <View style={styles.iconoDelDato}>
                <Ionicons name="location" size={18} color={colores.primarioClaro} />
              </View>
              <View style={styles.flex}>
                <Text style={texto.subtitulo}>{evento.lugar}</Text>
                {evento.ciudad && <Text style={texto.secundario}>{evento.ciudad}</Text>}
              </View>
              <Pressable
                onPress={comoLlegar}
                accessibilityRole="link"
                accessibilityLabel={`Cómo llegar a ${evento.lugar}`}
                style={({ pressed }) => [styles.comoLlegar, pressed && styles.presionado]}
              >
                <Text style={styles.comoLlegarTexto}>Cómo llegar</Text>
                <Ionicons name="arrow-forward" size={14} color={colores.primarioClaro} />
              </Pressable>
            </View>
          </View>
        )}

        {/* La fila del organizador abre su perfil; "Seguir" va al lado y no adentro, para no anidar botones */}
        <View style={styles.organizador}>
          <Pressable
            onPress={() => router.push(`/organizadores/${evento.organizador.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Ver a ${evento.organizador.nombreCompleto}, organizador`}
            style={styles.datosDelOrganizador}
          >
            <Text style={texto.etiqueta}>Organiza</Text>
            <Text style={texto.subtitulo}>{evento.organizador.nombreCompleto}</Text>
            <View style={styles.reputacion}>
              <Puntaje
                puntaje={evento.organizador.puntaje}
                cantidad={evento.organizador.cantidadResenias}
                tamanio={14}
              />
              <Text style={texto.pie}>
                · {evento.organizador.seguidores} {evento.organizador.seguidores === 1 ? "seguidor" : "seguidores"}
              </Text>
            </View>
          </Pressable>
          {!esOrganizador && (
            <BotonSeguir
              organizadorId={evento.organizador.id}
              nombre={evento.organizador.nombreCompleto}
              loSigo={evento.organizador.loSigo}
              onCambio={recargar}
            />
          )}
        </View>

        {esOrganizador && (
          <View style={styles.avisoOrganizador}>
            <Text style={texto.cuerpo}>Sos el organizador de este evento, así que no podés comprar entradas.</Text>
            <FinalizarEvento evento={evento} onFinalizado={recargar} />
          </View>
        )}

        <View style={styles.seccion} onLayout={(e) => setInicioDeEntradas(e.nativeEvent.layout.y)}>
          <TituloDeSeccion>Entradas</TituloDeSeccion>
          {evento.tiposEntrada.map((tipo) => {
            const elegido = tipo.id === tipoElegidoId;
            return (
              <Pressable
                key={tipo.id}
                onPress={() => elegirTipo(tipo)}
                disabled={!sePuedeComprar || tipo.agotado}
                accessibilityRole="radio"
                accessibilityState={{ checked: elegido, disabled: !sePuedeComprar || tipo.agotado }}
                accessibilityLabel={`${tipo.nombre}, ${formatearPrecio(tipo.precio)}, ${tipo.agotado ? "agotado" : `quedan ${tipo.disponibles}`}`}
                style={[styles.tipo, elegido && styles.tipoElegido, tipo.agotado && styles.tipoAgotado]}
              >
                <Ionicons
                  name={elegido ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={elegido ? colores.primario : colores.textoSecundario}
                />
                <View style={styles.flex}>
                  <Text style={styles.tipoNombre}>{tipo.nombre}</Text>
                  {tipo.descripcion ? <Text style={texto.secundario}>{tipo.descripcion}</Text> : null}
                  <Text style={[texto.secundario, tipo.disponibles <= 5 && styles.pocasEntradas]}>
                    {tipo.agotado ? "Agotado" : `Quedan ${tipo.disponibles}`}
                  </Text>
                </View>
                <Text style={styles.tipoPrecio}>{formatearPrecio(tipo.precio)}</Text>
              </Pressable>
            );
          })}

          {tipoElegido && (
            <View style={styles.resumenCompra}>
              <View style={styles.filaEntre}>
                <Text style={texto.cuerpo}>Cantidad</Text>
                <SelectorCantidad valor={cantidad} maximo={tipoElegido.disponibles} onCambiar={setCantidad} />
              </View>
              <View style={styles.filaEntre}>
                <Text style={texto.subtitulo}>Total</Text>
                <Text style={styles.total}>{formatearPrecio(tipoElegido.precio * cantidad)}</Text>
              </View>
              <Text style={[texto.secundario, styles.centrado]}>La compra queda pendiente hasta que la pagues.</Text>
            </View>
          )}
        </View>

        <View style={styles.seccion}>
          <TituloDeSeccion>Reseñas del organizador</TituloDeSeccion>
          {evento.reseniasOrganizador.length === 0 ? (
            <Text style={texto.secundario}>Este organizador todavía no tiene reseñas.</Text>
          ) : (
            evento.reseniasOrganizador.map((resenia, indice) => <ReseniaItem key={indice} resenia={resenia} />)
          )}
        </View>
      </ScrollView>

      {/* Barra fija de abajo con el botón verde principal, como "Seleccionar Entradas" en la app de Punch */}
      <View style={[styles.barra, { paddingBottom: Math.max(bottom, espaciado.m) }]}>
        {tipoElegido && !accion.deshabilitado && !esOrganizador && (
          <View style={styles.resumenDeLaBarra}>
            <Text style={texto.pie}>
              Total · {cantidad} {cantidad === 1 ? "entrada" : "entradas"}
            </Text>
            <Text style={styles.totalDeLaBarra}>{formatearPrecio(tipoElegido.precio * cantidad)}</Text>
          </View>
        )}
        <View style={styles.flex}>
          <Boton
            titulo={accion.titulo}
            icono={accion.icono}
            onPress={accion.onPress}
            cargando={accion.cargando}
            deshabilitado={accion.deshabilitado}
          />
        </View>
      </View>
    </View>
  );
}

function Dato({ icono, etiqueta, valor }) {
  return (
    <View style={styles.dato}>
      <View style={styles.iconoDelDato}>
        <Ionicons name={icono} size={18} color={colores.primarioClaro} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.etiquetaDelDato}>{etiqueta}</Text>
        <Text style={styles.valorDelDato} numberOfLines={2}>
          {valor}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenedor: { paddingBottom: 130, gap: espaciado.l },
  seccion: { paddingHorizontal: espaciado.l, gap: espaciado.s },
  avisoOrganizador: { marginHorizontal: espaciado.l, gap: espaciado.m },
  accionesDelEncabezado: { flexDirection: "row", alignItems: "center", gap: espaciado.l },
  filaEntre: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  flex: { flex: 1 },
  titulo: { ...fuente, fontSize: 30, lineHeight: 34, fontWeight: "800", letterSpacing: -0.8, color: colores.texto },
  datos: { flexDirection: "row", gap: espaciado.m, paddingHorizontal: espaciado.l },
  dato: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.s + 2,
    padding: espaciado.m,
    borderRadius: radio.m + 2,
    borderCurve: "continuous",
    backgroundColor: colores.superficie,
    ...contorno,
  },
  iconoDelDato: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    borderCurve: "continuous",
    backgroundColor: colores.primarioSuave,
  },
  etiquetaDelDato: {
    ...fuente,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colores.textoApagado,
  },
  valorDelDato: { ...fuente, fontSize: 14, fontWeight: "700", color: colores.texto },
  descripcion: { color: colores.textoSecundario, lineHeight: 23 },
  aviso: { color: colores.peligro, fontWeight: "700" },
  organizador: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.m,
    marginHorizontal: espaciado.l,
    padding: espaciado.m,
    borderRadius: radio.m + 4,
    borderCurve: "continuous",
    backgroundColor: colores.superficie,
    ...contorno,
  },
  datosDelOrganizador: { flex: 1, gap: 2 },
  reputacion: { flexDirection: "row", alignItems: "center", gap: espaciado.xs },
  ubicacion: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.s + 2,
    padding: espaciado.m,
    borderRadius: radio.m + 4,
    borderCurve: "continuous",
    backgroundColor: colores.superficie,
    ...contorno,
  },
  comoLlegar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1.5,
    borderColor: colores.primario,
    backgroundColor: colores.primarioSuave,
  },
  comoLlegarTexto: { ...fuente, fontSize: 13, fontWeight: "800", color: colores.primarioClaro },
  presionado: { opacity: 0.7 },
  tipo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.m,
    padding: espaciado.m,
    borderRadius: radio.m + 4,
    borderCurve: "continuous",
    backgroundColor: colores.superficie,
    ...contorno,
    borderWidth: 1.5,
  },
  tipoElegido: { borderColor: colores.primario, backgroundColor: colores.primarioSuave },
  tipoAgotado: { opacity: 0.5 },
  tipoNombre: { fontSize: 17, fontWeight: "700", color: colores.texto },
  tipoPrecio: { fontSize: 18, fontWeight: "800", color: colores.primarioClaro },
  pocasEntradas: { color: colores.primarioClaro, fontWeight: "600" },
  resumenCompra: {
    gap: espaciado.m,
    marginTop: espaciado.s,
    padding: espaciado.l,
    borderRadius: radio.l,
    borderCurve: "continuous",
    backgroundColor: colores.superficie,
    ...contorno,
  },
  total: { fontSize: 24, fontWeight: "800", letterSpacing: -0.4, color: colores.primarioClaro },
  centrado: { textAlign: "center" },
  barra: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.l,
    paddingTop: espaciado.m,
    paddingHorizontal: espaciado.l,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    backgroundColor: "rgba(0,0,0,0.96)",
  },
  resumenDeLaBarra: { gap: 2 },
  totalDeLaBarra: { ...fuente, fontSize: 20, fontWeight: "800", letterSpacing: -0.3, color: colores.texto },
});
