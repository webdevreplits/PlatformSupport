import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum('role', ['admin', 'editor', 'viewer', 'auditor', 'integrator']);
export const pageStatusEnum = pgEnum('page_status', ['draft', 'published', 'archived']);
export const authTypeEnum = pgEnum('auth_type', ['api_key', 'oauth2', 'bearer', 'basic', 'none']);
export const actionTypeEnum = pgEnum('action_type', ['create', 'update', 'delete', 'publish', 'login', 'workflow_run', 'tool_test', 'rca_analysis', 'run_status_scraper']);

// Organizations
export const organizations = pgTable("organizations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  tenantId: varchar("tenant_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default('viewer'),
  orgId: integer("org_id").references(() => organizations.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Pages
export const pages = pgTable("pages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").references(() => organizations.id),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  layoutJson: jsonb("layout_json").notNull(),
  status: pageStatusEnum("status").notNull().default('draft'),
  version: integer("version").notNull().default(1),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Widgets
export const widgets = pgTable("widgets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  pageId: integer("page_id").references(() => pages.id, { onDelete: 'cascade' }),
  type: varchar("type", { length: 100 }).notNull(),
  propsJson: jsonb("props_json").notNull(),
  positionJson: jsonb("position_json").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tools (connectors)
export const tools = pgTable("tools", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").references(() => organizations.id),
  name: text("name").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  baseUrl: text("base_url"),
  authType: authTypeEnum("auth_type").notNull().default('api_key'),
  configJson: jsonb("config_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Connections
export const connections = pgTable("connections", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  toolId: integer("tool_id").references(() => tools.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  encryptedCredentials: text("encrypted_credentials").notNull(),
  lastTestedAt: timestamp("last_tested_at"),
  status: varchar("status", { length: 50 }).notNull().default('active'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workflows
export const workflows = pgTable("workflows", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").references(() => organizations.id),
  name: text("name").notNull(),
  workflowJson: jsonb("workflow_json").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Alerts
export const alerts = pgTable("alerts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orgId: integer("org_id").references(() => organizations.id),
  name: text("name").notNull(),
  rulesJson: jsonb("rules_json").notNull(),
  channelsJson: jsonb("channels_json").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  actorId: integer("actor_id").references(() => users.id),
  action: actionTypeEnum("action").notNull(),
  resourceType: varchar("resource_type", { length: 100 }).notNull(),
  resourceId: integer("resource_id"),
  diffJson: jsonb("diff_json"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Versions
export const versions = pgTable("versions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  resourceType: varchar("resource_type", { length: 100 }).notNull(),
  resourceId: integer("resource_id").notNull(),
  versionJson: jsonb("version_json").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  pages: many(pages),
  tools: many(tools),
  workflows: many(workflows),
  alerts: many(alerts),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  createdPages: many(pages),
  createdWorkflows: many(workflows),
  auditLogs: many(auditLogs),
  versions: many(versions),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [pages.orgId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [pages.createdBy],
    references: [users.id],
  }),
  widgets: many(widgets),
}));

export const widgetsRelations = relations(widgets, ({ one }) => ({
  page: one(pages, {
    fields: [widgets.pageId],
    references: [pages.id],
  }),
}));

export const toolsRelations = relations(tools, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tools.orgId],
    references: [organizations.id],
  }),
  connections: many(connections),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  tool: one(tools, {
    fields: [connections.toolId],
    references: [tools.id],
  }),
}));

export const workflowsRelations = relations(workflows, ({ one }) => ({
  organization: one(organizations, {
    fields: [workflows.orgId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [workflows.createdBy],
    references: [users.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  organization: one(organizations, {
    fields: [alerts.orgId],
    references: [organizations.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));

export const versionsRelations = relations(versions, ({ one }) => ({
  creator: one(users, {
    fields: [versions.createdBy],
    references: [users.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = z.object({
  email: z.string().email(),
  passwordHash: z.string().min(1),
  role: z.enum(['admin', 'editor', 'viewer', 'auditor', 'integrator']).default('viewer'),
  orgId: z.number().optional().nullable(),
  metadata: z.any().optional().nullable(),
});

export const insertOrganizationSchema = z.object({
  name: z.string().min(1),
  tenantId: z.string().optional().nullable(),
});

export const insertPageSchema = z.object({
  orgId: z.number().optional().nullable(),
  name: z.string().min(1),
  slug: z.string().min(1),
  layoutJson: z.any(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  version: z.number().default(1),
  createdBy: z.number().optional().nullable(),
});

export const insertWidgetSchema = z.object({
  pageId: z.number().optional().nullable(),
  type: z.string().min(1),
  propsJson: z.any(),
  positionJson: z.any(),
});

export const insertToolSchema = z.object({
  orgId: z.number().optional().nullable(),
  name: z.string().min(1),
  type: z.string().min(1),
  baseUrl: z.string().optional().nullable(),
  authType: z.enum(['api_key', 'oauth2', 'bearer', 'basic', 'none']).default('api_key'),
  configJson: z.any().optional().nullable(),
});

export const insertConnectionSchema = z.object({
  toolId: z.number().optional().nullable(),
  name: z.string().min(1),
  encryptedCredentials: z.string().min(1),
  lastTestedAt: z.date().optional().nullable(),
  status: z.string().default('active'),
});

export const insertWorkflowSchema = z.object({
  orgId: z.number().optional().nullable(),
  name: z.string().min(1),
  workflowJson: z.any(),
  enabled: z.boolean().default(true),
  createdBy: z.number().optional().nullable(),
});

export const insertAlertSchema = z.object({
  orgId: z.number().optional().nullable(),
  name: z.string().min(1),
  rulesJson: z.any(),
  channelsJson: z.any(),
  enabled: z.boolean().default(true),
});

export const insertAuditLogSchema = z.object({
  actorId: z.number().optional().nullable(),
  action: z.enum(['create', 'update', 'delete', 'publish', 'login', 'workflow_run', 'tool_test', 'rca_analysis', 'run_status_scraper']),
  resourceType: z.string().min(1),
  resourceId: z.number().optional().nullable(),
  diffJson: z.any().optional().nullable(),
});

export const insertVersionSchema = z.object({
  resourceType: z.string().min(1),
  resourceId: z.number(),
  versionJson: z.any(),
  createdBy: z.number().optional().nullable(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Widget = typeof widgets.$inferSelect;
export type InsertWidget = z.infer<typeof insertWidgetSchema>;
export type Tool = typeof tools.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type Version = typeof versions.$inferSelect;
export type InsertVersion = z.infer<typeof insertVersionSchema>;
