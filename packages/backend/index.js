import "dotenv/config";
import { crearApp } from "./app.js";

const app = crearApp();

// 0.0.0.0 para que el celular (Expo Go) pueda llegar al backend por la IP de la red local
const PORT = process.env.SERVER_PORT || process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
