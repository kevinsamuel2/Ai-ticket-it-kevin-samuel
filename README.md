# AI Ticket It

Plataforma de publicación de eventos y venta de entradas. Trabajo Práctico Individual de **Desarrollo de Software** (UTN FRBA, 2C 2026), desarrollado con apoyo de herramientas de Inteligencia Artificial.

Los organizadores publican eventos con distintos tipos de entrada (precio y cupo), y los compradores exploran, compran, siguen el estado de su compra hasta el día del evento, chatean con el organizador y dejan reseñas.

## 📦 Estructura del proyecto

Monorepo administrado con **npm workspaces**:

```
.
├── packages/
│   ├── backend/        # API REST — Node + Express, persistencia en memoria
│   │   ├── domain/       # Modelo de dominio (diagrama de clases)
│   │   ├── repository/   # Repositorios en memoria (Map)
│   │   ├── services/     # Orquestación de los casos de uso + DTOs
│   │   ├── controllers/  # Traducen HTTP <-> services, validan la request
│   │   ├── routes/       # Rutas REST
│   │   ├── middleware/   # Identificación del usuario y manejo de errores
│   │   ├── jobs/         # Cron job de vencimiento de compras
│   │   ├── docs/         # Documentación Swagger (un YAML por recurso)
│   │   └── test/         # Tests de dominio, services (con mocks) e integración (supertest)
│   └── mobile/         # App mobile — React Native con Expo y Expo Router
│       ├── src/app/        # Pantallas (cada archivo es una ruta)
│       ├── src/components/ # Componentes reutilizables
│       ├── src/services/   # Cliente HTTP (axios) y llamadas a la API
│       ├── src/context/    # Sesión global (Context API + hook useUsuario)
│       ├── src/hooks/      # Custom hooks (carga de datos, búsqueda diferida)
│       └── __tests__/      # Tests con React Native Testing Library
├── .github/workflows/  # CI: lint, tests y build de la imagen Docker
└── docker-compose.yml  # Levanta el backend en un contenedor
```

## ✅ Requisitos

- **Node.js 22.13 o superior** (lo exige Expo SDK 58).
- Para usar la app en el celular: **Expo Go** (Android / iOS), con el celular en la **misma red Wi-Fi** que la PC.

## 🚀 Cómo levantarlo

```bash
npm install
```

### 1. Backend

```bash
npm run dev:backend
```

Queda escuchando en `http://localhost:3001`, con datos de prueba ya cargados (la persistencia es en memoria: al reiniciar se vuelven a cargar). La documentación interactiva de la API está en **http://localhost:3001/api-docs**.

Variables opcionales en `packages/backend/.env` (ver `.env.example`):

| Variable             | Default | Descripción                                                        |
| -------------------- | ------- | ------------------------------------------------------------------ |
| `SERVER_PORT`        | 3001    | Puerto del backend                                                 |
| `MINUTOS_PARA_PAGAR` | 1440    | Plazo para pagar (24 h) antes de que el cron job cancele la compra |
| `ALLOWED_ORIGINS`    | todos   | Orígenes permitidos por CORS                                       |

### 2. App mobile

```bash
npm run start:mobile
```

- **En el celular:** escaneá el QR con Expo Go. La app se conecta sola al backend usando la IP de la PC. Si no conecta, revisá que el firewall de Windows permita el puerto 3001, o configurá la URL a mano creando `packages/mobile/.env` con `EXPO_PUBLIC_API_URL=http://<IP-de-tu-PC>:3001`.
- **En el navegador:** apretá `w` en la terminal de Expo (o `npm run web --workspace=mobile`).

### Usuarios de prueba

Todos con la contraseña **`ticket123`**:

| Email                      | Rol en los datos de prueba                                              |
| -------------------------- | ----------------------------------------------------------------------- |
| `florencia@aiticketit.com` | Organiza recitales (reputación 4.5)                                     |
| `gonzalo@aiticketit.com`   | Organiza teatro, stand-up y una conferencia (reputación 3.8)            |
| `nahuel@aiticketit.com`    | Comprador: tiene compras en todos los estados y una entrada sin reseñar |
| `agustina@aiticketit.com`  | Compradora                                                              |
| `camila@aiticketit.com`    | Organiza Bad Bunny, Lollapalooza y Cosquín Rock (reputación 4.4)        |
| `ramiro@aiticketit.com`    | Organiza deportes: Párense de Manos, Copa Potrero y Superclásico (4.0)  |

