const ESTADOS_FINALES = ["UTILIZADA", "CANCELADA", "REEMBOLSADA"];

// Una compra es "pasada" (pestaña Pasados de Entradas) si ya se usó, se canceló o se reembolsó, o si el evento
// ya ocurrió. El resto son las entradas "próximas": reservadas pendientes de pago o confirmadas para un evento futuro.
export function esCompraPasada(compra, ahora = new Date()) {
  return ESTADOS_FINALES.includes(compra.estado) || new Date(compra.evento.fecha) <= ahora;
}
