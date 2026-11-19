import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUsuario } from "../context/UsuarioContext";
import { useAvisos } from "../context/AvisosContext";
import { mensajeDeError } from "../services/api";
import { Campo } from "../components/Campo";
import { Boton } from "../components/Boton";
import { hayErrores, validarLogin } from "../utils/validaciones";
import { colores, espaciado } from "../theme";

export default function Login() {
  const { iniciarSesion } = useUsuario();
  const { mostrarError } = useAvisos();
  const [formulario, setFormulario] = useState({ email: "", contrasenia: "" });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo) => (valor) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  };

  const ingresar = async () => {
    const erroresDeValidacion = validarLogin(formulario);
    setErrores(erroresDeValidacion);
    if (hayErrores(erroresDeValidacion)) return;

    setEnviando(true);
    try {
      await iniciarSesion(formulario.email.trim(), formulario.contrasenia);
    } catch (error) {
      mostrarError(mensajeDeError(error));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={styles.marca}>
            <View style={styles.logo}>
              <Ionicons name="ticket" size={40} color={colores.negro} />
            </View>
            <Text style={styles.nombre}>
              AI <Text style={styles.nombreVerde}>Ticket</Text> It
            </Text>
            <Text style={styles.bajada}>Descubrí eventos y comprá tus entradas</Text>
          </View>

          <View style={styles.formulario}>
            <Campo
              etiqueta="Email"
              value={formulario.email}
              onChangeText={cambiar("email")}
              error={errores.email}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <Campo
              etiqueta="Contraseña"
              value={formulario.contrasenia}
              onChangeText={cambiar("contrasenia")}
              error={errores.contrasenia}
              placeholder="Tu contraseña"
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              onSubmitEditing={ingresar}
            />

            <Boton titulo="Ingresar" icono="log-in-outline" onPress={ingresar} cargando={enviando} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.negro },
  flex: { flex: 1 },
  contenido: { flexGrow: 1, justifyContent: "center", padding: espaciado.xl, gap: espaciado.xl * 1.5 },
  marca: { alignItems: "center", gap: espaciado.s },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colores.primario,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaciado.s,
  },
  nombre: { fontSize: 34, fontWeight: "800", letterSpacing: -0.8, color: colores.blanco },
  nombreVerde: { color: colores.primario },
  bajada: { fontSize: 15, color: colores.textoSecundario },
  formulario: { gap: espaciado.l },
});
