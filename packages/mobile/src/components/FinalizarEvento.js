import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Boton } from "./Boton";
import { finalizarEvento } from "../services/eventos.service";
import { mensajeDeError } from "../services/api";
import { useAvisos } from "../context/AvisosContext";
import { confirmar } from "../utils/confirmar";
import { colores, espaciado, radio, texto } from "../theme";

const compras = (cantidad) => `${cantidad} ${cantidad === 1 ? "compra" : "compras"}`;

// Solo lo muestran las pantallas del organizador del evento. Simula que el evento ya se realizó: las compras pagas
// pasan a utilizadas y cada comprador puede calificar su experiencia desde "Mis compras".
export function FinalizarEvento({ evento, onFinalizado }) {
  const [finalizando, setFinalizando] = useState(false);
  const { mostrarError, mostrarExito } = useAvisos();

  const finalizar = async () => {
    const confirmado = await confirmar({
      titulo: "Finalizar evento",
      mensaje:
        `Vas a dar por terminado "${evento.nombre}". Las entradas pagas se marcan como utilizadas, las que no se ` +
        "pagaron se cancelan y cada comprador va a poder dejar su reseña. No se puede deshacer.",
      textoConfirmar: "Finalizar",
    });
    if (!confirmado) return;

    setFinalizando(true);
    try {
      const { comprasUtilizadas, comprasCanceladas } = await finalizarEvento(evento.id);
      const canceladas = comprasCanceladas > 0 ? ` Se cancelaron ${compras(comprasCanceladas)} sin pagar.` : "";
      mostrarExito(
        `Evento finalizado. Ya pueden reseñarlo los compradores de ${compras(comprasUtilizadas)}.${canceladas}`,
      );
      onFinalizado();
    } catch (e) {
      mostrarError(mensajeDeError(e));
    } finally {
      setFinalizando(false);
    }
  };

  if (evento.finalizado) {
    return (
      <View style={styles.finalizado} accessible accessibilityLabel="Evento finalizado">
        <Text style={styles.textoFinalizado}>Evento finalizado. Los compradores ya pueden dejar su reseña.</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={texto.secundario}>
        Simulá que el evento ya se realizó: las entradas pagas pasan a utilizadas y los compradores pueden calificarlo.
      </Text>
      <Boton titulo="Finalizar evento" icono="flag" variante="secundario" onPress={finalizar} cargando={finalizando} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: espaciado.s },
  finalizado: { padding: espaciado.m, borderRadius: radio.m, backgroundColor: colores.primarioSuave },
  textoFinalizado: { color: colores.primarioOscuro, fontWeight: "600" },
});
