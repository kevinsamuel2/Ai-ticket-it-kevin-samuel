import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCarga } from "../../../hooks/useCarga";
import { useUsuario } from "../../../context/UsuarioContext";
import { useAvisos } from "../../../context/AvisosContext";
import { agregarFavorito, obtenerEvento, quitarFavorito } from "../../../services/eventos.service";
import { comprar } from "../../../services/compras.service";
import { mensajeDeError } from "../../../services/api";
import { Cargando, MensajeError } from "../../../components/EstadosDeCarga";
import { Boton } from "../../../components/Boton";
import { Galeria } from "../../../components/Galeria";
import { Puntaje } from "../../../components/Puntaje";
import { ReseniaItem } from "../../../components/ReseniaItem";
import { SelectorCantidad } from "../../../components/SelectorCantidad";
import { colores, espaciado, radio, texto } from "../../../theme";
import { formatearFecha, formatearPrecio } from "../../../utils/formato";

export default function DetalleEvento() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { usuario } = useUsuario();
  const { datos: evento, error, recargar } = useCarga(useCallback(() => obtenerEvento(id), [id]));

  const [tipoElegidoId, setTipoElegidoId] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [comprando, setComprando] = useState(false);
  // Se actualiza al instante al tocar el corazón, sin esperar a recargar el evento
  const [favoritoLocal, setFavoritoLocal] = useState(null);
  const { mostrarError, mostrarExito } = useAvisos();

  if (error) return <MensajeError mensaje={error} onReintentar={recargar} />;
  if (!evento) return <Cargando />;

  const esOrganizador = evento.organizador.id === usuario.id;
  const esFavorito = favoritoLocal ?? evento.esFavorito;

  const alternarFavorito = async () => {
    const nuevoValor = !esFavorito;
    setFavoritoLocal(nuevoValor);
    try {
      await (nuevoValor ? agregarFavorito(evento.id) : quitarFavorito(evento.id));
      mostrarExito(nuevoValor ? "Guardado en tus favoritos" : "Quitado de tus favoritos");
    } catch (e) {
      setFavoritoLocal(!nuevoValor);
      mostrarError(mensajeDeError(e));
    }
  };
  const tipoElegido = evento.tiposEntrada.find((tipo) => tipo.id === tipoElegidoId);
  const sePuedeComprar = !esOrganizador && !evento.yaSeRealizo && !evento.agotado;

  const elegirTipo = (tipo) => {
    setTipoElegidoId(tipo.id);
    setCantidad(1);
  };

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

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Stack.Screen
        options={{
          title: evento.categoria,
          headerRight: () => (
            <Pressable
              onPress={alternarFavorito}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
              accessibilityState={{ selected: esFavorito }}
            >
              <Ionicons name={esFavorito ? "heart" : "heart-outline"} size={26} color={colores.primario} />
            </Pressable>
          ),
        }}
      />
      <Galeria imagenes={evento.multimedia} nombre={evento.nombre} />

      <View style={styles.seccion}>
        <Text style={texto.titulo}>{evento.nombre}</Text>
        <View style={styles.fila}>
          <Ionicons name="calendar" size={16} color={colores.primario} />
          <Text style={texto.cuerpo}>{formatearFecha(evento.fecha)}</Text>
        </View>
        {evento.yaSeRealizo && <Text style={styles.aviso}>Este evento ya se realizó</Text>}
        <Text style={[texto.cuerpo, styles.descripcion]}>{evento.descripcion}</Text>
      </View>

      <View style={styles.organizador}>
        <View style={styles.flex}>
          <Text style={texto.secundario}>Organiza</Text>
          <Text style={texto.subtitulo}>{evento.organizador.nombreCompleto}</Text>
        </View>
        <Puntaje puntaje={evento.organizador.puntaje} cantidad={evento.organizador.cantidadResenias} tamanio={16} />
      </View>

      {esOrganizador && (
        <View style={styles.avisoOrganizador}>
          <Text style={texto.cuerpo}>Sos el organizador de este evento, así que no podés comprar entradas.</Text>
          <Boton
            titulo="Ver ventas de este evento"
            icono="stats-chart"
            variante="secundario"
            onPress={() => router.push(`/eventos/${evento.id}/ventas`)}
          />
        </View>
      )}

      <View style={styles.seccion}>
        <Text style={texto.subtitulo}>Entradas</Text>
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
            <Boton titulo="Comprar" icono="cart" onPress={confirmarCompra} cargando={comprando} />
            <Text style={[texto.secundario, styles.centrado]}>La compra queda pendiente hasta que la pagues.</Text>
          </View>
        )}
      </View>

      <View style={styles.seccion}>
        <Text style={texto.subtitulo}>Reseñas del organizador</Text>
        {evento.reseniasOrganizador.length === 0 ? (
          <Text style={texto.secundario}>Este organizador todavía no tiene reseñas.</Text>
        ) : (
          evento.reseniasOrganizador.map((resenia, indice) => <ReseniaItem key={indice} resenia={resenia} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { paddingBottom: espaciado.xl * 2, gap: espaciado.l },
  seccion: { paddingHorizontal: espaciado.l, gap: espaciado.s },
  avisoOrganizador: { marginHorizontal: espaciado.l, gap: espaciado.m },
  fila: { flexDirection: "row", alignItems: "center", gap: espaciado.s },
  filaEntre: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  flex: { flex: 1 },
  descripcion: { color: colores.textoSecundario, lineHeight: 22 },
  aviso: { color: colores.peligro, fontWeight: "600" },
  organizador: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: espaciado.l,
    padding: espaciado.m,
    borderRadius: radio.m,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderLeftWidth: 4,
    borderLeftColor: colores.primario,
  },
  tipo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.m,
    padding: espaciado.m,
    borderRadius: radio.m,
    borderWidth: 1.5,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  tipoElegido: { borderColor: colores.primario, backgroundColor: colores.primarioSuave },
  tipoAgotado: { opacity: 0.5 },
  tipoNombre: { fontSize: 16, fontWeight: "700", color: colores.texto },
  tipoPrecio: { fontSize: 16, fontWeight: "800", color: colores.texto },
  pocasEntradas: { color: colores.primarioOscuro, fontWeight: "700" },
  resumenCompra: {
    gap: espaciado.m,
    marginTop: espaciado.s,
    padding: espaciado.l,
    borderRadius: radio.l,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  total: { fontSize: 22, fontWeight: "800", color: colores.primarioOscuro },
  centrado: { textAlign: "center" },
});
