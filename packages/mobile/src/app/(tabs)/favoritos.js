import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useCarga } from "../../hooks/useCarga";
import { listarFavoritos } from "../../services/eventos.service";
import { EventoCard } from "../../components/EventoCard";
import { Cargando, MensajeError, SinResultados } from "../../components/EstadosDeCarga";
import { espaciado } from "../../theme";

// Eventos que el usuario guardó con el corazón (Usuario.favoritos del diagrama)
export default function Favoritos() {
  const router = useRouter();
  const { datos: favoritos, cargando, error, recargar } = useCarga(useCallback(() => listarFavoritos(), []));

  if (error) return <MensajeError mensaje={error} onReintentar={recargar} />;
  if (!favoritos) return <Cargando mensaje="Cargando tus favoritos..." />;

  return (
    <View style={styles.contenedor}>
      <FlatList
        data={favoritos}
        keyExtractor={(evento) => String(evento.id)}
        contentContainerStyle={styles.lista}
        refreshing={cargando}
        onRefresh={recargar}
        renderItem={({ item: evento }) => (
          <EventoCard evento={evento} onPress={() => router.push(`/eventos/${evento.id}`)} />
        )}
        ListEmptyComponent={
          <SinResultados
            icono="heart-outline"
            mensaje="Todavía no guardaste eventos. Tocá el corazón en un evento para tenerlo acá."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  lista: { padding: espaciado.l, gap: espaciado.l, flexGrow: 1 },
});
