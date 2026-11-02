// Colores, espaciados y estilos de texto compartidos por toda la app. Paleta: negro, verde y blanco.
export const colores = {
  primario: "#16A34A",
  primarioOscuro: "#15803D",
  primarioSuave: "#DCFCE7",
  negro: "#0A0A0A",
  grisOscuro: "#27272A",
  fondo: "#FAFAFA",
  superficie: "#FFFFFF",
  blanco: "#FFFFFF",
  texto: "#0A0A0A",
  textoSecundario: "#52525B",
  borde: "#E4E4E7",
  peligro: "#DC2626",
  estrella: "#16A34A",
};

export const espaciado = { xs: 4, s: 8, m: 12, l: 16, xl: 24 };

export const radio = { s: 8, m: 12, l: 16 };

export const texto = {
  titulo: { fontSize: 22, fontWeight: "700", color: colores.texto },
  subtitulo: { fontSize: 17, fontWeight: "600", color: colores.texto },
  cuerpo: { fontSize: 15, color: colores.texto },
  secundario: { fontSize: 13, color: colores.textoSecundario },
};

// Cada estado de compra se distingue por su ícono, su etiqueta y su combinación de colores
export const estilosDeEstado = {
  PENDIENTE: {
    color: colores.negro,
    fondo: colores.blanco,
    borde: colores.negro,
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
    fondo: "#F4F4F5",
    borde: colores.borde,
    icono: "close-circle-outline",
    etiqueta: "Cancelada",
  },
  REEMBOLSADA: {
    color: colores.primarioOscuro,
    fondo: colores.primarioSuave,
    borde: colores.primario,
    icono: "cash-outline",
    etiqueta: "Reembolsada",
  },
};
