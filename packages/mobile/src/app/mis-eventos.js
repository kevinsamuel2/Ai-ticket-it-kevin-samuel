import { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUsuario } from "../context/UsuarioContext";
import { useCarga } from "../hooks/useCarga";
import { listarEventosDeOrganizador } from "../services/usuarios.service";
import { EventoCard } from "../components/EventoCard";
import { Cargando, MensajeError, SinResultados } from "../components/EstadosDeCarga";
import { colores, espaciado } from "../theme";

// Eventos que publicó el usuario: desde acá se publica uno nuevo o se ven las ventas de cada uno. Se llega desde el Perfil.
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
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/eventos/nuevo")}
              accessibilityRole="button"
              accessibilityLabel="Publicar un evento"
              style={({ pressed }) => [styles.agregar, pressed && styles.presionado]}
            >
              <Ionicons name="add" size={24} color={colores.sobrePrimario} />
            </Pressable>
          ),
        }}
      />
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
  lista: { padding: espaciado.l, gap: espaciado.m, flexGrow: 1 },
  agregar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colores.primario,
    alignItems: "center",
    justifyContent: "center",
  },
  presionado: { opacity: 0.7, transform: [{ scale: 0.95 }] },
});
