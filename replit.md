# AzureOps Intelligence - AI-Powered Azure Platform Support

## Overview

AzureOps Intelligence is a next-generation AI-powered no-code internal dashboard and app builder platform designed for Azure Platform Support teams. The platform combines real-time infrastructure monitoring, AI-powered assistance, cost analysis, and workflow automation to streamline Azure operations and support.

**Core Capabilities:**
- **AI Assistant**: GPT-4o-mini powered chat interface for Azure support queries, ARM template generation, and intelligent automation
- **AI Dashboard Insights**: Automated operational insights and recommendations based on platform metrics
- **AI Incident Analysis**: Automated incident summarization, root cause analysis, and fix script generation
- **Dashboard Overview**: Real-time monitoring of Active Incidents, Databricks Jobs, Workflows, and System Health
- **Cost Analysis**: Azure spending tracking with cost breakdown by category and time range filtering
- **Resource Management**: Infrastructure resource tracking across Compute, Storage, Database, and Networking
- **Platform Analytics**: Comprehensive performance metrics, job success rates, and user activity tracking
- **Incidents Management**: ServiceNow ticket tracking with AI-powered summarization and automated fix generation
- **Jobs Monitoring**: Databricks job execution tracking with success rates and performance metrics
- **Visual Page Builder**: Drag-and-drop widgets (Heading, Text, Button, Metric, Chart, Table)
- **Workflow Automation**: Triggers, actions, and alerts for platform operations
- **Enterprise Security**: JWT authentication, role-based access control, audit logging

## User Preferences

Preferred communication style: Simple, everyday language.

## AI Features

### OpenAI Integration

The platform integrates with OpenAI GPT-4o-mini for intelligent assistance across all operations:

**Backend API Routes:**
- `POST /api/ai/chat` - General chat completion for Azure support queries
- `POST /api/ai/dashboard-insights` - Generate operational insights from platform metrics
- `POST /api/ai/summarize-incident` - Analyze incidents and provide root cause analysis
- `POST /api/ai/generate-fix` - Generate automated fix scripts (PowerShell/Azure CLI)
- `POST /api/ai/generate-report` - Create AI-generated operational reports

**AI Capabilities:**
- ARM/Bicep template generation
- Azure infrastructure troubleshooting
- Cost optimization recommendations
- Incident root cause analysis
- Automated fix script generation
- Operational insights and predictions

### AI Assistant Page

**Features:**
- Chat interface with message history
- Azure-specific knowledge base
- Quick action buttons for common tasks:
  - Generate ARM Template
  - Cost Analysis
  - Troubleshoot Issue
  - Create Runbook
- Real-time AI responses with loading states
- Code syntax highlighting for scripts

**Technical Details:**
- Uses OpenAI GPT-4o-mini model
- System prompt optimized for Azure platform support
- Conversation context maintained across messages
- Audit logging for all AI queries

### Dashboard AI Insights

**Features:**
- Automated insights generation on dashboard load
- Manual refresh capability
- Actionable recommendations based on:
  - Active incident count
  - Databricks job performance
  - System health metrics
  - Cost trends

**Implementation:**
- Fetches platform metrics automatically
- Generates 2-3 concise insights
- Updates dynamically with refresh button
- Loading states during generation

### Incident AI Analysis

**Features:**
- AI Summary button per incident
- Generate Fix button for automation scripts
- Displays analysis inline with incident details
- Loading indicators during generation

**AI Summary Provides:**
- Brief incident summary
- Root cause analysis
- Recommended actions
- Prevention tips

**Generate Fix Provides:**
- PowerShell or Azure CLI scripts
- Well-commented code
- Error handling
- Safety checks

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript using Vite as the build tool
- **UI Library:** shadcn/ui components built on Radix UI primitives
- **Styling:** TailwindCSS with professional corporate design
- **State Management:** TanStack React Query for server state
- **Routing:** Wouter (lightweight client-side routing)
- **Form Handling:** React Hook Form with Zod validation

**Design System:**
- Professional corporate aesthetic with clean light theme as default
- System fonts: Segoe UI, Roboto, Helvetica Neue, sans-serif
- Clean white cards with subtle shadows
- Custom color tokens for charts, actions, and status indicators
- JetBrains Mono for numerical data and code blocks
- Responsive grid system with mobile-first approach

**Key Components:**
- `Card`: Professional card components with shadow-sm
- `MetricCard`: Dashboard metrics display with icons, trends, and badges
- `DashboardHeader`: Global navigation with search and theme toggle
- `AppSidebar`: Fixed sidebar navigation with icon-based menu

### Backend Architecture

