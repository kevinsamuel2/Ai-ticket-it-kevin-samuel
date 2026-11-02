import Constants from "expo-constants";
import { Platform } from "react-native";

const PUERTO_BACKEND = 3001;

// Si no se configura EXPO_PUBLIC_API_URL, se usa la misma máquina que sirve la app:
// en el celular (Expo Go) es la IP de la PC en la red local, en la web es localhost.
function urlPorDefecto() {
  const hostDelServidorExpo = Constants.expoConfig?.hostUri?.split(":")[0];
  if (Platform.OS === "web" || !hostDelServidorExpo) {
    return `http://localhost:${PUERTO_BACKEND}`;
  }
  return `http://${hostDelServidorExpo}:${PUERTO_BACKEND}`;
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL || urlPorDefecto();
