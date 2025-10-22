# AzureOps Intelligence - AI-Powered Azure Platform Support

## Overview

AzureOps Intelligence is an AI-powered, no-code internal dashboard and app builder platform for Azure Platform Support teams. It provides real-time infrastructure monitoring, AI assistance, cost analysis, and workflow automation to streamline Azure operations. Key capabilities include an AI Assistant for support queries and automation, AI-powered operational insights, incident analysis, and a visual page builder. The platform aims to enhance efficiency, reduce operational costs, and improve incident resolution times for Azure environments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript, using Vite. It features `shadcn/ui` components based on Radix UI, styled with TailwindCSS for a professional corporate design. State management is handled by TanStack React Query, and routing by Wouter. The design system emphasizes a clean, light theme with system fonts, subtle shadows, and a responsive grid.

### Backend Architecture

The backend uses Express.js with TypeScript and Node.js. It integrates Drizzle ORM with Neon Serverless (PostgreSQL) for type-safe database operations. Authentication is JWT-based with bcrypt hashing and role-based access control. AI integration uses the Databricks Claude Sonnet 4.5 endpoint via the OpenAI SDK with custom baseURL. User-provided Databricks tokens are encrypted with AES-256-GCM and stored in the database. The API follows a RESTful structure with middleware for authentication, authorization, and error handling, implementing a repository pattern for data access.

### Data Storage & Schema

The primary database is PostgreSQL (Neon Serverless), managed with Drizzle Kit. The schema includes tables for organizations, users, dynamic pages, configurable widgets, external tool integrations, connection credentials, workflows, alerts, and audit logs. All resources are scoped to organization IDs for multi-tenancy, and a versioning system is in place for pages and widgets.

**Databricks Token Storage**: Organization-level Databricks tokens are stored in the `connections` table with `toolId = null` and `name = "Databricks AI"`. The `encryptedCredentials` field contains AES-256-GCM encrypted JSON with `token` and `baseUrl` properties.

### Authentication & Authorization

Authentication is JWT-based, with tokens stored client-side. Authorization uses Role-Based Access Control (RBAC) with five hierarchical roles: `admin`, `editor`, `viewer`, `auditor`, and `integrator`. Middleware guards enforce permissions, and all resources are scoped by organization ID to support multi-tenancy.

### Core AI Features

The platform integrates Databricks Claude Sonnet 4.5 for various AI functionalities. Users configure their Databricks token via the Settings UI:

- **AI Assistant Page**: A chat interface for Azure support, ARM/Bicep template generation, cost optimization, and troubleshooting, maintaining conversation context.
- **Dashboard AI Insights**: Automated operational insights and recommendations based on real-time platform metrics.
- **AI-Powered Root Cause Analysis (RCA)**: Comprehensive job failure analysis combining Databricks system tables with real-time internet research. The AI searches for platform outages (Databricks, Azure) on the failure date, verifies multiple sources, and combines internet findings with job logs, cluster configuration, and audit logs to provide structured analysis including root cause category, confidence level, verified sources, evidence, remediation steps, and prevention recommendations.
- **Incident AI Analysis**: AI-powered incident summarization, root cause analysis, and automated fix script generation (PowerShell/Azure CLI).
- **AI-powered Reporting**: Generation of operational reports.
- **Databricks Configuration**: Settings page allows users to enter and update their Databricks serving endpoint token. Tokens are encrypted at rest using AES-256-GCM encryption.

## External Dependencies

### Core Infrastructure

- **Neon Database**: Serverless PostgreSQL for data persistence.
- **Drizzle ORM**: Type-safe ORM for database interactions.
- **Databricks**: Claude Sonnet 4.5 model via serving endpoints for all AI capabilities. Users provide their own Databricks token via Settings UI.
- **OpenAI SDK**: Used as a client library to communicate with Databricks serving endpoints (via custom baseURL).

### UI Components

- **Radix UI**: Headless component primitives.
- **shadcn/ui**: Pre-styled component library built on Radix.
- **Lucide React**: Icon library.

### Development & Build

- **Vite**: Frontend build tool.
- **TypeScript**: For static typing.
- **TailwindCSS**: Utility-first CSS framework.

### Authentication & Security

- **jsonwebtoken**: For JWT handling.
- **bcryptjs**: For password hashing.
- **AES-256-GCM Encryption**: Databricks tokens are encrypted at rest in the database using Node.js crypto module.

### State & Data Fetching

- **TanStack React Query**: For server state management.
- **React Hook Form**: For form management.
- **Zod**: For schema validation.

### Routing

- **Wouter**: Lightweight client-side router.

## Recent Changes

### January 22, 2025 - RCA & Dashboard Enhancements

- **Spark Log Analysis**: Implemented comprehensive Spark log parser (`server/utils/spark-log-parser.ts`) that extracts errors, exceptions, and stack traces from Databricks `event_details` logs. Integrated into AI RCA workflow for actual job failure analysis.
- **Real Dashboard Metrics**: Replaced mock dashboard data with live Databricks system catalog queries. New `/api/dashboard/metrics` endpoint queries `system.lakeflow.job_run_timeline` and `system.compute.clusters` for real-time job statistics, success rates, cluster counts, and recent activity.
- **Enhanced RCA**: AI-powered RCA now combines Spark log errors with internet research to provide verified platform outage analysis with multiple source validation.

### Seed Data

The platform includes seed data for a demo organization with various user roles, a main dashboard page, and integrations for tools like Databricks, ServiceNow, Power BI, and Azure DevOps.