# Azure Platform Support - No-Code App Builder

## Overview

A production-grade, modular no-code web application for Azure platform support teams to monitor and manage enterprise infrastructure and services. The platform provides real-time monitoring of Databricks jobs, ServiceNow incidents, workflow automation, and tool integrations with a visual page builder for creating custom dashboards without writing code.

**Core Capabilities:**
- **Dashboard Overview**: Real-time monitoring of Active Incidents, Databricks Jobs, Workflows, and System Health
- **Incidents Management**: ServiceNow ticket tracking with priority and status filtering
- **Jobs Monitoring**: Databricks job execution tracking with success rates and performance metrics
- **Tools Integration**: Connected services dashboard (Databricks, ServiceNow, Power BI, Azure DevOps)
- **Visual Page Builder**: Drag-and-drop widgets (Heading, Text, Button, Metric, Chart, Table)
- **Workflow Automation**: Triggers, actions, and alerts for platform operations
- **Enterprise Security**: JWT authentication, role-based access control, audit logging

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript using Vite as the build tool
- **UI Library:** shadcn/ui components built on Radix UI primitives
- **Styling:** TailwindCSS with custom glassmorphic design system
- **State Management:** TanStack React Query for server state
- **Routing:** Wouter (lightweight client-side routing)
- **Form Handling:** React Hook Form with Zod validation

**Design System:**
- Glassmorphic aesthetic with gradient overlays inspired by modern fintech dashboards (Stripe, Plaid, Linear)
- Deep blue-purple gradient backgrounds (220-250 hue range)
- Custom color tokens for charts, actions, and status indicators
- Inter font for UI, JetBrains Mono for numerical data
- Responsive grid system with mobile-first approach

**Key Components:**
- `GlassmorphicCard`: Reusable card component with backdrop blur and gradient variants
- `MetricCard`: Dashboard metrics display with icons, trends, and badges
- `PhoneMockup`: Mobile preview component for responsive testing
- `DashboardHeader`: Global navigation with search and theme toggle
- `AppSidebar`: Fixed sidebar navigation with icon-based menu

### Backend Architecture

**Framework:** Express.js with TypeScript
- **Runtime:** Node.js with ES modules
- **ORM:** Drizzle ORM for type-safe database operations
- **Database Driver:** Neon Serverless (PostgreSQL) with WebSocket support
- **Authentication:** JWT-based with bcrypt password hashing
- **Session Management:** Custom middleware with role-based access control

**API Structure:**
- RESTful endpoints under `/api` prefix
- Authentication routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Resource routes for pages, widgets, tools, connections, workflows, alerts, and audit logs
- Middleware chain: Request logging → JSON parsing → Authentication → Authorization → Route handlers

**Key Patterns:**
- Repository pattern via `IStorage` interface for data access abstraction
- Middleware-based authentication with `authenticateToken` and `requireRole` guards
- Centralized error handling middleware
- Request/response logging with duration tracking

### Data Storage & Schema

**Primary Database:** PostgreSQL (via Neon Serverless)
- **Migration Tool:** Drizzle Kit with `drizzle.config.ts` configuration
- **Schema Location:** `shared/schema.ts` (shared between client and server)

**Core Tables:**
1. **organizations**: Multi-tenant support with tenant IDs
2. **users**: Authentication with role-based permissions (admin, editor, viewer, auditor, integrator)
3. **pages**: Dynamic page definitions with JSON layout, versioning, and status (draft/published/archived)
4. **widgets**: Configurable UI components with type, configuration, and data bindings
5. **tools**: External service integrations with auth config and metadata
6. **connections**: OAuth/API credentials storage with encryption
7. **workflows**: Automation rules with triggers and actions
8. **alerts**: Notification configurations
9. **audit_logs**: Complete activity tracking with user, action, resource type, and changes
10. **versions**: Page/widget version history for rollback capability

**Data Relationships:**
- Organizations → Users (one-to-many)
- Organizations → Pages (one-to-many)
- Pages → Widgets (one-to-many)
- Tools → Connections (one-to-many)
- All entities reference creator via `createdBy` foreign key

### Authentication & Authorization

**Authentication Flow:**
1. User registers/logs in via POST `/api/auth/register` or `/api/auth/login`
2. Server validates credentials, hashes passwords with bcrypt
3. JWT token generated with userId payload, 7-day expiration
4. Token stored in localStorage on client
5. Subsequent requests include `Authorization: Bearer <token>` header

**Authorization Model:**
- **Role-Based Access Control (RBAC):** Five roles with hierarchical permissions
  - `admin`: Full system access, can create organizations
  - `editor`: Can create/edit pages and widgets
  - `viewer`: Read-only access
  - `auditor`: Access to audit logs and monitoring
  - `integrator`: Can manage tools and connections
- **Middleware Guards:** `requireRole(...roles)` enforces permissions per route
- **Organization Scoping:** All resources scoped to organization ID for multi-tenancy

### External Dependencies

**Core Infrastructure:**
- **Neon Database:** Serverless PostgreSQL with WebSocket connections for real-time queries
- **Drizzle ORM:** Type-safe database toolkit with schema-first design

**UI Components:**
- **Radix UI:** Headless component primitives (30+ components: Dialog, Dropdown, Popover, Tabs, etc.)
- **shadcn/ui:** Pre-styled component library built on Radix primitives
- **Lucide React:** Icon library for UI elements

**Development & Build:**
- **Vite:** Frontend build tool with HMR and React plugin
- **TypeScript:** Static typing across entire codebase
- **TailwindCSS:** Utility-first CSS framework with custom configuration
- **ESBuild:** Backend bundling for production

**Authentication & Security:**
- **jsonwebtoken:** JWT token generation and verification
- **bcryptjs:** Password hashing with salt rounds

**State & Data Fetching:**
- **TanStack React Query:** Server state management, caching, and synchronization
- **React Hook Form:** Form state management with validation
- **Zod:** Schema validation and type inference

**Routing & Navigation:**
- **Wouter:** Lightweight client-side routing (< 2KB alternative to React Router)

**Planned Integrations (based on design doc):**
- Azure Active Directory (MSAL) for SSO
- Azure Service Bus or RabbitMQ for message queuing
- OpenSearch/Elasticsearch for full-text search
- Redis for caching and session storage
- Azure Key Vault for secrets management
- OpenTelemetry + Prometheus + Grafana for observability

**Seed Data:**
- Demo organization with admin/editor/viewer users (passwords: admin123, editor123, viewer123)
- Main Dashboard page with metric widgets
- Tool integrations: Databricks, ServiceNow, Power BI, Azure DevOps

**Dashboard Features:**
- **Active Incidents**: ServiceNow ticket tracking (23 active, 5 critical)
- **Databricks Jobs**: Job monitoring (142 running, 98% success rate)
- **Active Workflows**: Automation flow status (47 operational)
- **System Health**: Platform uptime tracking (99.8% uptime)
- **Recent Activity**: Real-time feed of platform events
- **Connected Services**: Integration status for all tools

**Navigation Menu:**
- Dashboard: Azure platform overview
- Pages: Custom page builder and management
- Incidents: ServiceNow incident tracking
- Jobs: Databricks job monitoring
- Tools: Connector and integration management
- Settings: Platform configuration
- Help: Support documentation