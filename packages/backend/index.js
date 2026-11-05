import "dotenv/config";
import { armarApp, armarServices } from "./config/armarApp.js";
import { crearRepositorios } from "./config/repositorios.js";
import { cargarDatosDePrueba } from "./data/datosDePrueba.js";
import { programarVencimientoDeCompras } from "./jobs/vencimientoDeCompras.js";
import { MINUTOS_PARA_PAGAR_POR_DEFECTO } from "./services/Compra.service.js";

const repositorios = crearRepositorios();
await cargarDatosDePrueba(repositorios);

// Plazo para pagar una compra pendiente antes de que el cron job la cancele (por defecto 24 horas)
const minutosParaPagar = Number(process.env.MINUTOS_PARA_PAGAR) || MINUTOS_PARA_PAGAR_POR_DEFECTO;
const services = armarServices(repositorios, { minutosParaPagar });
const app = armarApp(repositorios, services);

// Cron job: vence las compras que no se pagaron dentro del plazo y libera su cupo
programarVencimientoDeCompras(services.compraService);

// 0.0.0.0 para que el celular (Expo Go) pueda llegar al backend por la IP de la red local
const PORT = process.env.SERVER_PORT || process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
  console.log(`Las compras pendientes vencen a los ${minutosParaPagar} minutos si no se pagan`);
});