Cualquier usuario puede comprar y también publicar eventos (pero no comprar entradas de un evento propio). No hay registro de usuarios: la consigna no lo pide, así que se entra con estas cuentas de prueba.

## 🧪 Tests

```bash
npm test                         # backend + mobile
npm test --workspace=backend     # dominio, services con mocks e integración con supertest
npm test --workspace=mobile      # componentes y pantallas con React Native Testing Library
npm run lint
```

## 🐳 Docker (opcional)

```bash
docker compose up --build
```

Levanta el backend en `http://localhost:3001`. El CI de GitHub Actions corre el lint, los tests y el build de la imagen en cada push.

## 📋 Casos de uso

| Caso de uso                                                                | Backend                                          | Pantalla                          |
| -------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------- |
| Ver mis compras con su estado y los días que faltan si está confirmada     | `GET /compras`                                   | Mis compras                       |
| Ver las compras de un evento y cuántas entradas quedan de cada tipo        | `GET /eventos/:id/compras`                       | Mis eventos → Ventas              |
| Buscar eventos por texto o explorarlos por categoría                       | `GET /eventos?texto=&categoria=`                 | Explorar                          |
| Crear un evento con distintos tipos de entrada, cada uno con precio y cupo | `POST /eventos`                                  | Mis eventos → Publicar            |
| Comprador y organizador intercambian mensajes en cualquier momento         | `GET/POST /compras/:id/mensajes`                 | Compra → Chat                     |
| Cancelar una compra para obtener el reembolso                              | `POST /compras/:id/cambios-de-estado`            | Compra → Cancelar                 |
| Solo se cancela si no está utilizada y el evento no se realizó             | Regla en `Compra.cancelar()`                     | El botón aparece solo si se puede |
| Simular que el evento ya se realizó (solo el organizador)                  | `POST /eventos/:id/finalizacion`                 | Mis eventos → Finalizar evento    |
| Puntuar el evento y comentar una vez utilizada la entrada                  | `POST /compras/:id/resenia`                      | Mis compras → Compra → Reseña     |
| Ver las reseñas de eventos anteriores del organizador                      | `GET /eventos/:id`, `GET /usuarios/:id/resenias` | Detalle del evento                |
| Ordenar por precio, fecha del evento y puntaje del organizador             | `GET /eventos?orden=precio\|fecha\|puntaje`      | Explorar                          |
| Comprar eligiendo tipo de entrada y cantidad, sin superar el cupo          | `POST /compras`                                  | Detalle del evento                |

## 🧱 Decisiones de diseño

- **Diagrama de clases completo**: además de lo que piden los casos de uso, están implementados los favoritos de cada usuario (`Usuario.favoritos`, en `GET/PUT/DELETE /favoritos` y la tab Favoritos) y todas las imágenes del evento (`Evento.multimedia`, en una galería en el detalle).
- **Arquitectura en capas** (dominio → repositorios → services → controllers → rutas), con inyección de dependencias armada en `config/armarApp.js`.
- **Dominio rico**: las reglas de negocio viven en las entidades del diagrama (`TipoEntrada.hayCupoPara`, `Evento.tuPrecioEstaEntre`, `Compra.actualizarEstado`...), no en los services.
- **Patrón State** para los estados de la compra: cada estado sabe a qué estados puede pasar y qué significa cancelar en él (una compra pendiente queda CANCELADA, una confirmada queda REEMBOLSADA). Sin `switch`.
- **REST**: el cambio de estado se modela como el recurso `CambioEstadoCompra` del diagrama (`POST /compras/:id/cambios-de-estado`) en lugar de verbos en la URL.
- **Manejo de errores** centralizado: errores propios (`ValidationError` 400, `UnauthorizedError` 401, `ForbiddenError` 403, `NotFoundError` 404, `ConflictError` 409, `UnprocessableEntityError` 422) y un middleware que los traduce a respuestas HTTP.
- **Sesiones**: login con email y contraseña (guardada con hash `scrypt`), token `Bearer` y permisos por rol (solo el organizador ve las ventas de su evento, solo el comprador paga o cancela, etc.).
- **Procesamiento asincrónico**: un cron job (`node-cron`) vence las compras no pagadas a tiempo y libera el cupo. La app muestra hasta cuándo se puede pagar cada compra pendiente.
- **Finalizar un evento**: como en una demo no se puede esperar a la fecha real, el organizador tiene un botón para dar por terminado su evento (`POST /eventos/:id/finalizacion`, solo él). Las compras pagas pasan a UTILIZADA, así cada comprador puede reseñar desde Mis compras sin romper la regla de que solo se reseña con la entrada utilizada, y las pendientes de pago se cancelan y liberan el cupo. El evento sale de los próximos y ya no se puede comprar ni cancelar.
- **Reglas de negocio extra**: la entrada se marca como utilizada recién el día del evento (si no, el comprador perdería la posibilidad de cancelar y podría reseñar un evento al que no fue) y el organizador no puede comprar entradas de su propio evento.
- **App**: Expo Router con rutas protegidas, Context API + custom hooks para la sesión, la carga de datos y la paginación, una única instancia de axios, formularios con validaciones y componentes con props de accesibilidad.
- **Feedback al usuario**: pantalla de carga al abrir la app (verifica que el backend responda y, si no, permite reintentar), indicadores de carga en cada pantalla y botón, y avisos visibles de error y de éxito en todas las acciones.

