import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Host, List, ListItem, Text as TextoNativo } from "@expo/ui";
import { useUsuario } from "../../context/UsuarioContext";
import { Avatar } from "../../components/Avatar";
import { Boton } from "../../components/Boton";
import { EncabezadoGrande } from "../../components/EncabezadoGrande";
import { API_URL } from "../../config";
import { colores, espaciado, radio, sombra, texto } from "../../theme";

const ALTO_DE_FILA = 60;

export default function Perfil() {
  const { usuario, cerrarSesion } = useUsuario();
  const [saliendo, setSaliendo] = useState(false);

  const salir = async () => {
    setSaliendo(true);
    await cerrarSesion();
  };

  return (
    <View style={styles.pantalla}>
      <EncabezadoGrande titulo="Perfil" />
      <ScrollView contentContainerStyle={styles.contenedor}>
        <View style={styles.tarjeta}>
          <Avatar nombreCompleto={usuario.nombreCompleto} tamanio={80} />
          <Text style={texto.titulo}>{usuario.nombreCompleto}</Text>
        </View>

        {/* Lista agrupada nativa (SwiftUI en iOS, Compose en Android) con los datos de la cuenta */}
        <Host colorScheme="light" style={{ height: ALTO_DE_FILA * 2 + 24 }}>
          <List>
            <ListItem supportingText={usuario.email}>
              <TextoNativo>Email</TextoNativo>
            </ListItem>
            <ListItem supportingText={API_URL}>
              <TextoNativo>Servidor</TextoNativo>
            </ListItem>
          </List>
        </Host>

        <Text style={[texto.pie, styles.centrado]}>Podés comprar entradas y también publicar tus propios eventos.</Text>

        <Boton titulo="Cerrar sesión" variante="peligro" icono="log-out-outline" onPress={salir} cargando={saliendo} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenedor: { padding: espaciado.l, gap: espaciado.l },
  tarjeta: {
    alignItems: "center",
    gap: espaciado.s,
    padding: espaciado.xl,
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    borderCurve: "continuous",
    ...sombra,
  },
  centrado: { textAlign: "center" },
});
