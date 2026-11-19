import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCarga } from "../../hooks/useCarga";
import { useUsuario } from "../../context/UsuarioContext";
import { obtenerReputacion, listarEventosDeOrganizador } from "../../services/usuarios.service";
import { Avatar } from "../../components/Avatar";
import { BotonSeguir } from "../../components/BotonSeguir";
import { EventoCard } from "../../components/EventoCard";
import { Puntaje } from "../../components/Puntaje";
import { ReseniaItem } from "../../components/ReseniaItem";
import { TituloDeSeccion } from "../../components/TituloDeSeccion";
import { Cargando, MensajeError } from "../../components/EstadosDeCarga";
import { colores, contorno, espaciado, radio, texto } from "../../theme";

const CANTIDAD_DE_RESENIAS = 5;

// Perfil de un organizador: su reputación, cuánta gente lo sigue, sus eventos y las reseñas que recibió
export default function Organizador() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { usuario } = useUsuario();
  const reputacion = useCarga(useCallback(() => obtenerReputacion(id), [id]));
  const eventos = useCarga(useCallback(() => listarEventosDeOrganizador(id), [id]));

  const error = reputacion.error ?? eventos.error;
  if (error) {
    return (
      <MensajeError
        mensaje={error}
        onReintentar={() => {
          reputacion.recargar();
          eventos.recargar();
        }}
      />
    );
  }
  if (!reputacion.datos || !eventos.datos) return <Cargando />;

  const { organizador, resenias } = reputacion.datos;
  const esUnoMismo = organizador.id === usuario.id;
  const proximos = eventos.datos.filter((evento) => !evento.yaSeRealizo);
  const anteriores = eventos.datos.filter((evento) => evento.yaSeRealizo);
  const abrirEvento = (evento) => router.push(`/eventos/${evento.id}`);

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Stack.Screen options={{ title: organizador.nombreCompleto }} />

      <View style={styles.encabezado}>
        <Avatar nombreCompleto={organizador.nombreCompleto} tamanio={72} />
        <Text style={texto.titulo}>{organizador.nombreCompleto}</Text>
        <View style={styles.datos}>
          <Puntaje puntaje={organizador.puntaje} cantidad={organizador.cantidadResenias} tamanio={15} />
          <Text style={texto.secundario}>
            · {organizador.seguidores} {organizador.seguidores === 1 ? "seguidor" : "seguidores"}
          </Text>
        </View>
        {!esUnoMismo && (
          <BotonSeguir
            organizadorId={organizador.id}
            nombre={organizador.nombreCompleto}
            loSigo={organizador.loSigo}
            onCambio={reputacion.recargar}
          />
        )}
      </View>

      <View style={styles.seccion}>
        <TituloDeSeccion>Próximos eventos</TituloDeSeccion>
        {proximos.length === 0 ? (
          <Text style={texto.secundario}>No tiene eventos próximos.</Text>
        ) : (
          proximos.map((evento) => <EventoCard key={evento.id} evento={evento} onPress={() => abrirEvento(evento)} />)
        )}
      </View>

      {anteriores.length > 0 && (
        <View style={styles.seccion}>
          <TituloDeSeccion>Eventos anteriores</TituloDeSeccion>
          {anteriores.map((evento) => (
            <EventoCard key={evento.id} evento={evento} onPress={() => abrirEvento(evento)} />
          ))}
        </View>
      )}

      <View style={styles.seccion}>
        <TituloDeSeccion>Reseñas</TituloDeSeccion>
        {resenias.length === 0 ? (
          <Text style={texto.secundario}>Todavía no tiene reseñas.</Text>
        ) : (
          resenias
            .slice(0, CANTIDAD_DE_RESENIAS)
            .map((resenia, indice) => <ReseniaItem key={indice} resenia={resenia} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: espaciado.l, gap: espaciado.xl, paddingBottom: espaciado.xl * 2 },
  encabezado: {
    alignItems: "center",
    gap: espaciado.s,
    padding: espaciado.xl,
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    borderCurve: "continuous",
    ...contorno,
  },
  datos: { flexDirection: "row", alignItems: "center", gap: espaciado.xs },
  seccion: { gap: espaciado.m },
});
