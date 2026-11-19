import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Host, List, ListItem, Text as TextoNativo } from "@expo/ui";
import { useUsuario } from "../../context/UsuarioContext";
import { Avatar } from "../../components/Avatar";
import { Boton } from "../../components/Boton";
import { EncabezadoGrande } from "../../components/EncabezadoGrande";
import { API_URL } from "../../config";
import { colores, contorno, espaciado, espacioParaLaBarra, fuente, radio, texto } from "../../theme";

const ALTO_DE_FILA = 60;

// Accesos del perfil: lo que en la app de Punch vive en pestañas propias acá es un menú
const ACCESOS = [
  {
    ruta: "/mis-eventos",
    icono: "megaphone-outline",
    titulo: "Mis eventos",
    detalle: "Publicá eventos y mirá sus ventas",
  },
  {
    ruta: "/eventos/nuevo",
    icono: "add-circle-outline",
    titulo: "Publicar un evento",
    detalle: "Creá uno nuevo en minutos",
  },
  { ruta: "/favoritos", icono: "bookmark-outline", titulo: "Favoritos", detalle: "Los eventos que guardaste" },
];

export default function Perfil() {
  const router = useRouter();
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
          <Text style={texto.secundario}>{usuario.email}</Text>
        </View>

        <View style={styles.menu}>
          {ACCESOS.map(({ ruta, icono, titulo, detalle }) => (
            <Pressable
              key={ruta}
              onPress={() => router.push(ruta)}
              accessibilityRole="button"
              accessibilityLabel={titulo}
              style={({ pressed }) => [styles.acceso, pressed && styles.presionado]}
            >
              <View style={styles.iconoDelAcceso}>
                <Ionicons name={icono} size={20} color={colores.primarioClaro} />
              </View>
              <View style={styles.textosDelAcceso}>
                <Text style={styles.tituloDelAcceso}>{titulo}</Text>
                <Text style={texto.pie}>{detalle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colores.textoApagado} />
            </Pressable>
          ))}
        </View>

        {/* Lista agrupada nativa (SwiftUI en iOS, Compose en Android) con los datos de la cuenta */}
        <Host colorScheme="dark" style={{ height: ALTO_DE_FILA * 2 + 24 }}>
          <List>
            <ListItem supportingText={usuario.email}>
              <TextoNativo>Email</TextoNativo>
            </ListItem>
            <ListItem supportingText={API_URL}>
              <TextoNativo>Servidor</TextoNativo>
            </ListItem>
          </List>
        </Host>

        <Boton titulo="Cerrar sesión" variante="peligro" icono="log-out-outline" onPress={salir} cargando={saliendo} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenedor: { padding: espaciado.l, gap: espaciado.l, paddingBottom: espacioParaLaBarra + espaciado.l },
  tarjeta: {
    alignItems: "center",
    gap: espaciado.s,
    padding: espaciado.xl,
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    borderCurve: "continuous",
    ...contorno,
  },
  menu: {
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    borderCurve: "continuous",
    overflow: "hidden",
    ...contorno,
  },
  acceso: { flexDirection: "row", alignItems: "center", gap: espaciado.m, padding: espaciado.m + 2 },
  presionado: { backgroundColor: colores.superficieAlta },
  iconoDelAcceso: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: colores.primarioSuave,
  },
  textosDelAcceso: { flex: 1 },
  tituloDelAcceso: { ...fuente, fontSize: 16, fontWeight: "700", color: colores.texto },
});
