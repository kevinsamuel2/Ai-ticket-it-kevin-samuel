import cron from "node-cron";

// Procesamiento asincrónico fuera del request: cada minuto se buscan las compras pendientes de pago
// que superaron el plazo y se cancelan, para que el cupo que reservaban vuelva a estar disponible.

export async function ejecutarVencimientoDeCompras(compraService, minutosParaPagar, ahora = new Date()) {
  // El error se atrapa acá: si una ejecución falla, no tiene que tirar abajo el servidor
  // ni frenar las ejecuciones siguientes (no hay un request ni un middleware de errores que lo maneje)
  try {
    const cantidad = await compraService.vencerComprasPendientes(minutosParaPagar, ahora);
    if (cantidad > 0) {
      console.log(`[cron] Se vencieron ${cantidad} compra(s) pendientes de pago`);
    }
    return cantidad;
  } catch (error) {
    console.error("[cron] Error al vencer compras pendientes:", error);
    return 0;
  }
}

export function programarVencimientoDeCompras(compraService, { minutosParaPagar, expresionCron = "* * * * *" }) {
  return cron.schedule(expresionCron, () => ejecutarVencimientoDeCompras(compraService, minutosParaPagar), {
    name: "vencimiento-de-compras",
  });
}
