# Padel Tournament Platform - Frontend Implementation Guide

## What Has Been Created

### 1. Configuration Files (Complete)
- ✅ `package.json` - All dependencies configured
- ✅ `next.config.js` - Next.js 15 configuration
- ✅ `tailwind.config.ts` - Custom design system
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `postcss.config.js` - PostCSS with Tailwind
- ✅ `.env.example` - Environment variables template

### 2. Core Library Files (Complete)
- ✅ `lib/utils.ts` - Utility functions (cn, formatDate, formatCurrency, etc.)
- ✅ `lib/constants.ts` - App constants, routes, translations
- ✅ `lib/validations.ts` - Zod schemas for forms

### 3. API Integration Layer (Complete)
- ✅ `lib/api/client.ts` - Axios client with auth interceptor
- ✅ `lib/api/auth.ts` - Authentication API
- ✅ `lib/api/tournaments.ts` - Tournament API
- ✅ `lib/api/teams.ts` - Team/Registration API
- ✅ `lib/api/matches.ts` - Match/Bracket/Standings API
- ✅ `lib/api/clubs.ts` - Club API
- ✅ `lib/api/users.ts` - User API

### 4. React Query Hooks (Complete)
- ✅ `lib/queries/auth.ts` - Login, register, logout hooks
- ✅ `lib/queries/tournaments.ts` - Tournament CRUD hooks
- ✅ `lib/queries/teams.ts` - Team registration hooks
- ✅ `lib/queries/matches.ts` - Match, bracket, standings hooks

### 5. State Management (Complete)
- ✅ `lib/store/auth-store.ts` - Zustand auth store with persistence
- ✅ `lib/store/ui-store.ts` - UI state (modals, theme, sidebar)

### 6. Custom Hooks (Partial)
- ✅ `lib/hooks/use-debounce.ts` - Debounce hook for search

### 7. Providers (Complete)
- ✅ `components/providers/query-provider.tsx` - React Query setup
- ✅ `components/providers/auth-provider.tsx` - Auth context

### 8. UI Components (Partial - Core Components Done)
- ✅ `components/ui/button.tsx` - Button with variants
- ✅ `components/ui/input.tsx` - Input field
- ✅ `components/ui/card.tsx` - Card components
- ✅ `components/ui/badge.tsx` - Badge with variants
- ✅ `components/ui/skeleton.tsx` - Loading skeleton
- ✅ `components/ui/label.tsx` - Form label

### 9. Layout Components (Complete)
- ✅ `components/layout/header.tsx` - Site header with navigation
- ✅ `components/layout/footer.tsx` - Site footer

### 10. Feature Components (Partial)
- ✅ `components/tournaments/tournament-card.tsx` - Tournament preview card

### 11. Pages (Partial - Essential Pages Done)
- ✅ `app/layout.tsx` - Root layout with providers
- ✅ `app/page.tsx` - Home page with hero and features
- ✅ `app/globals.css` - Global styles
- ✅ `app/tournaments/page.tsx` - Tournament listing with search
- ✅ `app/tournaments/[id]/page.tsx` - Tournament detail
- ✅ `app/auth/login/page.tsx` - Login page
- ✅ `app/auth/register/page.tsx` - Registration page

## What Needs to Be Implemented

### Priority 1: Essential UI Components
These components are referenced but not yet created:

```typescript
// components/ui/dialog.tsx - Modal dialog
// components/ui/tabs.tsx - Tab component
// components/ui/select.tsx - Dropdown select
// components/ui/table.tsx - Table component
// components/ui/textarea.tsx - Textarea input
// components/ui/checkbox.tsx - Checkbox
// components/ui/radio-group.tsx - Radio buttons
```

### Priority 2: Tournament Components

```typescript
// components/tournaments/tournament-filters.tsx
// - Status filter dropdown
// - Format filter dropdown
// - Date range picker
// - Clear filters button

// components/tournaments/tournament-search.tsx
// - Search bar with debounce
// - Search suggestions

// components/tournaments/registration-form.tsx
// - Team registration form
// - Player selection
// - Payment integration

// components/tournaments/bracket-viewer.tsx
// - Interactive bracket display
// - Match navigation
// - Responsive bracket layout

// components/tournaments/standings-table.tsx
// - Sortable standings
// - Team stats
// - Position indicators
```

