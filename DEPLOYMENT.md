# 🚀 Guía de Deployment - Plataforma de Torneos de Pádel

Esta guía te ayudará a publicar tu plataforma en la web de forma gratuita.

## 📋 Resumen de la Arquitectura

- **Frontend (Web)**: Vercel (gratis)
- **Backend (API)**: Railway (gratis hasta $5/mes de uso)
- **Base de Datos**: Neon PostgreSQL (gratis, 10GB)
- **Tiempo estimado**: 20-30 minutos

---

## 🗄️ Paso 1: Crear Base de Datos en Neon

### 1.1 Crear cuenta en Neon
1. Ve a [https://neon.tech](https://neon.tech)
2. Haz clic en "Sign Up" y registrate con GitHub
3. Confirma tu email

### 1.2 Crear proyecto y database
1. Una vez dentro, haz clic en "Create Project"
2. Nombre del proyecto: `padel-tournament-platform`
3. Region: Elige la más cercana a tus usuarios (ej: Frankfurt para España)
4. PostgreSQL version: Deja la predeterminada (16)
5. Haz clic en "Create Project"

### 1.3 Obtener connection string
1. En el dashboard del proyecto, ve a "Connection Details"
2. Copia el **Connection String** (postgresql://...)
3. Guárdalo temporalmente, lo necesitaremos pronto
4. El formato será algo como:
   ```
   postgresql://username:password@host.neon.tech/database?sslmode=require
   ```

---

## 🚂 Paso 2: Deploy del API en Railway

### 2.1 Crear cuenta en Railway
1. Ve a [https://railway.app](https://railway.app)
2. Haz clic en "Login" y conecta con GitHub
3. Autoriza la aplicación

### 2.2 Preparar el proyecto (YA ESTÁ HECHO)
✅ El proyecto ya está configurado para Railway con el archivo `railway.toml`

### 2.3 Deploy desde GitHub
1. En Railway, haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Busca y selecciona `padel-tournament-platform`
4. Railway detectará automáticamente la configuración

### 2.4 Configurar variables de entorno
1. En el dashboard del proyecto Railway, haz clic en tu servicio "api"
2. Ve a la pestaña "Variables"
3. Agrega las siguientes variables:

```env
# Database (usar el connection string de Neon)
DATABASE_URL=postgresql://username:password@host.neon.tech/database?sslmode=require

# JWT Secret (genera uno aleatorio en https://randomkeygen.com/)
JWT_SECRET=tu-secreto-super-seguro-cambialo-por-favor

# CORS (lo configuraremos después con la URL de Vercel)
CORS_ORIGIN=https://tu-app.vercel.app

# Node Environment
NODE_ENV=production

# Payment Providers (por ahora usa placeholders, después los reemplazas)
STRIPE_SECRET_KEY=sk_test_placeholder
MERCADOPAGO_ACCESS_TOKEN=TEST_placeholder
```

### 2.5 Deploy y obtener URL
1. Haz clic en "Deploy"
2. Railway iniciará el build automáticamente
3. Una vez finalizado, ve a "Settings" → "Generate Domain"
4. Guarda la URL generada (ej: `https://padel-api.up.railway.app`)

---

## ⚡ Paso 3: Deploy del Web App en Vercel

### 3.1 Crear cuenta en Vercel
1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en "Sign Up" y conecta con GitHub
3. Autoriza la aplicación

### 3.2 Import proyecto
1. En Vercel dashboard, haz clic en "Add New..." → "Project"
2. Busca el repositorio `padel-tournament-platform`
3. Haz clic en "Import"

### 3.3 Configurar el proyecto
1. **Framework Preset**: Selecciona "Next.js"
2. **Root Directory**: Haz clic en "Edit" y selecciona `apps/web`
3. **Build Command**:
   ```bash
   cd ../.. && pnpm build --filter=web
   ```
4. **Install Command**:
   ```bash
   pnpm install --frozen-lockfile
   ```
5. **Output Directory**: Dejar por defecto (`.next`)

### 3.4 Configurar variables de entorno
En la sección "Environment Variables", agrega:

```env
NEXT_PUBLIC_API_URL=https://padel-api.up.railway.app/api
```
(Usa la URL de Railway del paso 2.5)

### 3.5 Deploy
1. Haz clic en "Deploy"
2. Vercel construirá y desplegará tu aplicación
3. Una vez finalizado, obtendrás una URL (ej: `https://padel-tournament.vercel.app`)

### 3.6 Actualizar CORS en Railway
1. Vuelve a Railway
2. Actualiza la variable `CORS_ORIGIN` con la URL de Vercel
3. Railway redesplegará automáticamente

---

## 🗃️ Paso 4: Configurar la Base de Datos

### 4.1 Ejecutar migraciones
Desde tu terminal local:

```bash
# 1. Configurar la DATABASE_URL localmente
export DATABASE_URL="postgresql://username:password@host.neon.tech/database?sslmode=require"

# 2. Generar el cliente Prisma
cd packages/database
pnpm db:generate

# 3. Ejecutar las migraciones
pnpm db:push

# 4. Poblar con datos de ejemplo
pnpm db:seed
```

### 4.2 Verificar en Neon
1. Ve a tu proyecto en Neon
2. Abre la pestaña "SQL Editor"
3. Ejecuta: `SELECT count(*) FROM "Tournament";`
4. Deberías ver 2 torneos

---

## ✅ Paso 5: Verificar el Deployment

### 5.1 Probar el API
```bash
curl https://padel-api.up.railway.app/api/health
```
Deberías recibir: `{"status":"ok"}`

### 5.2 Probar el Web App
1. Abre tu URL de Vercel en el navegador
2. Deberías ver la página de inicio
3. Prueba el login con las credenciales de ejemplo:
   - **Organizador**: `organizer@test.com` / `password123`
   - **Jugador**: `player@test.com` / `password123`
   - **Admin**: `admin@test.com` / `password123`

### 5.3 Verificar logs
- **Railway**: Dashboard → Logs
- **Vercel**: Dashboard → Deployments → View Function Logs

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

1. **Commit y push a GitHub**:
   ```bash
   git add .
   git commit -m "feat: nueva funcionalidad"
   git push
   ```

2. **Railway y Vercel** redespliegan automáticamente

---

## 🛠️ Troubleshooting

### Error: "Cannot connect to database"
- Verifica que el `DATABASE_URL` en Railway sea correcto
- Asegúrate de incluir `?sslmode=require` al final

### Error: "CORS blocked"
- Verifica que `CORS_ORIGIN` en Railway coincida con tu URL de Vercel
- Debe incluir `https://` y NO terminar en `/`

### Error: "Build failed" en Vercel
- Verifica que el "Root Directory" sea `apps/web`
- Verifica que los comandos de build usen `pnpm` correctamente

### Web app carga pero muestra errores de API
- Verifica que `NEXT_PUBLIC_API_URL` en Vercel sea correcta
- Debe terminar en `/api`

---

## 📊 Monitoreo y Métricas

### Railway
- **Logs en tiempo real**: Dashboard → Logs
- **Métricas**: Dashboard → Metrics (CPU, Memory, Network)
- **Límites gratuitos**: $5/mes de uso, ~500 horas/mes

### Vercel
- **Analytics**: Dashboard → Analytics
- **Logs**: Dashboard → Deployments → Logs
- **Límites gratuitos**: 100GB bandwidth, builds ilimitados

### Neon
- **Usage**: Dashboard → Usage
- **Logs**: Dashboard → Operations
- **Límites gratuitos**: 10GB storage, 1 proyecto

---

## 🔐 Configuración de Pagos (Opcional)

### Stripe
1. Crea cuenta en [https://stripe.com](https://stripe.com)
2. Ve a Developers → API Keys
3. Copia el "Secret key"
4. Actualiza `STRIPE_SECRET_KEY` en Railway

### Mercado Pago
1. Crea cuenta en [https://mercadopago.com](https://mercadopago.com)
2. Ve a Tu negocio → Configuración → Credenciales
3. Copia el "Access Token"
4. Actualiza `MERCADOPAGO_ACCESS_TOKEN` en Railway

---

## 🎉 ¡Listo!

Tu plataforma de torneos de pádel ya está en la web y lista para compartir.

**URLs importantes**:
- 🌐 **Web App**: https://tu-app.vercel.app
- 🔌 **API**: https://padel-api.up.railway.app
- 📚 **Swagger Docs**: https://padel-api.up.railway.app/api

**Próximos pasos sugeridos**:
1. Configurar un dominio personalizado en Vercel
2. Configurar las claves de pago reales
3. Configurar emails transaccionales (SendGrid, Resend)
4. Configurar analytics (Google Analytics, Posthog)
5. Configurar error tracking (Sentry)

¡Disfruta tu plataforma! 🎾
