# Quick Start Guide - Padel Tournament Platform Frontend

## Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm
- Backend API running on `http://localhost:3001`

## 1. Install Dependencies

```bash
cd /Users/sebi/Desktop/padel-tournament-platform/apps/web
pnpm install
```

## 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your settings
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Padel Tournament Platform
NEXT_PUBLIC_ENABLE_REGISTRATION=true
NEXT_PUBLIC_ENABLE_PAYMENTS=false
EOF
```

## 3. Start Development Server

```bash
pnpm dev
```

The application will be available at: **http://localhost:3000**

## 4. Test the Application

### Available Pages (Implemented)

1. **Home Page**: http://localhost:3000
   - Marketing hero
   - Features section
   - Call to action

2. **Tournaments**: http://localhost:3000/tournaments
   - Tournament listing
   - Search functionality
   - Pagination

3. **Tournament Detail**: http://localhost:3000/tournaments/[id]
   - Replace [id] with actual tournament ID
   - Shows tournament info, categories
   - Registration button

4. **Login**: http://localhost:3000/auth/login
   - Email/password form
   - Redirects to dashboard on success

5. **Register**: http://localhost:3000/auth/register
   - User registration form
   - Creates account and logs in

### Test User Flow

```bash
# 1. Open home page
open http://localhost:3000

# 2. Navigate to tournaments
# Click "Explorar Torneos" button

# 3. Use search
# Type in search box (debounced)

# 4. View tournament detail
# Click on any tournament card

# 5. Register account
# Click "Registrarse" in header
# Fill form and submit

# 6. Login
# Use credentials to login
# Should redirect to dashboard
```

## 5. Development Commands

```bash
# Start dev server
pnpm dev

# Type checking
pnpm type-check

# Build for production
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint
```

## 6. File Structure Quick Reference

```
apps/web/
├── app/                    # Pages
│   ├── page.tsx           # Home
│   ├── tournaments/       # Tournaments
│   └── auth/              # Auth
├── components/            # Components
│   ├── ui/               # UI primitives
│   └── layout/           # Layout
└── lib/                  # Logic
    ├── api/              # API calls
    ├── queries/          # React Query
    └── store/            # State
```

## 7. Common Tasks

### Add a New Page

```typescript
// 1. Create file: app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page</div>;
}

// 2. Add route to constants
// lib/constants.ts
export const ROUTES = {
  // ...
  NEW_PAGE: '/new-page',
};
```

### Add a New Component

```typescript
// 1. Create file: components/feature/component.tsx
interface ComponentProps {
  // Props
}

export function Component({ }: ComponentProps) {
  return <div>Component</div>;
}

// 2. Import and use
import { Component } from '@/components/feature/component';
```

### Add API Endpoint

```typescript
// 1. Add to API module: lib/api/resource.ts
export const resourceApi = {
  getAll: async () => {
    const response = await apiClient.get('/resource');
    return response.data;
  },
};

// 2. Create React Query hook: lib/queries/resource.ts
export function useResources() {
  return useQuery({
    queryKey: ['resources'],
    queryFn: () => resourceApi.getAll(),
  });
}

// 3. Use in component
const { data, isLoading } = useResources();
```

## 8. Troubleshooting

### Issue: "Cannot find module '@/...'"

**Solution**: TypeScript paths not configured
```bash
# Restart your IDE/editor
# Or restart TS server in VSCode: Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

### Issue: API calls failing with 404

**Solution**: Backend not running or wrong URL
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check .env.local has correct API URL
cat .env.local | grep API_URL
```

### Issue: Tailwind classes not working

**Solution**: Ensure file is in content config
```javascript
// tailwind.config.ts
content: [
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
],
```

### Issue: "React Hook Form" errors

**Solution**: Install missing dependency
```bash
pnpm add react-hook-form @hookform/resolvers
```

### Issue: Build errors

**Solution**: Clear cache and rebuild
```bash
rm -rf .next
pnpm build
```

## 9. Next Steps

### Immediate (Priority 1)
- [ ] Implement missing UI components (Dialog, Tabs, Select, Table)
- [ ] Create dashboard layout
- [ ] Add tournament registration form

### Short-term (Priority 2)
- [ ] Implement bracket viewer
- [ ] Add match result reporting
- [ ] Create organizer panel

### Medium-term (Priority 3)
- [ ] Add real-time updates
- [ ] Implement payment flow
- [ ] Add notifications system

## 10. Useful Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Query**: https://tanstack.com/query/latest
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://radix-ui.com
- **Lucide Icons**: https://lucide.dev

## 11. Getting Help

### Documentation
- See `README.md` for project overview
- See `IMPLEMENTATION_GUIDE.md` for detailed implementation
- See `PROJECT_SUMMARY.md` for complete summary

### Code Structure
- All pages in `app/` directory
- All components in `components/` directory
- All logic in `lib/` directory

### Conventions
- Use TypeScript for all files
- Use 'use client' directive only when needed
- Follow existing patterns for consistency
- Add comments for complex logic

## 12. Development Workflow

```bash
# 1. Start backend API
cd ../api
pnpm dev

# 2. Start frontend (in new terminal)
cd ../web
pnpm dev

# 3. Open browser
open http://localhost:3000

# 4. Make changes
# Hot reload will update automatically

# 5. Test changes
# Navigate and test in browser

# 6. Commit when ready
git add .
git commit -m "feat: add new feature"
```

## 13. Production Build

```bash
# Build
pnpm build

# Test production build locally
pnpm start

# Deploy (example with Vercel)
vercel deploy
```

## Success Indicators

You'll know everything is working when:
- ✅ Home page loads at http://localhost:3000
- ✅ Tournament listing shows data
- ✅ Search works (with debounce)
- ✅ Login creates session
- ✅ Protected routes redirect to login
- ✅ Toast notifications appear
- ✅ No console errors

---

**Ready to start?** Run `pnpm dev` and open http://localhost:3000
