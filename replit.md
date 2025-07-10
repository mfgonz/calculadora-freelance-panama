# Freelance Calculator Application

## Overview

This is a full-stack web application built for freelancers in Panama to calculate hourly rates and tax deductions. The application features two main calculators: a freelance rate calculator and a tax deductions calculator, both tailored to Panamanian tax regulations. Updated with the latest CSS deduction rates from Law 462 of March 18, 2025.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Modular storage interface with in-memory implementation for development
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **API Design**: RESTful API with `/api` prefix

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Migration**: Drizzle-kit for database schema management
- **Schema**: Centralized in `shared/schema.ts` with Zod validation
- **Database Provider**: Neon Database (serverless PostgreSQL)

## Key Components

### Frontend Components
1. **FreelanceCalculator**: Calculates hourly rates based on income, expenses, and working hours
2. **DeductionsCalculator**: Calculates tax deductions based on salary and age eligibility
3. **UI Components**: Comprehensive set of accessible components (Button, Input, Card, etc.)
4. **Layout**: Responsive design with mobile-first approach

### Backend Components
1. **Storage Interface**: Abstract storage layer for CRUD operations
2. **Route Registration**: Modular route setup with Express
3. **Middleware**: Request logging and error handling
4. **Development Server**: Vite integration for hot reloading

### Shared Components
1. **Schema Definitions**: User model with Drizzle and Zod integration
2. **Type Safety**: Shared TypeScript types between frontend and backend

## Data Flow

### Calculator Flow
1. User inputs financial data (salary, expenses, working hours)
2. Frontend performs real-time calculations using pure functions
3. Results are displayed immediately without server interaction
4. Users can export calculation results as JSON

### Application Flow
1. Client requests are handled by Express server
2. API routes perform business logic and database operations
3. Storage layer abstracts database interactions
4. Frontend uses TanStack Query for API state management

## External Dependencies

### Frontend Dependencies
- **UI/UX**: Radix UI components, Lucide React icons, Tailwind CSS
- **State Management**: TanStack React Query for server state
- **Validation**: React Hook Form with Hookform Resolvers
- **Utilities**: clsx, class-variance-authority, date-fns

### Backend Dependencies
- **Database**: Drizzle ORM, @neondatabase/serverless
- **Server**: Express.js with TypeScript support
- **Session**: connect-pg-simple for PostgreSQL sessions
- **Development**: tsx for TypeScript execution

### Development Dependencies
- **Build Tools**: Vite with React plugin
- **TypeScript**: Full type safety across the stack
- **Database Tools**: Drizzle Kit for migrations and schema management

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds optimized React bundle to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Uses tsx for TypeScript execution with hot reloading
- **Production**: Node.js runs compiled JavaScript bundle
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### File Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── dist/            # Build output
└── migrations/      # Database migrations
```

The application is designed for easy deployment on platforms like Replit, with automatic environment detection and appropriate development/production configurations.

## Recent Changes (July 2025)

### CSS Deduction Updates - Law 462 of March 18, 2025
- **Employee deductions**: Updated to 9.75% CSS + 1.25% Education = 11% total
- **Independent worker deductions**: 9.36% IVM (obligatory) + 8.5% E&M (voluntary)
- **New calculation functions**: Added `calculateFreelancerDeductions()` for independent workers
- **Updated legal framework**: Display shows both Law 462 (2025) and Law 51 (2005)
- **Calendar selector**: Implemented proper date picker with calendar dropdown using Popover and Calendar components