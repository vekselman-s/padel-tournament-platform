# 🚀 Setup Completo - Plataforma de Torneos de Pádel

Esta guía te llevará paso a paso para levantar toda la plataforma en tu máquina local.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js 20+** - [Descargar](https://nodejs.org/)
- **pnpm 9+** - Instalar con: `npm install -g pnpm`
- **Docker Desktop** - [Descargar](https://www.docker.com/products/docker-desktop/)
- **Git** - [Descargar](https://git-scm.com/)

**Opcional:**
- **Xcode** (para iOS)
- **Android Studio** (para Android)
- **Expo Go** app en tu móvil

---

## 🎯 Paso 1: Clonar el Proyecto

```bash
cd ~/Desktop
# El proyecto ya está en /Users/sebi/Desktop/padel-tournament-platform
cd padel-tournament-platform
```

---

## 📦 Paso 2: Instalar Dependencias

```bash
# Instalar TODAS las dependencias del monorepo
pnpm install
```

Esto instalará las dependencias para:
- ✅ Backend API (NestJS)
- ✅ Frontend Web (Next.js)
- ✅ App Móvil (Expo)
- ✅ Paquetes compartidos (database, config, ui)

**Tiempo estimado:** 2-5 minutos

---

## 🗄️ Paso 3: Configurar Base de Datos

### 3.1 Iniciar PostgreSQL con Docker

```bash
# Iniciar PostgreSQL y Redis
pnpm docker:up
```

Esto levantará:
- 🐘 PostgreSQL en `localhost:5432`
- 🔴 Redis en `localhost:6379`
- 📧 MailDev en `localhost:1080` (para emails en desarrollo)

### 3.2 Generar Cliente de Prisma

```bash
cd packages/database
pnpm db:generate
cd ../..
```

### 3.3 Crear las Tablas

```bash
# Push del schema a la base de datos
pnpm db:push
```

Esto creará todas las tablas en PostgreSQL.

### 3.4 Poblar con Datos de Ejemplo

```bash
# Seed de datos
pnpm db:seed
```

Esto creará:
- ✅ 1 Admin, 1 Organizador, 16 Jugadores
- ✅ 1 Club con 4 canchas
- ✅ 2 Torneos con categorías
- ✅ 8 equipos inscritos
- ✅ Partidos de ejemplo

**Credenciales de prueba:**
- **Admin:** `admin@padel.com` / `password123`
- **Organizador:** `organizer@padel.com` / `password123`
- **Jugador:** `carlos@padel.com` / `password123`

---

## ⚙️ Paso 4: Configurar Variables de Entorno

### 4.1 Backend API

```bash
cd apps/api
cp .env.example .env
```

Edita `apps/api/.env` y asegúrate de tener:

```env
DATABASE_URL="postgresql://padel:padel123@localhost:5432/padel_tournament?schema=public"
PORT=3001
JWT_SECRET=tu-secreto-super-seguro-aqui
```

### 4.2 Frontend Web

```bash
cd ../web
cp .env.example .env.local
```

Edita `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4.3 App Móvil

```bash
cd ../mobile
cp .env.example .env
```

Edita `apps/mobile/.env`:

```env
# ⚠️ IMPORTANTE: No uses 'localhost' en móvil, usa tu IP local
API_URL=http://192.168.1.X:3001/api
```

**Para encontrar tu IP:**
- **Mac/Linux:** `ifconfig | grep inet`
- **Windows:** `ipconfig`

Busca tu IP local (ej: `192.168.1.10`)

---

## 🚀 Paso 5: Levantar las Aplicaciones

### Opción A: Levantar TODO a la vez

```bash
# Desde la raíz del proyecto
pnpm dev
```

Esto levantará simultáneamente:
- 🎯 Backend API (puerto 3001)
- 🌐 Frontend Web (puerto 3000)
- 📱 App Móvil (Expo)

### Opción B: Levantar cada app por separado

**Terminal 1 - Backend API:**
```bash
pnpm --filter @padel/api dev
```

**Terminal 2 - Frontend Web:**
```bash
pnpm --filter @padel/web dev
```

**Terminal 3 - App Móvil:**
```bash
pnpm --filter @padel/mobile dev
```

---

## ✅ Paso 6: Verificar que Todo Funciona

### Backend API

Abre tu navegador en:
- **Swagger Docs:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/api/health

Deberías ver la documentación Swagger de la API.

### Frontend Web

Abre tu navegador en:
- **Home:** http://localhost:3000
- **Torneos:** http://localhost:3000/tournaments
- **Login:** http://localhost:3000/auth/login

Deberías ver la página principal con el diseño de la plataforma.

### Base de Datos

```bash
pnpm db:studio
```

Abre http://localhost:5555 y verás Prisma Studio con todos los datos.

### App Móvil

Si ejecutaste `pnpm --filter @padel/mobile dev`, verás un QR code.

**En iOS:**
1. Abre la app **Expo Go**
2. Escanea el QR code

**En Android:**
1. Abre la app **Expo Go**
2. Escanea el QR code

---

## 🧪 Paso 7: Probar la Aplicación

### Test 1: Login en Web

1. Ve a http://localhost:3000/auth/login
2. Usuario: `carlos@padel.com`
3. Password: `password123`
4. Deberías ver el dashboard

### Test 2: Ver Torneos

1. Ve a http://localhost:3000/tournaments
2. Deberías ver 2 torneos de ejemplo
3. Click en uno para ver los detalles

### Test 3: API Endpoint

```bash
curl http://localhost:3001/api/tournaments
```

Deberías recibir JSON con los torneos.

### Test 4: App Móvil

1. Abre Expo Go en tu celular
2. Escanea el QR code
3. Deberías ver la pantalla de login
4. Login con `carlos@padel.com` / `password123`

---

## 🛠️ Comandos Útiles

### Base de Datos

```bash
# Ver la base de datos visualmente
pnpm db:studio

# Reset completo (⚠️ borra todos los datos)
pnpm db:reset

# Crear nueva migración
pnpm db:migrate

# Re-seed
pnpm db:seed
```

### Docker

```bash
# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Parar servicios
pnpm docker:down

# Reiniciar servicios
pnpm docker:down && pnpm docker:up
```

### Desarrollo

```bash
# Limpiar todo
pnpm clean

# Rebuild
pnpm build

# Lint
pnpm lint

# Tests
pnpm test
```

---

## 🐛 Solución de Problemas

### Error: "Can't connect to database"

**Solución:**
```bash
# Verifica que Docker esté corriendo
docker ps

# Si no está, levántalo
pnpm docker:up

# Espera 10 segundos y prueba nuevamente
```

### Error: "Port 3000 already in use"

**Solución:**
```bash
# Encuentra el proceso usando el puerto
lsof -i :3000

# Mata el proceso
kill -9 <PID>
```

### Error: "pnpm: command not found"

**Solución:**
```bash
npm install -g pnpm
```

### Error en Móvil: "Network request failed"

**Solución:**
- Asegúrate de usar tu IP local, NO `localhost`
- Verifica que tu celular esté en la misma red WiFi
- Verifica que el backend esté corriendo

### Prisma Error: "Schema not found"

**Solución:**
```bash
cd packages/database
pnpm db:generate
pnpm db:push
cd ../..
```

---

## 📱 Setup de Notificaciones Push (Opcional)

Para habilitar notificaciones push en móvil:

1. Crea cuenta en [Firebase](https://firebase.google.com/)
2. Crea un proyecto
3. Descarga `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)
4. Agrega a `apps/mobile/`
5. Configura las variables en `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
```

---

## 🎨 Personalización

### Cambiar Colores

Edita `packages/config/tailwind.js`:

```javascript
colors: {
  primary: '#3b82f6', // Azul por defecto
  // Cambia a tu color
}
```

### Cambiar Nombre de la App

Edita `apps/mobile/app.json`:

```json
{
  "name": "Tu Nombre Aquí",
  "displayName": "Tu Nombre Aquí"
}
```

---

## 📚 Próximos Pasos

Ahora que todo está funcionando, puedes:

1. **Explorar la API** - http://localhost:3001/api
2. **Crear tu primer torneo** - Login como organizador
3. **Registrar equipos** - Login como jugador
4. **Ver el bracket** - Genera un bracket desde el panel de organizador
5. **Reportar resultados** - Usa la app móvil para reportar scores

---

## 🆘 ¿Necesitas Ayuda?

- 📖 Lee la [Documentación](./docs/)
- 🐛 Reporta bugs en GitHub Issues
- 💬 Únete a nuestra comunidad

---

## ✨ ¡Listo!

Tu plataforma de torneos de pádel está completamente configurada y lista para usar.

**Disfruta desarrollando! 🎾**
