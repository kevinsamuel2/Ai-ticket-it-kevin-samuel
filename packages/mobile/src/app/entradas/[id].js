import { useCallback, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCarga } from "../../hooks/useCarga";
import { obtenerCompra } from "../../services/compras.service";
import { Boton } from "../../components/Boton";
import { EntradaConQR } from "../../components/EntradaConQR";
import { Cargando, MensajeError, SinResultados } from "../../components/EstadosDeCarga";
import { colores, espaciado, texto } from "../../theme";

// Las entradas de una compra con su QR. Cada entrada comprada tiene el suyo: se deslizan de costado, una por página
// (una compra de 3 entradas muestra 3 QR). Se llega desde "Entradas", y no desde el detalle de la compra.
export default function EntradasDeUnaCompra() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { datos: compra, error, recargar } = useCarga(useCallback(() => obtenerCompra(id), [id]));
  const [actual, setActual] = useState(0);

  if (error) return <MensajeError mensaje={error} onReintentar={recargar} />;
  if (!compra) return <Cargando mensaje="Cargando tus entradas..." />;

  const { entradas } = compra;

  // Mientras no se pague, o si la compra se dio de baja, no hay entradas para mostrar
  if (entradas.length === 0) {
    return (
      <View style={styles.vacio}>
        <Stack.Screen options={{ title: "Mis entradas" }} />
        <SinResultados
          icono="ticket-outline"
          mensaje={
            compra.estado === "PENDIENTE"
              ? "Esta compra todavía no está paga. Cuando la pagues vas a recibir tus entradas acá."
              : "Esta compra ya no tiene entradas."
          }
        />
        <Boton titulo="Ver la compra" variante="secundario" onPress={() => router.replace(`/compras/${compra.id}`)} />
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <Stack.Screen options={{ title: compra.evento.nombre }} />
      {entradas.length > 1 && (
        <Text style={[texto.secundario, styles.aviso]} accessibilityLiveRegion="polite">
          Tenés {entradas.length} entradas, cada una con su QR. Deslizá para ver las demás.
        </Text>
      )}
      <FlatList
        data={entradas}
        horizontal
        pagingEnabled
        keyExtractor={(entrada) => entrada.codigo}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setActual(Math.round(e.nativeEvent.contentOffset.x / width))}
        accessibilityLabel="Entradas de la compra"
        renderItem={({ item: entrada }) => (
          <ScrollView style={{ width }} contentContainerStyle={styles.pagina}>
            <EntradaConQR compra={compra} entrada={entrada} />
          </ScrollView>
        )}
      />
      {entradas.length > 1 && (
        <View style={styles.indicador} importantForAccessibility="no-hide-descendants">
          {entradas.map((entrada, indice) => (
            <View key={entrada.codigo} style={[styles.punto, indice === actual && styles.puntoActual]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  aviso: { textAlign: "center", paddingHorizontal: espaciado.l, paddingTop: espaciado.s },
  pagina: { padding: espaciado.l, paddingBottom: espaciado.xl },
  vacio: { flex: 1, padding: espaciado.l, gap: espaciado.m },
  indicador: { flexDirection: "row", justifyContent: "center", gap: 6, paddingVertical: espaciado.m },
  punto: { width: 6, height: 6, borderRadius: 3, backgroundColor: colores.borde },
  puntoActual: { width: 20, backgroundColor: colores.primario },
});
