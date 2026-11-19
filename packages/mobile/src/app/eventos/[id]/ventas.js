import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCarga } from "../../../hooks/useCarga";
import { obtenerVentasDeEvento } from "../../../services/eventos.service";
import { Cargando, MensajeError } from "../../../components/EstadosDeCarga";
import { CompraCard } from "../../../components/CompraCard";
import { colores, espaciado, estilosDeEstado, radio, sombra, texto } from "../../../theme";
import { formatearFecha, formatearPrecio } from "../../../utils/formato";

// Vista del organizador: compras del evento por estado y cuántas entradas quedan de cada tipo
export default function VentasDelEvento() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [estado, setEstado] = useState(null);
  const {
    datos: ventas,
    error,
    recargar,
  } = useCarga(useCallback(() => obtenerVentasDeEvento(id, estado), [id, estado]));

  if (error) return <MensajeError mensaje={error} onReintentar={recargar} />;
  if (!ventas) return <Cargando />;

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Stack.Screen options={{ title: "Ventas" }} />
      <View>
        <Text style={texto.titulo}>{ventas.evento.nombre}</Text>
        <Text style={texto.secundario}>{formatearFecha(ventas.evento.fecha)}</Text>
      </View>

      <View style={styles.seccion}>
        <Text style={texto.subtitulo}>Disponibilidad</Text>
        {ventas.disponibilidad.map(({ tipoEntrada, cupo, vendidas, disponibles }) => (
          <View key={tipoEntrada.id} style={styles.tipo}>
            <View style={styles.filaEntre}>
              <Text style={styles.tipoNombre}>
                {tipoEntrada.nombre} · {formatearPrecio(tipoEntrada.precio)}
              </Text>
              <Text style={[styles.disponibles, disponibles === 0 && styles.agotado]}>
                {disponibles === 0 ? "Agotado" : `Quedan ${disponibles}`}
              </Text>
            </View>
            <View
              style={styles.barra}
              accessible
              accessibilityLabel={`${vendidas} de ${cupo} entradas vendidas o reservadas`}
            >
              <View style={[styles.barraRelleno, { width: `${(vendidas / cupo) * 100}%` }]} />
            </View>
            <Text style={texto.secundario}>
              {vendidas} de {cupo} vendidas o reservadas
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.seccion}>
        <Text style={texto.subtitulo}>Compras por estado</Text>
        <View style={styles.contadores}>
          {Object.entries(ventas.cantidadPorEstado).map(([nombreEstado, cantidad]) => {
            const estilo = estilosDeEstado[nombreEstado];
            const activo = estado === nombreEstado;
            return (
              <Pressable
                key={nombreEstado}
                onPress={() => setEstado(activo ? null : nombreEstado)}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                accessibilityLabel={`${estilo.etiqueta}: ${cantidad}. Tocar para filtrar`}
                style={[
                  styles.contador,
                  { backgroundColor: estilo.fondo, borderColor: activo ? colores.negro : estilo.borde },
                  activo && styles.contadorActivo,
                ]}
              >
                <Text style={[styles.contadorNumero, { color: estilo.color }]}>{cantidad}</Text>
                <Text style={[styles.contadorEtiqueta, { color: estilo.color }]}>{estilo.etiqueta}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.seccion}>
        <Text style={texto.subtitulo}>
          {estado ? `Compras: ${estilosDeEstado[estado].etiqueta}` : "Todas las compras"}
        </Text>
        {ventas.compras.length === 0 ? (
          <Text style={texto.secundario}>No hay compras para mostrar.</Text>
        ) : (
          ventas.compras.map((compra) => (
            <CompraCard
              key={compra.id}
              compra={compra}
              mostrarComprador
              onPress={() => router.push(`/compras/${compra.id}`)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: espaciado.l, gap: espaciado.xl, paddingBottom: espaciado.xl * 2 },
  seccion: { gap: espaciado.s },
  tipo: {
    gap: espaciado.xs,
    padding: espaciado.m,
    borderRadius: radio.m + 4,
    borderCurve: "continuous",
    backgroundColor: colores.superficie,
    ...sombra,
  },
  filaEntre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tipoNombre: { fontWeight: "600", color: colores.texto },
  disponibles: { fontWeight: "700", color: colores.primarioOscuro },
  agotado: { color: colores.negro },
  barra: { height: 8, borderRadius: 4, backgroundColor: colores.relleno, overflow: "hidden" },
  barraRelleno: { height: "100%", backgroundColor: colores.primario },
  contadores: { flexDirection: "row", flexWrap: "wrap", gap: espaciado.s },
  contador: {
    minWidth: "30%",
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: espaciado.s,
    borderRadius: radio.m,
    borderWidth: 1.5,
  },
  contadorActivo: { borderWidth: 3 },
  contadorNumero: { fontSize: 22, fontWeight: "700" },
  contadorEtiqueta: { fontSize: 12, fontWeight: "600" },
});
