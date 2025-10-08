import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { generateToken, authenticateToken, requireRole, type AuthRequest } from "./middleware/auth";
import { insertUserSchema, insertOrganizationSchema, insertPageSchema, insertWidgetSchema, insertToolSchema, insertConnectionSchema, insertWorkflowSchema, insertAlertSchema, insertAuditLogSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, organizationName } = req.body;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      let orgId: number | null = null;
      if (organizationName) {
        const org = await storage.createOrganization({ name: organizationName });
        orgId = org.id;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        passwordHash,
        role: orgId ? "admin" : "viewer",
        orgId,
      });

      const token = generateToken(user.id);

      await storage.createAuditLog({
        actorId: user.id,
        action: "login",
        resourceType: "user",
        resourceId: user.id,
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          orgId: user.orgId,
        },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user.id);

      await storage.createAuditLog({
        actorId: user.id,
        action: "login",
        resourceType: "user",
        resourceId: user.id,
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          orgId: user.orgId,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    res.json({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      orgId: req.user.orgId,
    });
  });

  // Page routes
  app.get("/api/pages", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.orgId) {
        return res.status(400).json({ error: "No organization found" });
      }

      const pages = await storage.getPages(req.user.orgId);
      res.json(pages);
    } catch (error) {
      console.error("Get pages error:", error);
      res.status(500).json({ error: "Failed to get pages" });
    }
  });

  app.get("/api/pages/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const page = await storage.getPage(parseInt(req.params.id));
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }

      res.json(page);
    } catch (error) {
      console.error("Get page error:", error);
      res.status(500).json({ error: "Failed to get page" });
    }
  });

  app.post("/api/pages", authenticateToken, requireRole("admin", "editor"), async (req: AuthRequest, res) => {
    try {
      const validated = insertPageSchema.parse(req.body);
      const page = await storage.createPage({
        ...validated,
        orgId: req.user!.orgId,
        createdBy: req.user!.id,
      });

      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "create",
        resourceType: "page",
        resourceId: page.id,
      });

      res.json(page);
    } catch (error) {
      console.error("Create page error:", error);
      res.status(500).json({ error: "Failed to create page" });
    }
  });

  app.patch("/api/pages/:id", authenticateToken, requireRole("admin", "editor"), async (req: AuthRequest, res) => {
    try {
      const page = await storage.updatePage(parseInt(req.params.id), req.body);

      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "update",
        resourceType: "page",
        resourceId: page.id,
        diffJson: req.body,
      });

      res.json(page);
    } catch (error) {
      console.error("Update page error:", error);
      res.status(500).json({ error: "Failed to update page" });
    }
  });

  app.delete("/api/pages/:id", authenticateToken, requireRole("admin", "editor"), async (req: AuthRequest, res) => {
    try {
      const pageId = parseInt(req.params.id);
      await storage.deletePage(pageId);

      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "delete",
        resourceType: "page",
        resourceId: pageId,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Delete page error:", error);
      res.status(500).json({ error: "Failed to delete page" });
    }
  });

  // Widget routes
  app.get("/api/pages/:pageId/widgets", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const widgets = await storage.getWidgetsByPage(parseInt(req.params.pageId));
      res.json(widgets);
    } catch (error) {
      console.error("Get widgets error:", error);
      res.status(500).json({ error: "Failed to get widgets" });
    }
  });

  app.post("/api/widgets", authenticateToken, requireRole("admin", "editor"), async (req: AuthRequest, res) => {
    try {
      const validated = insertWidgetSchema.parse(req.body);
      const widget = await storage.createWidget(validated);
      res.json(widget);
    } catch (error) {
      console.error("Create widget error:", error);
      res.status(500).json({ error: "Failed to create widget" });
    }
  });

  app.patch("/api/widgets/:id", authenticateToken, requireRole("admin", "editor"), async (req: AuthRequest, res) => {
    try {
      const widget = await storage.updateWidget(parseInt(req.params.id), req.body);
      res.json(widget);
    } catch (error) {
      console.error("Update widget error:", error);
      res.status(500).json({ error: "Failed to update widget" });
    }
  });

  app.delete("/api/widgets/:id", authenticateToken, requireRole("admin", "editor"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteWidget(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete widget error:", error);
      res.status(500).json({ error: "Failed to delete widget" });
    }
  });

  // Tool routes
  app.get("/api/tools", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.orgId) {
        return res.status(400).json({ error: "No organization found" });
      }

      const tools = await storage.getTools(req.user.orgId);
      res.json(tools);
    } catch (error) {
      console.error("Get tools error:", error);
      res.status(500).json({ error: "Failed to get tools" });
    }
  });

  app.post("/api/tools", authenticateToken, requireRole("admin", "integrator"), async (req: AuthRequest, res) => {
    try {
      const validated = insertToolSchema.parse(req.body);
      const tool = await storage.createTool({
        ...validated,
        orgId: req.user!.orgId,
      });

      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "create",
        resourceType: "tool",
        resourceId: tool.id,
      });

      res.json(tool);
    } catch (error) {
      console.error("Create tool error:", error);
      res.status(500).json({ error: "Failed to create tool" });
    }
  });

  // Workflow routes
  app.get("/api/workflows", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.orgId) {
        return res.status(400).json({ error: "No organization found" });
      }

      const workflows = await storage.getWorkflows(req.user.orgId);
      res.json(workflows);
    } catch (error) {
      console.error("Get workflows error:", error);
      res.status(500).json({ error: "Failed to get workflows" });
    }
  });

  app.post("/api/workflows", authenticateToken, requireRole("admin", "editor"), async (req: AuthRequest, res) => {
    try {
      const validated = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow({
        ...validated,
        orgId: req.user!.orgId,
        createdBy: req.user!.id,
      });

      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "create",
        resourceType: "workflow",
        resourceId: workflow.id,
      });

      res.json(workflow);
    } catch (error) {
      console.error("Create workflow error:", error);
      res.status(500).json({ error: "Failed to create workflow" });
    }
  });

  // Audit log routes
  app.get("/api/audit-logs/:resourceType/:resourceId", authenticateToken, requireRole("admin", "auditor"), async (req: AuthRequest, res) => {
    try {
      const logs = await storage.getAuditLogs(req.params.resourceType, parseInt(req.params.resourceId));
      res.json(logs);
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ error: "Failed to get audit logs" });
    }
  });

  // Version routes
  app.get("/api/versions/:resourceType/:resourceId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const versions = await storage.getVersions(req.params.resourceType, parseInt(req.params.resourceId));
      res.json(versions);
    } catch (error) {
      console.error("Get versions error:", error);
      res.status(500).json({ error: "Failed to get versions" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
