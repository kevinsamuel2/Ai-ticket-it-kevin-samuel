import { Alert, Platform } from "react-native";

// Diálogo de confirmación que funciona en el celular (Alert nativo) y en la web (window.confirm).
// Devuelve una promesa que resuelve true si el usuario confirmó.
export function confirmar({ titulo, mensaje, textoConfirmar = "Confirmar" }) {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensaje}`));
  }
  return new Promise((resolver) => {
    Alert.alert(titulo, mensaje, [
      { text: "Volver", style: "cancel", onPress: () => resolver(false) },
      { text: textoConfirmar, style: "destructive", onPress: () => resolver(true) },
    ]);
  });
}
