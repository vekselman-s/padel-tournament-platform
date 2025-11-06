# Padel Tournament Platform - Backend API

Complete NestJS REST API for managing padel tournaments, teams, matches, and payments.

## Features

- **Authentication & Authorization** - JWT-based auth with role-based access control (PLAYER, ORGANIZER, ADMIN)
- **Tournament Management** - Full CRUD operations with bracket generation and public sharing
- **Team Management** - Player pairing and team registration
- **Match Management** - Scheduling, result reporting, and confirmation system
- **Payment Integration** - Stripe and MercadoPago support with webhooks
- **Club & Court Management** - Venue and facility management
- **User Management** - Profile management and role assignment
- **Notifications** - Push notification system with multiple types
- **OpenAPI Documentation** - Full Swagger/OpenAPI spec at `/api/docs`

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: class-validator & class-transformer
- **Documentation**: @nestjs/swagger
- **Payments**: Stripe & MercadoPago
- **Rate Limiting**: @nestjs/throttler

## Project Structure

```
apps/api/
├── src/
│   ├── modules/
│   │   ├── auth/              # Authentication & authorization
│   │   │   ├── dto/           # Login, register DTOs
│   │   │   ├── guards/        # JWT & roles guards
│   │   │   └── decorators/    # CurrentUser, Roles, Public
│   │   ├── tournaments/       # Tournament management
│   │   │   ├── dto/           # Create, update, query DTOs
│   │   │   └── tournaments.*  # Controller, service, module
│   │   ├── teams/             # Team management
│   │   ├── matches/           # Match & result management
│   │   │   └── dto/           # Report result, confirm result
│   │   ├── payments/          # Payment processing
│   │   │   ├── providers/     # Stripe, MercadoPago providers
│   │   │   └── dto/           # Payment intent DTOs
│   │   ├── users/             # User management
│   │   ├── clubs/             # Club & court management
│   │   └── notifications/     # Notification system
│   ├── common/                # Shared utilities
│   ├── config/                # Configuration
│   ├── main.ts               # Application entry point
│   └── app.module.ts         # Root module
├── nest-cli.json             # NestJS CLI config
├── tsconfig.json             # TypeScript config
├── tsconfig.build.json       # Build config
├── package.json              # Dependencies
└── .env.example              # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Generate Prisma client:
   ```bash
   cd ../../packages/database
   npx prisma generate
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Documentation

Once the server is running, access the interactive API documentation at:

```
http://localhost:3000/api/docs
```

## Environment Variables

See `.env.example` for all required environment variables:

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### Authentication (choose one)
- Clerk: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`
- Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- JWT: `JWT_SECRET`, `JWT_EXPIRES_IN`

### Payment Providers
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- MercadoPago: `MERCADOPAGO_ACCESS_TOKEN`

### Optional
- File upload (AWS S3 or Cloudinary)
- Email service (SendGrid)
- Push notifications (Firebase)
- Redis for caching
- Sentry for error tracking

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile

### Tournaments
- `GET /tournaments` - List tournaments (with filters)
- `POST /tournaments` - Create tournament (ORGANIZER/ADMIN)
- `GET /tournaments/:id` - Get tournament details
- `GET /tournaments/:shareSlug/public` - Public tournament view
- `PATCH /tournaments/:id` - Update tournament
- `DELETE /tournaments/:id` - Delete tournament
- `POST /tournaments/:id/generate-bracket` - Generate tournament bracket

### Teams
- `GET /teams` - List teams
- `POST /teams` - Create team
- `GET /teams/:id` - Get team details
- `PATCH /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team

### Matches
- `GET /matches` - List matches
- `POST /matches` - Create match (ORGANIZER)
- `GET /matches/:id` - Get match details
- `POST /matches/report-result` - Report match result
- `POST /matches/confirm-result/:resultReportId` - Confirm/reject result
- `DELETE /matches/:id` - Delete match

### Payments
- `POST /payments/create-intent` - Create payment intent
- `POST /payments/webhook/stripe` - Stripe webhook
- `POST /payments/webhook/mercadopago` - MercadoPago webhook
- `POST /payments/refund/:registrationId` - Refund payment

### Users
- `GET /users` - List users
- `POST /users` - Create user (ADMIN)
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Clubs
- `GET /clubs` - List clubs
- `POST /clubs` - Create club (ORGANIZER/ADMIN)
- `GET /clubs/:id` - Get club details
- `PATCH /clubs/:id` - Update club
- `DELETE /clubs/:id` - Delete club
- `POST /clubs/:id/courts` - Create court
- `GET /clubs/:id/courts` - List courts
- `DELETE /clubs/courts/:courtId` - Delete court

### Notifications
- `GET /notifications` - List user notifications
- `GET /notifications/unread` - Get unread notifications
- `POST /notifications/send` - Send notification
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `DELETE /notifications` - Delete all notifications

## Authentication & Authorization

The API uses JWT-based authentication with role-based access control:

### Roles
- `PLAYER` - Regular users (default)
- `ORGANIZER` - Tournament organizers
- `ADMIN` - System administrators

### Guards
- `JwtAuthGuard` - Validates JWT token
- `RolesGuard` - Checks user roles

### Decorators
- `@Public()` - Marks endpoint as public (no auth required)
- `@Roles(UserRole.ORGANIZER, UserRole.ADMIN)` - Requires specific roles
- `@CurrentUser()` - Injects current user into route handler

## Payment Processing

The API supports both Stripe and MercadoPago:

### Stripe Flow
1. Client calls `POST /payments/create-intent` with Stripe provider
2. Server creates payment intent and returns client secret
3. Client confirms payment using Stripe SDK
4. Stripe sends webhook to `POST /payments/webhook/stripe`
5. Server updates registration status

### MercadoPago Flow
1. Client calls `POST /payments/create-intent` with MercadoPago provider
2. Server creates preference and returns init_point URL
3. Client redirects to MercadoPago checkout
4. MercadoPago sends webhook to `POST /payments/webhook/mercadopago`
5. Server updates registration status

## Match Result System

The match result reporting system uses a two-step confirmation process:

1. **Report Result**: One team reports the match result with set scores
2. **Confirm Result**: Opposing team confirms or rejects the result
3. **Finalize**: If confirmed, match is marked as DONE; if rejected, result is cleared

This ensures accuracy and prevents disputes.

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Building for Production

```bash
# Build
npm run build

# Start production server
npm run start
```

## Docker Support

```bash
# Build image
docker build -t padel-api .

# Run container
docker run -p 3000:3000 --env-file .env padel-api
```

## Database Schema

The API uses Prisma ORM with the following main models:

- **User** - Platform users with roles
- **Club** - Padel clubs/venues
- **Court** - Individual courts within clubs
- **Tournament** - Tournament events
- **Category** - Tournament categories (by gender/level)
- **Team** - Player pairs
- **Registration** - Tournament registrations
- **Match** - Individual matches
- **SetScore** - Match set scores
- **ResultReport** - Match result submissions
- **Notification** - User notifications
- **Ranking** - Player rankings
- **Group** - Round-robin groups
- **Standing** - Group standings

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
