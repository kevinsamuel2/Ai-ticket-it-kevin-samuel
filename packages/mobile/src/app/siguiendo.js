import { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCarga } from "../hooks/useCarga";
import { listarSeguidos } from "../services/seguidos.service";
import { Avatar } from "../components/Avatar";
import { Puntaje } from "../components/Puntaje";
import { Cargando, MensajeError, SinResultados } from "../components/EstadosDeCarga";
import { colores, contorno, espaciado, fuente, radio, texto } from "../theme";

// Organizadores que sigue el usuario. Se llega desde el Perfil; al tocar uno se abre su perfil con sus eventos.
export default function Siguiendo() {
  const router = useRouter();
  const { datos: organizadores, cargando, error, recargar } = useCarga(useCallback(() => listarSeguidos(), []));

  if (error) return <MensajeError mensaje={error} onReintentar={recargar} />;
  if (!organizadores) return <Cargando mensaje="Cargando los organizadores que seguís..." />;

  return (
    <FlatList
      data={organizadores}
      keyExtractor={(organizador) => String(organizador.id)}
      contentContainerStyle={styles.lista}
      refreshing={cargando}
      onRefresh={recargar}
      renderItem={({ item: organizador }) => (
        <Pressable
          onPress={() => router.push(`/organizadores/${organizador.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`Ver a ${organizador.nombreCompleto}`}
          style={({ pressed }) => [styles.fila, pressed && styles.presionada]}
        >
          <Avatar nombreCompleto={organizador.nombreCompleto} tamanio={48} />
          <View style={styles.textos}>
            <Text style={styles.nombre}>{organizador.nombreCompleto}</Text>
            <View style={styles.datos}>
              <Puntaje puntaje={organizador.puntaje} cantidad={organizador.cantidadResenias} />
              <Text style={texto.pie}>
                · {organizador.seguidores} {organizador.seguidores === 1 ? "seguidor" : "seguidores"}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.textoApagado} />
        </Pressable>
      )}
      ListEmptyComponent={
        <SinResultados
          icono="people-outline"
          mensaje="Todavía no seguís a ningún organizador. Tocá Seguir en la ficha de un evento."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: espaciado.l, gap: espaciado.m, flexGrow: 1 },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.m,
    padding: espaciado.m,
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    borderCurve: "continuous",
    ...contorno,
  },
  presionada: { opacity: 0.85 },
  textos: { flex: 1, gap: 3 },
  nombre: { ...fuente, fontSize: 17, fontWeight: "800", letterSpacing: -0.3, color: colores.texto },
  datos: { flexDirection: "row", alignItems: "center", gap: espaciado.xs },
});
