# Project Crafter - Upwork Profile Analysis Application

## Overview

Project Crafter is a web application that analyzes freelancer profiles to provide strategic insights for Upwork positioning. The application accepts a resume PDF, Upwork profile URL, and LinkedIn profile URL, then uses AI to generate comprehensive profile intelligence reports including skill gaps, market positioning recommendations, and keyword optimization suggestions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React with TypeScript using Vite as the build tool
- Client-side routing implemented with Wouter (lightweight React router)
- State management handled through React hooks and TanStack Query for server state

**UI Component System**
- Shadcn UI component library (New York style variant) with Radix UI primitives
- Tailwind CSS v4 for styling with custom design tokens
- Framer Motion for animations and transitions
- Form handling via React Hook Form with Zod validation

**Project Structure**
- Client code located in `client/src/` directory
- Shared types and schemas in `shared/` directory using path alias `@shared`
- Component aliases configured: `@/components`, `@/lib`, `@/hooks`

### Backend Architecture

**Server Framework**
- Express.js server with TypeScript
- ES Modules configuration (type: "module")
- Custom Vite integration for development with HMR support
- HTTP server wrapping Express for potential WebSocket support

**API Design**
- RESTful endpoints under `/api` prefix
- File upload handling via Multer (in-memory storage)
- PDF parsing using pdf-parse library
- Request logging middleware with timestamp and duration tracking

**Key Endpoints**
- `POST /api/upload-profile` - Accepts resume PDF and profile URLs, triggers AI analysis
- Analysis results stored and retrieved by profile ID

### Data Storage

**Database**
- PostgreSQL database via Neon serverless connection
- Drizzle ORM for type-safe database operations
- Schema definition in `shared/schema.ts` with automatic TypeScript type inference

**Schema Design**
- `user_profiles` table: Stores resume text and profile URLs
- `analysis_results` table: Stores AI-generated insights with JSONB fields for arrays
- `upwork_knowledge` table: Stores Upwork platform knowledge (categories, attributes, best practices)
- UUID primary keys with timestamp tracking

**Migration Strategy**
- Drizzle Kit for schema migrations
- Migrations output to `./migrations` directory
- Push-based deployment with `db:push` script

### AI Integration

**AI Service Provider**
- Anthropic Claude API via `@anthropic-ai/sdk` (temperature: 0 for deterministic responses)
- Perplexity API for real-time market research and pricing insights
- Profile analysis through structured prompts requesting JSON responses
- Analysis includes: archetype identification, proficiency scoring, skill extraction, gap analysis, and keyword recommendations

**Analysis Output Structure**
- Archetype and proficiency level
- Skills array and project portfolio
- Strategic gaps (positioning, missing skills, client targeting)
- Recommended keywords for profile optimization
- Signature Mechanism (unique branded process name e.g., "The 4-Phase Growth Protocol")

**Deterministic Prompt Handling**
- All AI prompts use conditional market research sections (included only when available)
- Empty string fallbacks when Perplexity fails (no placeholder prose)
- Ensures consistent, deterministic outputs regardless of market research availability

**Process Page (Requirements & Steps)**
- Step 5 in the project creation flow (after Gallery)
- AI generates contextual requirements and project steps based on project details
- Each requirement includes: description (max 350 chars), required checkbox
- Each step includes: title (max 75 chars), description (max 500 chars)
- Session storage persistence for user edits with stable index-based IDs

**Video Script Tone of Voice (Jonathan Sterritt Framework)**
The gallery video script generation follows a comprehensive tone of voice framework:
- Core Formula: Systematic Expert + Trenches Experience + Direct Challenge + Transformative Enthusiasm
- Voice Characteristics: Calm operator energy, no-BS directness, systematic confidence
- Sentence Rhythm: Short punchy sentences, 3-beat structure (Hook/Problem → Bridge/Insight → Resolution/Action)
- Language Patterns: "Here's the thing...", "Let's be honest", "Here's what actually works"
- Forbidden Words: "revolutionary", "game-changing", "cutting-edge", "seamless"
- Energy Progression: Hook (scroll-stopper) → Introduction (credibility) → Main Points (proof) → CTA (warm invitation)

**Sample Document Suggestions (Data-Driven)**
- Document suggestions are derived from actual profile analysis, not generic templates
- Each document includes "dataEvidence" field referencing specific skills or projects from resume
- Suggestions are tailored to freelancer's archetype and target client type

## External Dependencies

### Third-Party Services

**AI & Machine Learning**
- Anthropic Claude API for profile analysis and strategic recommendations

**Database**
- Neon Serverless PostgreSQL for data persistence
- Connection pooling via `@neondatabase/serverless`

**Cloud Platform**
- Replit hosting environment with automatic deployment detection
- Environment-specific Vite plugins for development (`@replit/vite-plugin-*`)

### Key Libraries

**Frontend**
- TanStack Query v5 for server state management and caching
- Wouter for client-side routing
- React Hook Form + Zod for form validation
- Framer Motion for animations
- Radix UI primitives for accessible components
- Lucide React for icons

**Backend**
- Drizzle ORM for database operations
- Multer for multipart/form-data handling
- pdf-parse for PDF text extraction
- Express with TypeScript support

**Build & Development**
- Vite for frontend bundling and development server
- esbuild for server-side bundling in production
- TypeScript with strict mode enabled
- Tailwind CSS v4 with PostCSS

### Environment Configuration

**Required Environment Variables**
- `DATABASE_URL` - PostgreSQL connection string (required for Drizzle)
- `ANTHROPIC_API_KEY` - Anthropic API key for AI analysis (implied)

**Development vs Production**
- Development uses Vite middleware mode with HMR
- Production builds static assets to `dist/public` and bundles server to `dist/index.cjs`
- Conditional Replit-specific plugins load only in development environment