import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useUsuario } from "../../context/UsuarioContext";
import { useCarga } from "../../hooks/useCarga";
import { listarEventosDeOrganizador } from "../../services/usuarios.service";
import { EventoCard } from "../../components/EventoCard";
import { Boton } from "../../components/Boton";
import { Cargando, MensajeError, SinResultados } from "../../components/EstadosDeCarga";
import { espaciado } from "../../theme";

// Eventos que publicó el usuario: desde acá se publica uno nuevo o se ven las ventas de cada uno
export default function MisEventos() {
  const router = useRouter();
  const { usuario } = useUsuario();
  const {
    datos: eventos,
    cargando,
    error,
    recargar,
  } = useCarga(useCallback(() => listarEventosDeOrganizador(usuario.id), [usuario.id]));

  return (
    <View style={styles.contenedor}>
      <View style={styles.acciones}>
        <Boton titulo="Publicar un evento" icono="add-circle-outline" onPress={() => router.push("/eventos/nuevo")} />
      </View>
      {error ? (
        <MensajeError mensaje={error} onReintentar={recargar} />
      ) : !eventos ? (
        <Cargando />
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(evento) => String(evento.id)}
          contentContainerStyle={styles.lista}
          refreshing={cargando}
          onRefresh={recargar}
          renderItem={({ item: evento }) => (
            <EventoCard evento={evento} onPress={() => router.push(`/eventos/${evento.id}/ventas`)} />
          )}
          ListEmptyComponent={<SinResultados icono="megaphone-outline" mensaje="Todavía no publicaste eventos" />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  acciones: { padding: espaciado.l, paddingBottom: 0 },
  lista: { padding: espaciado.l, gap: espaciado.l, flexGrow: 1 },
});
