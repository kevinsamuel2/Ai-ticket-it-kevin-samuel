import { Platform } from "react-native";

// Colores, espaciados y estilos de texto compartidos por toda la app. Paleta: negro, verde y blanco.
// El estilo sigue las Human Interface Guidelines de Apple: fondo agrupado gris claro, tarjetas blancas sin
// bordes marcados, tipografía del sistema (SF en iOS) con la escala de Apple y controles redondeados.
export const colores = {
  primario: "#16A34A",
  primarioOscuro: "#15803D",
  primarioSuave: "#E8F7EE",
  negro: "#000000",
  grisOscuro: "#1C1C1E",
  fondo: "#F2F2F7",
  superficie: "#FFFFFF",
  blanco: "#FFFFFF",
  texto: "#000000",
  textoSecundario: "#6C6C70",
  relleno: "#EEEEF0",
  borde: "#D1D1D6",
  separador: "#E5E5EA",
  peligro: "#DC2626",
  peligroSuave: "#FDECEC",
  estrella: "#16A34A",
};

export const espaciado = { xs: 4, s: 8, m: 12, l: 16, xl: 24 };

export const radio = { s: 8, m: 12, l: 20 };

// Tipografía del sistema: San Francisco en iOS, Roboto en Android y la fuente del sistema en web
export const fuente = Platform.select({
  ios: { fontFamily: "System" },
  web: { fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif' },
  default: {},
});

// Escala tipográfica de Apple: large title, title, headline, body, subheadline y footnote
export const texto = {
  grande: { ...fuente, fontSize: 34, fontWeight: "700", letterSpacing: 0.37, color: colores.texto },
  titulo: { ...fuente, fontSize: 22, fontWeight: "700", letterSpacing: 0.35, color: colores.texto },
  subtitulo: { ...fuente, fontSize: 17, fontWeight: "600", letterSpacing: -0.41, color: colores.texto },
  cuerpo: { ...fuente, fontSize: 17, letterSpacing: -0.41, color: colores.texto },
  secundario: { ...fuente, fontSize: 14, letterSpacing: -0.15, color: colores.textoSecundario },
  pie: { ...fuente, fontSize: 13, letterSpacing: -0.08, color: colores.textoSecundario },
};

// Sombra suave y difusa de las tarjetas, en lugar de un borde: así se separan del fondo gris
export const sombra = Platform.select({
  web: { boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)" },
  default: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});

// Cada estado de compra se distingue por su ícono, su etiqueta y su combinación de colores
export const estilosDeEstado = {
  PENDIENTE: {
    color: colores.negro,
    fondo: colores.superficie,
    borde: colores.borde,
    icono: "time-outline",
    etiqueta: "Pendiente de pago",
  },
  CONFIRMADA: {
    color: colores.blanco,
    fondo: colores.primario,
    borde: colores.primario,
    icono: "checkmark-circle",
    etiqueta: "Confirmada",
  },
  UTILIZADA: {
    color: colores.blanco,
    fondo: colores.negro,
    borde: colores.negro,
    icono: "ticket",
    etiqueta: "Utilizada",
  },
  CANCELADA: {
    color: colores.textoSecundario,
    fondo: colores.relleno,
    borde: colores.relleno,
    icono: "close-circle-outline",
    etiqueta: "Cancelada",
  },
  REEMBOLSADA: {
    color: colores.primarioOscuro,
    fondo: colores.primarioSuave,
    borde: colores.primarioSuave,
    icono: "cash-outline",
    etiqueta: "Reembolsada",
  },
};
