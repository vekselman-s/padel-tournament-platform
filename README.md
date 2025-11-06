# 🎾 Padel Tournament Platform

Complete platform for managing padel tournaments with web, mobile, and admin applications.

## 🏗️ Architecture

This is a monorepo using **Turborepo** and **pnpm workspaces**.

### Apps

- **`apps/web`** - Next.js 15 web application (public-facing)
- **`apps/admin`** - Next.js admin dashboard for organizers
- **`apps/mobile`** - Expo React Native mobile app
- **`apps/api`** - NestJS backend API

### Packages

- **`packages/database`** - Prisma schema and database utilities
- **`packages/ui`** - Shared UI components (shadcn/ui)
- **`packages/config`** - Shared configurations (ESLint, TypeScript, Tailwind)
- **`packages/sdk`** - TypeScript SDK for API consumption

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd padel-tournament-platform

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Start PostgreSQL with Docker
pnpm docker:up

# Run database migrations
pnpm db:push

# Seed database with example data
pnpm db:seed

# Start all applications in development mode
pnpm dev
```

### Access Points

- **Web App**: http://localhost:3000
- **Admin Panel**: http://localhost:3002
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api
- **Database Studio**: `pnpm db:studio` → http://localhost:5555

## 📦 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **React Query** - Server state management
- **Zustand** - Client state management

### Mobile
- **Expo** - React Native framework
- **React Navigation** - Navigation
- **NativeWind** - Tailwind for React Native

### Backend
- **NestJS** - Node.js framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **WebSockets** - Real-time updates
- **Bull** - Job queue

### Infrastructure
- **Docker** - Containerization
- **Turbo** - Build system
- **pnpm** - Package manager
- **GitHub Actions** - CI/CD

### External Services
- **Clerk/Supabase** - Authentication
- **Stripe + Mercado Pago** - Payments
- **S3** - File storage
- **FCM/APNs** - Push notifications
- **Sentry** - Error tracking

## 🏃 Development

```bash
# Run all apps in dev mode
pnpm dev

# Run specific app
pnpm --filter @padel/web dev
pnpm --filter @padel/api dev

# Build all apps
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Format code
pnpm format
```

## 🗄️ Database

```bash
# Create a migration
pnpm db:migrate

# Push schema to database (dev only)
pnpm db:push

# Seed database
pnpm db:seed

# Open Prisma Studio
pnpm db:studio

# Reset database
pnpm db:reset
```

## 🐳 Docker

```bash
# Start services (PostgreSQL, Redis)
pnpm docker:up

# Stop services
pnpm docker:down

# View logs
docker-compose logs -f
```

## 📚 Documentation

- [Architecture](./docs/architecture.md)
- [Database Schema](./docs/database.md)
- [API Documentation](./docs/api.md)
- [Deployment](./docs/deployment.md)
- [Contributing](./docs/contributing.md)

## 🎯 Features

### Core Features
- ✅ User authentication (players, organizers, admins)
- ✅ Tournament creation and management
- ✅ Multiple tournament formats (Single/Double Elimination, Round Robin, Americano, Mexicano, Groups+Playoffs)
- ✅ Online registration with payments (Stripe + Mercado Pago)
- ✅ Automatic bracket generation with seeding
- ✅ Smart scheduling with court assignment
- ✅ Result reporting and validation
- ✅ Real-time bracket updates (WebSockets)
- ✅ Push notifications (web + mobile)
- ✅ Public tournament pages with shareable links
- ✅ Ranking system (ELO-based)
- ✅ Multi-language support (ES/EN)

### Advanced Features
- ✅ Court management
- ✅ Photo evidence for results
- ✅ Automatic standings calculation
- ✅ Conflict detection (scheduling)
- ✅ Refund management
- ✅ Export to PDF/CSV
- ✅ QR codes for tournaments
- ✅ Arena mode (TV display)
- ✅ Audit logging

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## 📝 License

MIT

## 👥 Team

Built with ❤️ for the padel community
