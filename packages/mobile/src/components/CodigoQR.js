import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import qrcode from "qrcode-generator";

// Dibuja un código QR con Views (sin SVG ni módulos nativos): cada fila agrupa los cuadrados oscuros contiguos
// en una sola barra, así un QR de ~30x30 usa unas pocas decenas de Views en vez de cientos.
export function matrizDeQR(contenido) {
  const qr = qrcode(0, "M");
  qr.addData(contenido);
  qr.make();
  const cantidad = qr.getModuleCount();
  const filas = [];
  for (let fila = 0; fila < cantidad; fila++) {
    const tramos = [];
    let inicio = null;
    for (let columna = 0; columna <= cantidad; columna++) {
      const oscuro = columna < cantidad && qr.isDark(fila, columna);
      if (oscuro && inicio === null) inicio = columna;
      if (!oscuro && inicio !== null) {
        tramos.push({ inicio, largo: columna - inicio });
        inicio = null;
      }
    }
    filas.push(tramos);
  }
  return { cantidad, filas };
}

export function CodigoQR({ contenido, tamanio = 200, color = "#000000", fondo = "#FFFFFF", accessibilityLabel }) {
  const { cantidad, filas } = useMemo(() => matrizDeQR(contenido), [contenido]);
  const celda = tamanio / cantidad;

  return (
    <View
      style={[styles.contenedor, { width: tamanio, height: tamanio, backgroundColor: fondo }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {filas.map((tramos, fila) =>
        tramos.map(({ inicio, largo }) => (
          <View
            key={`${fila}-${inicio}`}
            style={{
              position: "absolute",
              top: fila * celda,
              left: inicio * celda,
              width: largo * celda,
              height: celda + 0.5,
              backgroundColor: color,
            }}
          />
        )),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { overflow: "hidden" },
});
