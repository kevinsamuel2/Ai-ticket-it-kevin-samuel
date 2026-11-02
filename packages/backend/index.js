import "dotenv/config";
import { armarApp, armarServices } from "./config/armarApp.js";
import { crearRepositorios } from "./config/repositorios.js";
import { cargarDatosDePrueba } from "./data/datosDePrueba.js";
import { programarVencimientoDeCompras } from "./jobs/vencimientoDeCompras.js";

const repositorios = crearRepositorios();
await cargarDatosDePrueba(repositorios);

const services = armarServices(repositorios);
const app = armarApp(repositorios, services);

// Cron job: vence las compras que no se pagaron dentro del plazo y libera su cupo
const minutosParaPagar = Number(process.env.MINUTOS_PARA_PAGAR) || 60;
programarVencimientoDeCompras(services.compraService, { minutosParaPagar });

// 0.0.0.0 para que el celular (Expo Go) pueda llegar al backend por la IP de la red local
const PORT = process.env.SERVER_PORT || process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
  console.log(`Las compras pendientes vencen a los ${minutosParaPagar} minutos si no se pagan`);
});