## ➕ Extras (no los pide la consigna)

| Extra                                 | Para qué                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Login con token y contraseña con hash | Saber quién hace cada operación y aplicar permisos por rol sin que se pueda falsificar el usuario |
| Cron job de vencimiento               | Que una compra pendiente que nunca se paga no bloquee el cupo para siempre                        |
| Paginación                            | Que la búsqueda siga funcionando bien con muchos eventos                                          |
| Swagger                               | Documentar y probar la API desde el navegador                                                     |
| Docker y CI (GitHub Actions)          | Levantar el backend en cualquier máquina y correr lint y tests en cada push                       |

## 📷 Créditos de las fotos

Los eventos del momento de los datos de prueba (Bad Bunny, Párense de Manos IV, Copa Potrero, Lollapalooza, Cosquín Rock y el Superclásico) usan fotos de Wikimedia Commons con licencia libre. Están en `packages/backend/public/fotos` y las sirve el backend en `/fotos`. Los demás eventos usan fotos de [Unsplash](https://unsplash.com).

| Archivo                                | Foto                                               | Autor                                              | Licencia     |
| -------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | ------------ |
| `bad-bunny.jpg`                        | Bad Bunny Performs                                 | Comecoquito                                        | CC0          |
| `river-monumental-escenario.jpg`       | Estadio Monumental (River Plate), Buenos Aires (2) | Stefano Vigorelli                                  | CC BY-SA 4.0 |
| `river-monumental.jpg`                 | Estadio Monumental (River Plate), Buenos Aires (1) | Stefano Vigorelli                                  | CC BY-SA 4.0 |
| `platense-ciudad-de-vicente-lopez.jpg` | Estadio Ciudad de Vicente López                    | Fernando Martello                                  | CC BY-SA 4.0 |
| `platense-estadio.jpg`                 | Estadio de Platense                                | EstudiantesFotografias                             | CC BY-SA 3.0 |
| `kun-aguero.jpg`                       | Sergio Agüero 2011-09-08                           | Harald Loos / Puma SE                              | CC BY 3.0    |
| `lollapalooza-2015.jpg`                | Lollapalooza Argentina 2015                        | Leonardo Samrani                                   | CC BY 2.0    |
| `lollapalooza-2025.jpg`                | Tate McRae - Lollapalooza Argentina 2025           | Live Shows & Concerts! Shows y Conciertos en vivo! | CC BY 3.0    |
| `cosquin-rock.jpg`                     | Cosquín Rock                                       | Arianza1                                           | CC BY-SA 4.0 |
| `bombonera.jpg`                        | La Bombonera 2                                     | Matibro                                            | CC BY-SA 4.0 |

Las fotos se achicaron a 960 px de ancho. Los datos de estos eventos (precios, cupos y fechas) son de ejemplo: las fechas son relativas a hoy y no coinciden con las reales.
