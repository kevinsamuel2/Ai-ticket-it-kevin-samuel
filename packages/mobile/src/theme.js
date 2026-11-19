import { Platform } from "react-native";

// Colores, espaciados y estilos de texto compartidos por toda la app. Paleta: negro, verde y blanco.
// El estilo se inspira en Punch Tickets: fondo negro, tarjetas oscuras con borde fino, texto blanco en negrita,
// verde lima como único color de acento y botones redondeados con texto oscuro sobre el verde.
export const colores = {
  primario: "#6BB53A",
  // Verde más claro para textos, íconos y precios sobre fondo oscuro (el primario queda para rellenos)
  primarioClaro: "#8BD14F",
  primarioSuave: "rgba(107,181,58,0.16)",
  // Texto y íconos que van sobre un relleno verde: oscuro, para que se lea bien
  sobrePrimario: "#0A0A0A",
  negro: "#000000",
  fondo: "#000000",
  superficie: "#0F0F10",
  superficieAlta: "#18181A",
  blanco: "#FFFFFF",
  texto: "#FFFFFF",
  textoSecundario: "#A1A1AA",
  textoApagado: "#71717A",
  relleno: "#1C1C1F",
  borde: "#27272A",
  separador: "#1F1F22",
  peligro: "#F87171",
  peligroSuave: "rgba(248,113,113,0.14)",
  estrella: "#8BD14F",
};

export const espaciado = { xs: 4, s: 8, m: 12, l: 16, xl: 24 };

export const radio = { s: 8, m: 12, l: 16 };

// Espacio que dejan las pantallas con pestañas al final para que la barra flotante no tape el último elemento
export const espacioParaLaBarra = 110;

// Tipografía del sistema: San Francisco en iOS, Roboto en Android y la fuente del sistema en web
export const fuente = Platform.select({
  ios: { fontFamily: "System" },
  web: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif' },
  default: {},
});

// Escala tipográfica: títulos grandes y en negrita (como Punch), cuerpo claro y textos secundarios en gris
export const texto = {
  grande: { ...fuente, fontSize: 32, fontWeight: "800", letterSpacing: -0.6, color: colores.texto },
  titulo: { ...fuente, fontSize: 24, fontWeight: "800", letterSpacing: -0.4, color: colores.texto },
  subtitulo: { ...fuente, fontSize: 17, fontWeight: "700", letterSpacing: -0.2, color: colores.texto },
  cuerpo: { ...fuente, fontSize: 16, letterSpacing: -0.1, color: colores.texto },
  secundario: { ...fuente, fontSize: 14, letterSpacing: -0.1, color: colores.textoSecundario },
  pie: { ...fuente, fontSize: 13, letterSpacing: -0.05, color: colores.textoSecundario },
  // Etiqueta chica en mayúsculas y verde, como la categoría de los eventos en Punch
  etiqueta: {
    ...fuente,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colores.primarioClaro,
  },
};

// En el tema oscuro las tarjetas no llevan sombra: se separan del fondo con un borde fino
export const contorno = { borderWidth: 1, borderColor: colores.borde };

// Cada estado de compra se distingue por su ícono, su etiqueta y su combinación de colores
export const estilosDeEstado = {
  PENDIENTE: {
    color: colores.blanco,
    fondo: colores.superficieAlta,
    borde: "#52525B",
    icono: "time-outline",
    etiqueta: "Pendiente de pago",
  },
  CONFIRMADA: {
    color: colores.sobrePrimario,
    fondo: colores.primario,
    borde: colores.primario,
    icono: "checkmark-circle",
    etiqueta: "Confirmada",
  },
  UTILIZADA: {
    color: colores.sobrePrimario,
    fondo: colores.blanco,
    borde: colores.blanco,
    icono: "ticket",
    etiqueta: "Utilizada",
  },
  CANCELADA: {
    color: colores.textoSecundario,
    fondo: colores.relleno,
    borde: colores.textoApagado,
    icono: "close-circle-outline",
    etiqueta: "Cancelada",
  },
  REEMBOLSADA: {
    color: colores.primarioClaro,
    fondo: colores.primarioSuave,
    borde: colores.primarioClaro,
    icono: "cash-outline",
    etiqueta: "Reembolsada",
  },
};
