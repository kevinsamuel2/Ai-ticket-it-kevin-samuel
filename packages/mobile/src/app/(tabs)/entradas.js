import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useCarga } from "../../hooks/useCarga";
import { listarMisCompras } from "../../services/compras.service";
import { CompraCard } from "../../components/CompraCard";
import { Chips } from "../../components/Chips";
import { EncabezadoGrande } from "../../components/EncabezadoGrande";
import { Segmentado } from "../../components/Segmentado";
import { Cargando, MensajeError, SinResultados } from "../../components/EstadosDeCarga";
import { colores, espaciado, espacioParaLaBarra, estilosDeEstado } from "../../theme";
import { esCompraPasada } from "../../utils/compras";

const MOMENTOS = [
  { valor: "proximos", etiqueta: "Próximos", icono: "calendar-outline" },
  { valor: "pasados", etiqueta: "Pasados", icono: "checkmark-outline" },
];

const FILTROS = [
  { valor: null, etiqueta: "Todas" },
  ...Object.entries(estilosDeEstado).map(([estado, { etiqueta }]) => ({ valor: estado, etiqueta })),
];

// Mis entradas, como "Mis Tickets" de Punch: las compras separadas en próximas y pasadas, cada una con su estado,
// los días que faltan para las confirmadas y el acceso a su QR
export default function Entradas() {
  const router = useRouter();
  const [momento, setMomento] = useState("proximos");
  const [estado, setEstado] = useState(null);
  const { datos: compras, cargando, error, recargar } = useCarga(useCallback(() => listarMisCompras(estado), [estado]));

  const mostrar = compras?.filter((compra) => esCompraPasada(compra) === (momento === "pasados"));

  return (
    <View style={styles.contenedor}>
      <EncabezadoGrande titulo="Mis entradas" />
      <View style={styles.filtros}>
        <Segmentado
          etiquetaAccesible="Momento de la entrada"
          opciones={MOMENTOS}
          valor={momento}
          onCambiar={setMomento}
        />
        <Chips
          etiquetaAccesible="Filtrar por estado"
          opciones={FILTROS}
          seleccionada={estado}
          onSeleccionar={setEstado}
        />
      </View>
      {error ? (
        <MensajeError mensaje={error} onReintentar={recargar} />
      ) : !mostrar ? (
        <Cargando />
      ) : (
        <FlatList
          data={mostrar}
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
              mensaje={
                estado
                  ? "No tenés entradas en este estado"
                  : momento === "proximos"
                    ? "No tenés entradas para próximos eventos"
                    : "Todavía no tenés entradas pasadas"
              }
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  filtros: { gap: espaciado.m, paddingBottom: espaciado.s, backgroundColor: colores.fondo },
  lista: { padding: espaciado.l, gap: espaciado.l, flexGrow: 1, paddingBottom: espacioParaLaBarra + espaciado.l },
});
