# NutriCare - Dietary Management Helper for Diabetes & Kidney Disease

## Overview

NutriCare (뉴트리케어) is a Korean-language dietary management application designed to help patients with diabetes and chronic kidney disease (CKD) analyze food safety based on their health profile. The application allows users to input their patient profile (including disease status, lab values, and physical characteristics) and search for foods to receive personalized safety assessments with recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Form Handling**: React Hook Form with Zod resolver for validation
- **Animations**: Framer Motion for UI transitions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in shared routes module
- **Validation**: Zod schemas shared between frontend and backend
- **Storage**: Memory-based storage (MemStorage class) with interface designed for easy database migration

### Data Layer
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Defined in `shared/schema.ts` with Zod validation via drizzle-zod
- **Current Storage**: In-memory Map-based storage with pre-seeded Korean food data
- **Database Ready**: PostgreSQL schema and Drizzle configuration prepared for future migration

### Shared Code Pattern
- `shared/schema.ts`: Database schemas, Zod validation schemas, and TypeScript types
- `shared/routes.ts`: API route definitions with input/output schemas for type-safe API calls
- Path aliases: `@/*` for client code, `@shared/*` for shared modules

### Key Design Decisions

1. **In-Memory Storage First**: The application uses MemStorage for rapid prototyping, with an IStorage interface that makes switching to PostgreSQL straightforward via `db:push` command.

2. **Shared Type Definitions**: Zod schemas in the shared folder ensure type safety across the full stack, with schemas used for both API validation and TypeScript type inference.

3. **Korean Localization**: The UI and food database are in Korean, targeting Korean-speaking patients with diabetes and CKD.

4. **Analysis Logic**: Food safety analysis runs server-side based on patient profile (CKD stage, diabetes status, lab values) and food nutritional data. Uses a priority-based verdict system:
   - **Priority Order**: 칼륨(K) > 인(P) > 당질(GI/Sugar) > 나트륨(Na)
   - **CKD Rules**: K > 350mg + CKD 3+ → Limit; P > 300mg + CKD 4+ → Limit
   - **DM Rules**: GI >= 70 + HbA1c >= 8.0 → Caution; Sugar >= 15g → Caution
   - **Sodium**: > 800mg → Limit; > 400mg + CKD 3+ → Caution

5. **Food Database**: 30 Korean food items (곡류 5, 채소 8, 과일 7, 단백질 7, 가공식품 3) with nutritional data per 100g.

## External Dependencies

### Database
- **PostgreSQL**: Configured via `DATABASE_URL` environment variable
- **Drizzle Kit**: For database migrations (`npm run db:push`)
- **connect-pg-simple**: For session storage (available but not currently used)

### UI Components
- **Radix UI**: Comprehensive set of accessible primitives (dialog, popover, select, etc.)
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component patterns in `client/src/components/ui/`

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **TSX**: TypeScript execution for development

### Fonts
- Google Fonts: Outfit (display), Inter (body), DM Sans, Fira Code, Geist Mono