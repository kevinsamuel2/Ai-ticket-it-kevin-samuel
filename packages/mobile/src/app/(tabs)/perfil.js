import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useUsuario } from "../../context/UsuarioContext";
import { Avatar } from "../../components/Avatar";
import { Boton } from "../../components/Boton";
import { API_URL } from "../../config";
import { colores, espaciado, radio, texto } from "../../theme";

export default function Perfil() {
  const { usuario, cerrarSesion } = useUsuario();
  const [saliendo, setSaliendo] = useState(false);

  const salir = async () => {
    setSaliendo(true);
    await cerrarSesion();
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <View style={styles.tarjeta}>
        <Avatar nombreCompleto={usuario.nombreCompleto} tamanio={72} />
        <Text style={texto.titulo}>{usuario.nombreCompleto}</Text>
        <Text style={texto.secundario}>{usuario.email}</Text>
        <Text style={[texto.secundario, styles.centrado]}>
          Podés comprar entradas y también publicar tus propios eventos.
        </Text>
      </View>

      <Boton titulo="Cerrar sesión" variante="secundario" icono="log-out-outline" onPress={salir} cargando={saliendo} />

      <Text style={[texto.secundario, styles.centrado]}>Conectado a {API_URL}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: espaciado.l, gap: espaciado.l },
  tarjeta: {
    alignItems: "center",
    gap: espaciado.s,
    padding: espaciado.xl,
    backgroundColor: colores.superficie,
    borderRadius: radio.l,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  centrado: { textAlign: "center" },
});