### Priority 3: Match Components

```typescript
// components/matches/result-form.tsx
// - Set score inputs
// - Validation
// - Photo upload
// - Submit/cancel actions

// components/matches/match-list.tsx
// - Filterable match list
// - Status indicators
// - Quick actions

// components/matches/score-display.tsx
// - Formatted score display
// - Set-by-set breakdown
```

### Priority 4: Dashboard Pages

```typescript
// app/dashboard/layout.tsx - Dashboard shell with sidebar
// app/dashboard/page.tsx - Dashboard home
// app/dashboard/tournaments/page.tsx - My tournaments
// app/dashboard/teams/page.tsx - My teams
// app/dashboard/matches/page.tsx - My matches
// app/dashboard/profile/page.tsx - Profile settings
```

### Priority 5: Organizer Pages

```typescript
// app/organizer/layout.tsx - Organizer shell
// app/organizer/page.tsx - Organizer dashboard
// app/organizer/tournaments/page.tsx - Manage tournaments
// app/organizer/tournaments/create/page.tsx - Create wizard
// app/organizer/tournaments/[id]/page.tsx - Edit tournament
// app/organizer/tournaments/[id]/bracket/page.tsx - Bracket editor
// app/organizer/tournaments/[id]/schedule/page.tsx - Schedule matches
```

### Priority 6: Additional Pages

```typescript
// app/clubs/page.tsx - Club listing
// app/clubs/[id]/page.tsx - Club detail
// app/share/[shareSlug]/page.tsx - Public share page
// app/tournaments/[id]/bracket/page.tsx - Bracket view
// app/tournaments/[id]/standings/page.tsx - Standings view
```

## Implementation Steps

### Step 1: Install Dependencies

```bash
cd apps/web
pnpm install
```

### Step 2: Set Up Environment

```bash
cp .env.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Step 3: Start Development Server

```bash
pnpm dev
```

### Step 4: Implement Missing UI Components

Start with the most commonly used components:

1. **Dialog** - For modals (registration, confirmations)
2. **Tabs** - For tournament detail tabs
3. **Select** - For filters and forms
4. **Table** - For standings and match lists

Example implementation pattern (Dialog):

```typescript
// components/ui/dialog.tsx
'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export { Dialog, DialogTrigger, DialogContent };
```

### Step 5: Implement Tournament Registration Flow

Create the registration form component:

```typescript
// components/tournaments/registration-form.tsx
'use client';

import { useState } from 'react';
import { useRegisterTeam } from '@/lib/queries/teams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface RegistrationFormProps {
  tournamentId: string;
  categories: Category[];
  onSuccess?: () => void;
}

