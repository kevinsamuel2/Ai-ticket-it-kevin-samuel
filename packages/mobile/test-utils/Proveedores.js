import { SafeAreaProvider } from "react-native-safe-area-context";
import { AvisosProvider } from "../src/context/AvisosContext";
import { UsuarioProvider } from "../src/context/UsuarioContext";

// En los tests no hay pantalla real: se fijan las medidas para que los componentes que leen el área segura funcionen
const MEDIDAS = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

// Los mismos providers que usa la app (src/app/_layout.js), para renderizar pantallas y componentes en los tests
export function Proveedores({ children }) {
  return (
    <SafeAreaProvider initialMetrics={MEDIDAS}>
      <AvisosProvider>
        <UsuarioProvider>{children}</UsuarioProvider>
      </AvisosProvider>
    </SafeAreaProvider>
  );
}
