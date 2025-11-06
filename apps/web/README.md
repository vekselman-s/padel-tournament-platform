# Padel Tournament Platform - Web Frontend

Complete Next.js 15 frontend application for the Padel Tournament Platform.

## Project Structure

```
apps/web/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles with Tailwind
│   ├── tournaments/             # Tournament pages
│   │   ├── page.tsx            # Tournament listing
│   │   └── [id]/               # Tournament detail pages
│   │       ├── page.tsx        # Detail view
│   │       ├── bracket/        # Bracket viewer
│   │       └── standings/      # Standings table
│   ├── clubs/                   # Club pages
│   │   ├── page.tsx
│   │   └── [id]/
│   ├── auth/                    # Authentication
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/               # Player dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── tournaments/
│   │   ├── teams/
│   │   ├── matches/
│   │   └── profile/
│   ├── organizer/               # Organizer panel
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── tournaments/
│   │   │   ├── create/
│   │   │   └── [id]/
│   │   └── ...
│   └── share/                   # Public shareable pages
│       └── [shareSlug]/
├── components/                   # React components
│   ├── layout/                  # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   └── mobile-menu.tsx
│   ├── tournaments/             # Tournament components
│   │   ├── tournament-card.tsx
│   │   ├── tournament-filters.tsx
│   │   ├── tournament-search.tsx
│   │   ├── registration-form.tsx
│   │   ├── bracket-viewer.tsx
│   │   └── standings-table.tsx
│   ├── matches/                 # Match components
│   │   ├── result-form.tsx
│   │   ├── match-list.tsx
│   │   └── score-display.tsx
│   ├── ui/                      # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── skeleton.tsx
│   │   └── label.tsx
│   └── providers/               # Context providers
│       ├── query-provider.tsx
│       └── auth-provider.tsx
├── lib/                         # Utilities and logic
│   ├── api/                     # API client layer
│   │   ├── client.ts           # Axios instance with interceptors
│   │   ├── auth.ts             # Auth API calls
│   │   ├── tournaments.ts      # Tournament API calls
│   │   ├── teams.ts            # Team API calls
│   │   ├── matches.ts          # Match API calls
│   │   ├── clubs.ts            # Club API calls
│   │   └── users.ts            # User API calls
│   ├── queries/                 # React Query hooks
│   │   ├── auth.ts
│   │   ├── tournaments.ts
│   │   ├── teams.ts
│   │   └── matches.ts
│   ├── store/                   # Zustand stores
│   │   ├── auth-store.ts       # Authentication state
│   │   └── ui-store.ts         # UI state (modals, theme)
│   ├── hooks/                   # Custom hooks
│   │   └── use-debounce.ts
│   ├── utils.ts                 # Utility functions
│   ├── constants.ts             # App constants
│   └── validations.ts           # Zod schemas
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── .env.example
```

## Features Implemented

### Core Features
- ✅ Next.js 15 with App Router
- ✅ TypeScript for type safety
- ✅ Tailwind CSS with custom design system
- ✅ React Query for server state management
- ✅ Zustand for client state
- ✅ Responsive mobile-first design
- ✅ Dark mode support (via UI store)
- ✅ Spanish translations

### Authentication
- ✅ Login/Register pages
- ✅ JWT token management
- ✅ Protected routes
- ✅ Auth store with persistence
- ✅ Automatic token refresh

### Tournament Features
- ✅ Tournament listing with search/filters
- ✅ Tournament detail view
- ✅ Multiple format support (Single/Double Elimination, Round Robin, etc.)
- ✅ Category management
- ✅ Registration system
- ✅ Bracket viewer (to be implemented)
- ✅ Standings table (to be implemented)

### State Management
- ✅ React Query for API data
- ✅ Optimistic updates
- ✅ Automatic cache invalidation
- ✅ Loading and error states
- ✅ Zustand for auth and UI state

