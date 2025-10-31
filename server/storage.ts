import { 
  users, pages, widgets, tools, connections, workflows, alerts, auditLogs, versions, organizations,
  type User, type InsertUser, type Page, type InsertPage, type Widget, type InsertWidget,
  type Tool, type InsertTool, type Connection, type InsertConnection, type Workflow, type InsertWorkflow,
  type Alert, type InsertAlert, type AuditLog, type InsertAuditLog, type Version, type InsertVersion,
  type Organization, type InsertOrganization
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Organizations
  getOrganization(id: number): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  
  // Pages
  getPages(orgId: number): Promise<Page[]>;
  getPage(id: number): Promise<Page | undefined>;
  getPageBySlug(slug: string, orgId: number): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: number, page: Partial<InsertPage>): Promise<Page>;
  deletePage(id: number): Promise<void>;
  
  // Widgets
  getWidgetsByPage(pageId: number): Promise<Widget[]>;
  createWidget(widget: InsertWidget): Promise<Widget>;
  updateWidget(id: number, widget: Partial<InsertWidget>): Promise<Widget>;
  deleteWidget(id: number): Promise<void>;
  
  // Tools
  getTools(orgId: number): Promise<Tool[]>;
  getTool(id: number): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: number, tool: Partial<InsertTool>): Promise<Tool>;
  deleteTool(id: number): Promise<void>;
  
  // Connections
  getConnections(toolId: number): Promise<Connection[]>;
  getConnectionByName(name: string, toolId: number | null): Promise<Connection | undefined>;
  createConnection(connection: InsertConnection): Promise<Connection>;
  updateConnection(id: number, connection: Partial<InsertConnection>): Promise<Connection>;
  
  // Workflows
  getWorkflows(orgId: number): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow>;
  
  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(resourceType: string, resourceId: number): Promise<AuditLog[]>;
  
  // Versions
  createVersion(version: InsertVersion): Promise<Version>;
  getVersions(resourceType: string, resourceId: number): Promise<Version[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Organizations
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org || undefined;
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const [org] = await db.insert(organizations).values(insertOrg).returning();
    return org;
  }

  // Pages
  async getPages(orgId: number): Promise<Page[]> {
    return await db.select().from(pages).where(eq(pages.orgId, orgId));
  }

  async getPage(id: number): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page || undefined;
  }

  async getPageBySlug(slug: string, orgId: number): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(
      and(eq(pages.slug, slug), eq(pages.orgId, orgId))
    );
    return page || undefined;
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const [page] = await db.insert(pages).values({
      ...insertPage,
      layoutJson: insertPage.layoutJson ?? {},
    }).returning();
    return page;
  }

  async updatePage(id: number, updateData: Partial<InsertPage>): Promise<Page> {
    const [page] = await db.update(pages).set(updateData).where(eq(pages.id, id)).returning();
    return page;
  }

  async deletePage(id: number): Promise<void> {
    await db.delete(pages).where(eq(pages.id, id));
  }

  // Widgets
  async getWidgetsByPage(pageId: number): Promise<Widget[]> {
    return await db.select().from(widgets).where(eq(widgets.pageId, pageId));
  }

  async createWidget(insertWidget: InsertWidget): Promise<Widget> {
    const [widget] = await db.insert(widgets).values({
      ...insertWidget,
      type: insertWidget.type,
      propsJson: insertWidget.propsJson ?? {},
      positionJson: insertWidget.positionJson ?? {},
    }).returning();
    return widget;
  }

  async updateWidget(id: number, updateData: Partial<InsertWidget>): Promise<Widget> {
    const [widget] = await db.update(widgets).set(updateData).where(eq(widgets.id, id)).returning();
    return widget;
  }

  async deleteWidget(id: number): Promise<void> {
    await db.delete(widgets).where(eq(widgets.id, id));
  }

  // Tools
  async getTools(orgId: number): Promise<Tool[]> {
    return await db.select().from(tools).where(eq(tools.orgId, orgId));
  }

  async getTool(id: number): Promise<Tool | undefined> {
    const [tool] = await db.select().from(tools).where(eq(tools.id, id));
    return tool || undefined;
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    const [tool] = await db.insert(tools).values(insertTool).returning();
    return tool;
  }

  async updateTool(id: number, updateData: Partial<InsertTool>): Promise<Tool> {
    const [tool] = await db.update(tools).set(updateData).where(eq(tools.id, id)).returning();
    return tool;
  }

  async deleteTool(id: number): Promise<void> {
    await db.delete(tools).where(eq(tools.id, id));
  }

  // Connections
  async getConnections(toolId: number): Promise<Connection[]> {
    return await db.select().from(connections).where(eq(connections.toolId, toolId));
  }

  async getConnectionByName(name: string, toolId: number | null = null): Promise<Connection | undefined> {
    const query = toolId !== null 
      ? db.select().from(connections).where(and(eq(connections.name, name), eq(connections.toolId, toolId)))
      : db.select().from(connections).where(eq(connections.name, name));
    const [connection] = await query;
    return connection || undefined;
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const [connection] = await db.insert(connections).values(insertConnection).returning();
    return connection;
  }

  async updateConnection(id: number, updateData: Partial<InsertConnection>): Promise<Connection> {
    const [connection] = await db.update(connections).set(updateData).where(eq(connections.id, id)).returning();
    return connection;
  }

  // Workflows
  async getWorkflows(orgId: number): Promise<Workflow[]> {
    return await db.select().from(workflows).where(eq(workflows.orgId, orgId));
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const [workflow] = await db.insert(workflows).values({
      ...insertWorkflow,
      workflowJson: insertWorkflow.workflowJson ?? {},
    }).returning();
    return workflow;
  }

  async updateWorkflow(id: number, updateData: Partial<InsertWorkflow>): Promise<Workflow> {
    const [workflow] = await db.update(workflows).set(updateData).where(eq(workflows.id, id)).returning();
    return workflow;
  }

  // Audit Logs
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(insertLog).returning();
    return log;
  }

  async getAuditLogs(resourceType: string, resourceId: number): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).where(
      and(eq(auditLogs.resourceType, resourceType), eq(auditLogs.resourceId, resourceId))
    );
  }

  // Versions
  async createVersion(insertVersion: InsertVersion): Promise<Version> {
    const [version] = await db.insert(versions).values({
      ...insertVersion,
      versionJson: insertVersion.versionJson ?? {},
    }).returning();
    return version;
  }

  async getVersions(resourceType: string, resourceId: number): Promise<Version[]> {
    return await db.select().from(versions).where(
      and(eq(versions.resourceType, resourceType), eq(versions.resourceId, resourceId))
    );
  }
}