**Framework:** Express.js with TypeScript
- **Runtime:** Node.js with ES modules
- **ORM:** Drizzle ORM for type-safe database operations
- **Database Driver:** Neon Serverless (PostgreSQL) with WebSocket support
- **Authentication:** JWT-based with bcrypt password hashing
- **Session Management:** Custom middleware with role-based access control
- **AI Integration:** OpenAI SDK for GPT-4o-mini

**API Structure:**
- RESTful endpoints under `/api` prefix
- Authentication routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- AI routes: `/api/ai/chat`, `/api/ai/summarize-incident`, `/api/ai/generate-fix`, `/api/ai/dashboard-insights`, `/api/ai/generate-report`
- Resource routes for pages, widgets, tools, connections, workflows, alerts, and audit logs
- Middleware chain: Request logging → JSON parsing → Authentication → Authorization → Route handlers

**Key Patterns:**
- Repository pattern via `IStorage` interface for data access abstraction
- Middleware-based authentication with `authenticateToken` and `requireRole` guards
- Centralized error handling middleware
- Request/response logging with duration tracking
- AI utility functions in `server/utils/openai.ts`

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
9. **audit_logs**: Complete activity tracking with user, action, resource type, and changes (includes AI queries)
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
- **OpenAI:** GPT-4o-mini for AI-powered features

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
- **AI Insights**: Automated operational insights with refresh capability
- **Connected Services**: Integration status for all tools

**Navigation Menu:**
- **Dashboard**: Azure platform overview with real-time metrics and AI insights
- **AI Assistant**: Chat interface for Azure support queries and automation
- **Cost Analysis**: Azure spending tracking and optimization
  - Total cost monitoring with trend analysis
  - Cost breakdown by category (Compute, Storage, Database, Networking)
  - Top resource cost tracking
  - Time range filtering (7/30/90 days)
- **Resources**: Infrastructure resource management
  - Compute: VMs, Databricks, Kubernetes clusters
  - Storage: Storage accounts, Data Lakes
  - Database: SQL Database, Cosmos DB
  - Networking: VNets, Application Gateways
- **Analytics**: Platform performance and usage metrics
  - Overview: Job performance, success rates, user activity
  - Databricks: Job-specific performance metrics
  - User Activity: Platform usage tracking
  - System Metrics: Resource utilization
- **Pages**: Custom page builder (Admin/Editor only)
- **Incidents**: ServiceNow incident tracking with AI analysis
- **Jobs**: Databricks job monitoring
- **Settings**: Platform configuration

**Header Features:**
- Smart search: "Search resources, costs, or incidents..."
- Category filters: Compute, Storage, Database, Networking, Analytics, Security
- Theme toggle (light/dark mode)
- Notifications with badge counter

## Environment Variables

**Required:**
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `SESSION_SECRET`: JWT signing secret
- `OPENAI_API_KEY`: OpenAI API key for AI features

**Optional:**
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)

## Deployment

### Azure Databricks Streamlit ✅

The app is fully compatible with Azure Databricks Streamlit deployment:

**Deployment Files:**
- `streamlit_app.py`: Streamlit wrapper that embeds the React/Express app
- `requirements-streamlit.txt`: Python dependencies for Streamlit
- `README-DATABRICKS.md`: Complete deployment guide

**Quick Deploy to Databricks:**
```bash
# 1. Install Python dependencies
pip install -r requirements-streamlit.txt

# 2. Set environment variables
export DATABASE_URL="postgresql://..."
export SESSION_SECRET="your-secret"
export OPENAI_API_KEY="sk-..."

# 3. Run Streamlit app
streamlit run streamlit_app.py --server.port 8000
```

**Features in Databricks:**
- ✅ Auto-detects environment (Databricks/Replit/Local)
- ✅ Auto-installs Node.js dependencies
- ✅ Graceful degradation without database
- ✅ Embedded React app in iframe
- ✅ Direct access at localhost:5000
- ✅ AI features with OpenAI integration

### Standard Deployment

See README-DATABRICKS.md for complete deployment instructions.

## Recent Updates

### AI Integration (Latest)
- Added OpenAI GPT-4o-mini integration for intelligent assistance
- Created AI Assistant page with chat interface and quick actions
- Enhanced Dashboard with AI insights panel
- Added AI incident summarization and automated fix generation
- Created Analytics page with comprehensive platform metrics
- All AI operations include audit logging and error handling

### Design Transformation
- Transformed UI to professional corporate design with clean light theme as default
- Implemented system fonts (Segoe UI, Roboto, Helvetica Neue)
- Replaced glassmorphic effects with clean white cards and subtle shadows
- Enhanced Cost Analysis page with spending tracking
- Enhanced Resources page with tabbed interface
- Fixed filter tabs to work as functional pill-shaped toggle buttons

### Platform Features
- Azure Cost Analysis with time range filtering
- Resource management across multiple categories
- ServiceNow incident tracking
- Databricks job monitoring
- Workflow automation framework
- Enterprise authentication and RBAC
