import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useCarga } from "../../hooks/useCarga";
import { listarMisCompras } from "../../services/compras.service";
import { CompraCard } from "../../components/CompraCard";
import { Chips } from "../../components/Chips";
import { Cargando, MensajeError, SinResultados } from "../../components/EstadosDeCarga";
import { colores, espaciado, estilosDeEstado } from "../../theme";

const FILTROS = [
  { valor: null, etiqueta: "Todas" },
  ...Object.entries(estilosDeEstado).map(([estado, { etiqueta }]) => ({ valor: estado, etiqueta })),
];

// Mis compras, con su estado y los días que faltan para las confirmadas
export default function MisCompras() {
  const router = useRouter();
  const [estado, setEstado] = useState(null);
  const { datos: compras, cargando, error, recargar } = useCarga(useCallback(() => listarMisCompras(estado), [estado]));

  return (
    <View style={styles.contenedor}>
      <View style={styles.filtros}>
        <Chips
          etiquetaAccesible="Filtrar por estado"
          opciones={FILTROS}
          seleccionada={estado}
          onSeleccionar={setEstado}
        />
      </View>
      {error ? (
        <MensajeError mensaje={error} onReintentar={recargar} />
      ) : !compras ? (
        <Cargando />
      ) : (
        <FlatList
          data={compras}
          keyExtractor={(compra) => String(compra.id)}
          contentContainerStyle={styles.lista}
          refreshing={cargando}
          onRefresh={recargar}
          renderItem={({ item: compra }) => (
            <CompraCard compra={compra} onPress={() => router.push(`/compras/${compra.id}`)} />
          )}
          ListEmptyComponent={
            <SinResultados
              icono="ticket-outline"
              mensaje={estado ? "No tenés compras en este estado" : "Todavía no compraste entradas"}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  filtros: {
    paddingVertical: espaciado.m,
    backgroundColor: colores.superficie,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  lista: { padding: espaciado.l, gap: espaciado.m, flexGrow: 1 },
});