// Streamlit mode storage (no database, minimal features)
class StreamlitStorage implements IStorage {
  // Users - Not supported in streamlit mode
  async getUser(id: number): Promise<User | undefined> {
    return {
      id: 1,
      email: "databricks-user@streamlit.app",
      passwordHash: "",
      role: "admin",
      orgId: 1,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.getUser(1);
  }
  async createUser(user: InsertUser): Promise<User> {
    throw new Error("User management not available in Streamlit mode");
  }
  
  // Organizations
  async getOrganization(id: number): Promise<Organization | undefined> {
    return {
      id: 1,
      name: "Databricks Organization",
      createdAt: new Date(),
    } as Organization;
  }
  async createOrganization(org: InsertOrganization): Promise<Organization> {
    throw new Error("Organization management not available in Streamlit mode");
  }
  
  // Pages - Not supported
  async getPages(orgId: number): Promise<Page[]> { return []; }
  async getPage(id: number): Promise<Page | undefined> { return undefined; }
  async getPageBySlug(slug: string, orgId: number): Promise<Page | undefined> { return undefined; }
  async createPage(page: InsertPage): Promise<Page> {
    throw new Error("Page builder not available in Streamlit mode");
  }
  async updatePage(id: number, page: Partial<InsertPage>): Promise<Page> {
    throw new Error("Page builder not available in Streamlit mode");
  }
  async deletePage(id: number): Promise<void> {
    throw new Error("Page builder not available in Streamlit mode");
  }
  
  // Widgets - Not supported
  async getWidgetsByPage(pageId: number): Promise<Widget[]> { return []; }
  async createWidget(widget: InsertWidget): Promise<Widget> {
    throw new Error("Widgets not available in Streamlit mode");
  }
  async updateWidget(id: number, widget: Partial<InsertWidget>): Promise<Widget> {
    throw new Error("Widgets not available in Streamlit mode");
  }
  async deleteWidget(id: number): Promise<void> {
    throw new Error("Widgets not available in Streamlit mode");
  }
  
  // Tools - Return empty list
  async getTools(orgId: number): Promise<Tool[]> { return []; }
  async getTool(id: number): Promise<Tool | undefined> { return undefined; }
  async createTool(tool: InsertTool): Promise<Tool> {
    throw new Error("Tool management not available in Streamlit mode");
  }
  async updateTool(id: number, tool: Partial<InsertTool>): Promise<Tool> {
    throw new Error("Tool management not available in Streamlit mode");
  }
  async deleteTool(id: number): Promise<void> {
    throw new Error("Tool management not available in Streamlit mode");
  }
  
  // Connections - Not supported
  async getConnections(toolId: number): Promise<Connection[]> { return []; }
  async getConnectionByName(name: string, toolId: number | null): Promise<Connection | undefined> {
    return undefined;
  }
  async createConnection(connection: InsertConnection): Promise<Connection> {
    throw new Error("Connections not available in Streamlit mode");
  }
  async updateConnection(id: number, connection: Partial<InsertConnection>): Promise<Connection> {
    throw new Error("Connections not available in Streamlit mode");
  }
  
  // Workflows - Not supported
  async getWorkflows(orgId: number): Promise<Workflow[]> { return []; }
  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    throw new Error("Workflows not available in Streamlit mode");
  }
  async updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow> {
    throw new Error("Workflows not available in Streamlit mode");
  }
  
  // Audit Logs - Not supported
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    // Silently ignore audit logs in streamlit mode
    return { id: 1, ...log, timestamp: new Date() } as AuditLog;
  }
  async getAuditLogs(resourceType: string, resourceId: number): Promise<AuditLog[]> { return []; }
  
  // Versions - Not supported
  async createVersion(version: InsertVersion): Promise<Version> {
    throw new Error("Versioning not available in Streamlit mode");
  }
  async getVersions(resourceType: string, resourceId: number): Promise<Version[]> { return []; }
}

import { DB_ENABLED } from "./db";
export const storage: IStorage = DB_ENABLED ? new DatabaseStorage() : new StreamlitStorage();