export function RegistrationForm({
  tournamentId,
  categories,
  onSuccess,
}: RegistrationFormProps) {
  const register = useRegisterTeam();
  const [formData, setFormData] = useState({
    categoryId: '',
    player1Id: '',
    player2Id: '',
    teamName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({
      tournamentId,
      ...formData,
    }, {
      onSuccess,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Categoría</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) =>
            setFormData({ ...formData, categoryId: value })
          }
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Nombre del equipo (opcional)</Label>
        <Input
          value={formData.teamName}
          onChange={(e) =>
            setFormData({ ...formData, teamName: e.target.value })
          }
        />
      </div>

      {/* Player selection inputs */}

      <Button type="submit" disabled={register.isPending}>
        {register.isPending ? 'Registrando...' : 'Inscribir Equipo'}
      </Button>
    </form>
  );
}
```

### Step 6: Implement Bracket Viewer

The bracket viewer is a complex component. Here's a simplified approach:

```typescript
// components/tournaments/bracket-viewer.tsx
'use client';

import { useBracket } from '@/lib/queries/matches';
import type { Match } from '@/lib/api/matches';

interface BracketViewerProps {
  tournamentId: string;
  categoryId: string;
}

export function BracketViewer({
  tournamentId,
  categoryId,
}: BracketViewerProps) {
  const { data: matches, isLoading } = useBracket(tournamentId, categoryId);

  if (isLoading) return <div>Cargando bracket...</div>;

  // Group matches by round
  const rounds = groupByRound(matches || []);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 p-4">
        {Object.entries(rounds).map(([round, matches]) => (
          <div key={round} className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">
              {getRoundName(parseInt(round))}
            </h3>
            {matches.map((match) => (
              <MatchBracketCard key={match.id} match={match} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function groupByRound(matches: Match[]) {
  return matches.reduce((acc, match) => {
    const round = match.round;
    if (!acc[round]) acc[round] = [];
    acc[round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);
}

function getRoundName(round: number) {
  const names: Record<number, string> = {
    1: 'Final',
    2: 'Semifinal',
    4: 'Cuartos',
    8: 'Octavos',
  };
  return names[round] || `Ronda ${round}`;
}
```

### Step 7: Dashboard Implementation

Create the dashboard layout:

```typescript
// app/dashboard/layout.tsx
'use client';

import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuthStore } from '@/lib/store/auth-store';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    redirect(ROUTES.AUTH_LOGIN);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-50 p-8">{children}</main>
      </div>
    </div>
  );
}
```

### Step 8: Testing Checklist

- [ ] Login/Register flow works
- [ ] Tournament listing loads
- [ ] Tournament detail shows correct data
- [ ] Search and filters work
- [ ] Registration form submits
- [ ] Protected routes redirect correctly
- [ ] Auth token persists across refreshes
- [ ] API errors show toast notifications
- [ ] Mobile responsive on all pages
- [ ] Dark mode toggle works

## API Contract

The frontend expects these API endpoints:

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Tournaments
- `GET /api/tournaments` - List tournaments (with filters)
- `GET /api/tournaments/:id` - Get tournament details
- `GET /api/tournaments/share/:slug` - Get by share slug
- `POST /api/tournaments` - Create tournament
- `PATCH /api/tournaments/:id` - Update tournament
- `DELETE /api/tournaments/:id` - Delete tournament
- `POST /api/tournaments/:id/publish` - Publish tournament
- `GET /api/tournaments/:id/categories` - Get categories

### Teams
- `POST /api/teams/register` - Register team
- `GET /api/teams/my-teams` - Get my teams
- `GET /api/tournaments/:id/teams` - Get tournament teams

### Matches
- `GET /api/tournaments/:id/matches` - Get tournament matches
- `GET /api/matches/my-matches` - Get my matches
- `POST /api/matches/report-result` - Report match result
- `GET /api/tournaments/:id/bracket` - Get bracket
- `GET /api/tournaments/:id/standings` - Get standings

### Clubs
- `GET /api/clubs` - List clubs
- `GET /api/clubs/:id` - Get club details

## Performance Optimization Tips

1. **Use Server Components**: Keep as many components as server components
2. **Lazy Load Heavy Components**: Use `next/dynamic` for bracket viewer
3. **Optimize Images**: Use `next/image` for all images
4. **Debounce Search**: Already implemented in search
5. **Pagination**: Use virtual scrolling for large lists
6. **Cache Strategy**: React Query handles this well

## Next Steps

1. Implement missing UI components (Dialog, Tabs, Select, Table)
2. Create dashboard layout and sidebar
3. Implement bracket viewer
4. Add tournament creation wizard
5. Implement match result reporting
6. Add payment integration
7. Implement real-time updates (WebSockets)
8. Add analytics tracking
9. Performance monitoring
10. E2E testing with Playwright

## Common Issues & Solutions

### Issue: Auth token not persisting
**Solution**: Check that Zustand persist middleware is configured correctly

### Issue: API calls failing with CORS
**Solution**: Ensure backend has CORS configured for frontend URL

### Issue: Hydration errors
**Solution**: Use `suppressHydrationWarning` on html tag, check for client-only code

### Issue: Build errors with Radix UI
**Solution**: Ensure all Radix packages are installed with correct versions

## Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://radix-ui.com)
- [Zustand](https://zustand-demo.pmnd.rs)