### UI Components
- ✅ Button, Input, Card, Badge
- ✅ Label, Skeleton
- ✅ Reusable components based on Radix UI
- ✅ Consistent design system
- ✅ Accessibility features

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended for monorepo)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
pnpm dev
```

The app will be available at http://localhost:3000

### Environment Variables

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Padel Tournament Platform
NEXT_PUBLIC_ENABLE_REGISTRATION=true
NEXT_PUBLIC_ENABLE_PAYMENTS=false
```

## API Integration

The app connects to the backend API at `NEXT_PUBLIC_API_URL`. All API calls are made through:

1. **API Client** (`lib/api/client.ts`) - Axios instance with:
   - Automatic auth token injection
   - Error handling and transformation
   - 401 redirect to login

2. **API Modules** (`lib/api/*.ts`) - Typed API functions for:
   - Authentication
   - Tournaments
   - Teams
   - Matches
   - Clubs
   - Users

3. **React Query Hooks** (`lib/queries/*.ts`) - Hooks for:
   - Data fetching
   - Mutations
   - Cache management
   - Optimistic updates

## Component Architecture

### Page Components
- Server components by default
- Use `'use client'` only when needed (hooks, events)
- Suspense boundaries for loading states
- Error boundaries for error handling

### Reusable Components
- Located in `components/` directory
- Organized by feature/domain
- UI primitives in `components/ui/`
- Composed using Radix UI primitives

### State Management
- **Server State**: React Query
- **Auth State**: Zustand with localStorage persistence
- **UI State**: Zustand (modals, theme, sidebar)
- **Form State**: React Hook Form (to be added)

## Styling

### Tailwind CSS
- Custom color palette (primary blue, success green, warning orange, danger red)
- Responsive utilities
- Dark mode support
- Custom animations

### Design Tokens
```css
--primary-500: #3b82f6
--success-500: #22c55e
--warning-500: #f97316
--danger-500: #ef4444
```

## Development Guidelines

### File Naming
- Pages: `page.tsx`, `layout.tsx`
- Components: `component-name.tsx` (kebab-case)
- Utils: `util-name.ts`

### Code Organization
- One component per file
- Export named exports for components
- Use TypeScript interfaces for props
- Add JSDoc comments for complex logic

### Best Practices
- Use server components when possible
- Implement proper loading states
- Add error boundaries
- Use semantic HTML
- Ensure accessibility (ARIA labels, keyboard navigation)
- Mobile-first responsive design

## Pages to Implement

The following pages are part of the complete structure but not yet implemented:

### Dashboard Pages
- `/dashboard/tournaments` - My tournaments
- `/dashboard/teams` - My teams
- `/dashboard/matches` - My matches
- `/dashboard/profile` - Profile settings

### Organizer Pages
- `/organizer/tournaments` - Manage tournaments
- `/organizer/tournaments/create` - Create tournament wizard
- `/organizer/tournaments/[id]` - Edit tournament
- `/organizer/tournaments/[id]/bracket` - Bracket editor
- `/organizer/tournaments/[id]/schedule` - Schedule matches
- `/organizer/tournaments/[id]/results` - Confirm results

### Tournament Pages
- `/tournaments/[id]/bracket` - Interactive bracket viewer
- `/tournaments/[id]/standings` - Standings table

### Other Pages
- `/clubs` - Club listing
- `/clubs/[id]` - Club detail
- `/share/[shareSlug]` - Public shareable tournament page

## Testing

```bash
# Run tests (to be configured)
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Build & Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Performance Optimizations

- ✅ Code splitting with Next.js automatic code splitting
- ✅ Image optimization with next/image
- ✅ React Query caching
- ✅ Debounced search inputs
- ✅ Skeleton loading states
- ⏳ Lazy loading components
- ⏳ Bundle analysis
- ⏳ Performance monitoring

## Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Color contrast compliance
- ⏳ Screen reader testing

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private project - Padel Tournament Platform
