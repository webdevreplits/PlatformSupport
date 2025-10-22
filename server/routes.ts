import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { generateToken, authenticateToken, requireRole, type AuthRequest } from "./middleware/auth";
import { insertUserSchema, insertOrganizationSchema, insertPageSchema, insertWidgetSchema, insertToolSchema, insertConnectionSchema, insertWorkflowSchema, insertAlertSchema, insertAuditLogSchema } from "@shared/schema";
import { generateChatCompletion, summarizeIncident, generateFixScript, generateDashboardInsights, generateReport, analyzeJobFailureRCA } from "./utils/openai";
import { executeSQLQuery, getFailedJobs, getJobRunDetails, getClusterInfo, getAuditLogs, testSQLConnection } from "./utils/databricks-sql";
import { encrypt, decrypt } from "./utils/encryption";
import { runStatusScraper, type StatusPageConfig } from "./utils/status-scraper";
import { correlateJobFailure } from "./utils/rca-correlator";

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

  // Helper to get Databricks config for user
  async function getDatabricksConfig(userId: number) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get Databricks AI connection by name (organization-level config with toolId = null)
    const databricksConnection = await storage.getConnectionByName("Databricks AI", null);
    
    if (!databricksConnection || !databricksConnection.encryptedCredentials) {
      throw new Error("Databricks token not configured. Please add your token in Settings.");
    }

    // Decrypt and parse the credentials
    const decrypted = decrypt(databricksConnection.encryptedCredentials);
    const config = JSON.parse(decrypted);
    
    return {
      token: config.token,
      baseUrl: config.baseUrl || "https://adb-7901759384367063.3.azuredatabricks.net/serving-endpoints",
      endpointName: config.endpointName || "databricks-claude-sonnet-4-5"
    };
  }

  // Helper to get SQL Warehouse config
  async function getSQLWarehouseConfig(userId: number) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const sqlConnection = await storage.getConnectionByName("SQL Warehouse", null);
    
    if (!sqlConnection || !sqlConnection.encryptedCredentials) {
      throw new Error("SQL Warehouse not configured. Please add your SQL Warehouse credentials in Settings.");
    }

    const decrypted = decrypt(sqlConnection.encryptedCredentials);
    const config = JSON.parse(decrypted);
    
    return {
      token: config.token,
      workspaceUrl: config.workspaceUrl || "https://adb-7901759384367063.3.azuredatabricks.net",
      warehouseId: config.warehouseId
    };
  }

  // Save/Update Databricks AI configuration
  app.post("/api/ai/config", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { token, baseUrl, endpointName } = req.body;
      const user = await storage.getUser(req.user!.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!token || !token.trim()) {
        return res.status(400).json({ error: "Token is required" });
      }

      // Check if Databricks AI connection already exists
      const existingConnection = await storage.getConnectionByName("Databricks AI", null);

      const credentialsData = {
        token,
        baseUrl: baseUrl || "https://adb-7901759384367063.3.azuredatabricks.net/serving-endpoints",
        endpointName: endpointName || "databricks-claude-sonnet-4-5"
      };

      // Encrypt credentials before storing
      const encryptedCredentials = encrypt(JSON.stringify(credentialsData));

      if (existingConnection) {
        // Update existing connection
        await storage.updateConnection(existingConnection.id, {
          encryptedCredentials,
          status: "active",
        });
        res.json({ message: "Databricks AI configuration updated successfully" });
      } else {
        // Create new connection (toolId = null for organization-level config)
        await storage.createConnection({
          toolId: null,
          name: "Databricks AI",
          encryptedCredentials,
          status: "active",
        });
        res.json({ message: "Databricks AI configuration saved successfully" });
      }

      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "update",
        resourceType: "connection",
        resourceId: existingConnection?.id || 0,
      });
    } catch (error) {
      console.error("Save Databricks config error:", error);
      res.status(500).json({ error: "Failed to save configuration" });
    }
  });

  // Get Databricks AI configuration status
  app.get("/api/ai/config", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const databricksConnection = await storage.getConnectionByName("Databricks AI", null);

      if (databricksConnection && databricksConnection.encryptedCredentials) {
        try {
          const decrypted = decrypt(databricksConnection.encryptedCredentials);
          const config = JSON.parse(decrypted);
          res.json({ 
            configured: true,
            baseUrl: config.baseUrl || "https://adb-7901759384367063.3.azuredatabricks.net/serving-endpoints",
            endpointName: config.endpointName || "databricks-claude-sonnet-4-5",
            hasToken: !!config.token
          });
        } catch (err) {
          console.error("Decryption error:", err);
          res.json({ configured: false });
        }
      } else {
        res.json({ configured: false });
      }
    } catch (error) {
      console.error("Get Databricks config error:", error);
      res.status(500).json({ error: "Failed to get configuration" });
    }
  });

  // AI routes
  app.post("/api/ai/chat", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { messages } = req.body;
      const config = await getDatabricksConfig(req.user!.id);
      const response = await generateChatCompletion(messages, config.token, config.baseUrl, config.endpointName);
      
      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "create",
        resourceType: "ai",
        resourceId: 0,
      });

      res.json({ response });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate AI response" });
    }
  });

  app.post("/api/ai/summarize-incident", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const incidentData = req.body;
      const config = await getDatabricksConfig(req.user!.id);
      const summary = await summarizeIncident(incidentData, config.token, config.baseUrl, config.endpointName);
      res.json({ summary });
    } catch (error) {
      console.error("Incident summarization error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to summarize incident" });
    }
  });

  app.post("/api/ai/generate-fix", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const incidentData = req.body;
      const config = await getDatabricksConfig(req.user!.id);
      const script = await generateFixScript(incidentData, config.token, config.baseUrl, config.endpointName);
      res.json({ script });
    } catch (error) {
      console.error("Fix script generation error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate fix script" });
    }
  });

  app.post("/api/ai/dashboard-insights", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const metrics = req.body;
      const config = await getDatabricksConfig(req.user!.id);
      const insights = await generateDashboardInsights(metrics, config.token, config.baseUrl, config.endpointName);
      res.json({ insights });
    } catch (error) {
      console.error("Dashboard insights error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate insights" });
    }
  });

  app.post("/api/ai/generate-report", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { reportType, data } = req.body;
      const config = await getDatabricksConfig(req.user!.id);
      const report = await generateReport(reportType, data, config.token, config.baseUrl, config.endpointName);
      res.json({ report });
    } catch (error) {
      console.error("Report generation error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate report" });
    }
  });

  // SQL Warehouse configuration routes
  app.post("/api/sql-warehouse/config", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { workspaceUrl, warehouseId, token } = req.body;
      const user = await storage.getUser(req.user!.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!token || !token.trim()) {
        return res.status(400).json({ error: "Token is required" });
      }

      if (!warehouseId || !warehouseId.trim()) {
        return res.status(400).json({ error: "Warehouse ID is required" });
      }

      // Check if SQL Warehouse connection already exists
      const existingConnection = await storage.getConnectionByName("SQL Warehouse", null);

      const credentialsData = {
        token,
        workspaceUrl: workspaceUrl || "https://adb-7901759384367063.3.azuredatabricks.net",
        warehouseId
      };

      // Encrypt credentials before storing
      const encryptedCredentials = encrypt(JSON.stringify(credentialsData));

      if (existingConnection) {
        // Update existing connection
        await storage.updateConnection(existingConnection.id, {
          encryptedCredentials,
          status: "active",
        });
        res.json({ message: "SQL Warehouse configuration updated successfully" });
      } else {
        // Create new connection (toolId = null for organization-level config)
        await storage.createConnection({
          toolId: null,
          name: "SQL Warehouse",
          encryptedCredentials,
          status: "active",
        });
        res.json({ message: "SQL Warehouse configuration saved successfully" });
      }

      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "update",
        resourceType: "connection",
        resourceId: existingConnection?.id || 0,
      });
    } catch (error) {
      console.error("Save SQL Warehouse config error:", error);
      res.status(500).json({ error: "Failed to save configuration" });
    }
  });

  app.get("/api/sql-warehouse/config", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const sqlConnection = await storage.getConnectionByName("SQL Warehouse", null);

      if (sqlConnection && sqlConnection.encryptedCredentials) {
        try {
          const decrypted = decrypt(sqlConnection.encryptedCredentials);
          const config = JSON.parse(decrypted);
          res.json({ 
            configured: true,
            workspaceUrl: config.workspaceUrl || "https://adb-7901759384367063.3.azuredatabricks.net",
            warehouseId: config.warehouseId || "",
            hasToken: !!config.token
          });
        } catch (err) {
          console.error("Decryption error:", err);
          res.json({ configured: false });
        }
      } else {
        res.json({ configured: false });
      }
    } catch (error) {
      console.error("Get SQL Warehouse config error:", error);
      res.status(500).json({ error: "Failed to get configuration" });
    }
  });

  // SQL Warehouse query routes
  app.get("/api/jobs/failed", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const config = await getSQLWarehouseConfig(req.user!.id);
      const days = parseInt(req.query.days as string) || 7;
      const jobs = await getFailedJobs(config, days);
      
      res.json({ jobs });
    } catch (error) {
      console.error("Get failed jobs error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get failed jobs" });
    }
  });

  app.get("/api/jobs/:runId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const config = await getSQLWarehouseConfig(req.user!.id);
      const runId = req.params.runId;
      const jobDetails = await getJobRunDetails(config, runId);
      
      if (!jobDetails) {
        return res.status(404).json({ error: "Job run not found" });
      }
      
      res.json({ job: jobDetails });
    } catch (error) {
      console.error("Get job details error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get job details" });
    }
  });

  app.post("/api/sql-warehouse/test", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const config = await getSQLWarehouseConfig(req.user!.id);
      const isConnected = await testSQLConnection(config);
      
      res.json({ connected: isConnected });
    } catch (error) {
      console.error("Test SQL connection error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to test connection" });
    }
  });

  // Status scraper routes
  app.post("/api/status-scraper/run", authenticateToken, requireRole('admin', 'editor'), async (req: AuthRequest, res) => {
    try {
      const sqlConfig = await getSQLWarehouseConfig(req.user!.id);
      
      // Use hardcoded defaults - do not accept user input to prevent SQL injection
      // In production, store these in organization configuration
      const volumePath = "uc_dev_edap_platform_01.edap_monitoring_de.edap_status_monitoring_vol";
      const catalogSchema = "uc_dev_edap_platform_01.edap_monitoring_de";
      
      const statusConfig: StatusPageConfig = {
        workspaceUrl: sqlConfig.workspaceUrl,
        warehouseId: sqlConfig.warehouseId,
        token: sqlConfig.token,
        volumePath,
        catalogSchema,
      };
      
      const results = await runStatusScraper(statusConfig);
      
      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "run_status_scraper",
        resourceType: "system",
        resourceId: 0,
        diffJson: results,
      });
      
      res.json({
        success: true,
        message: "Status scraper completed successfully",
        results,
      });
    } catch (error) {
      console.error("Status scraper error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to run status scraper" });
    }
  });

  app.get("/api/status-incidents", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const sqlConfig = await getSQLWarehouseConfig(req.user!.id);
      // Use hardcoded catalog schema to prevent SQL injection
      const catalogSchema = "uc_dev_edap_platform_01.edap_monitoring_de";
      
      // Query platform_status_events Delta table
      const query = `
        SELECT 
          incident_id,
          source_system,
          incident_type,
          severity,
          status,
          title,
          description,
          affected_services,
          affected_regions,
          start_time,
          end_time,
          last_update_time,
          source_url
        FROM ${catalogSchema}.platform_status_events
        WHERE status != 'resolved'
          OR last_update_time >= CURRENT_TIMESTAMP() - INTERVAL 7 DAYS
        ORDER BY start_time DESC
        LIMIT 100
      `;
      
      const incidents = await executeSQLQuery(query, sqlConfig);
      
      res.json({ incidents });
    } catch (error) {
      console.error("Get status incidents error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get status incidents" });
    }
  });

  // Get dashboard metrics from Databricks system catalog
  app.get("/api/dashboard/metrics", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const sqlConfig = await getSQLWarehouseConfig(req.user!.id);
      
      // Get job statistics (last 7 days)
      const jobStatsQuery = `
        SELECT 
          COUNT(DISTINCT run_id) as total_runs,
          COUNT(DISTINCT CASE WHEN result_state = 'SUCCESS' THEN run_id END) as successful_runs,
          COUNT(DISTINCT CASE WHEN result_state = 'FAILED' THEN run_id END) as failed_runs,
          COUNT(DISTINCT CASE WHEN result_state IN ('RUNNING', 'PENDING') THEN run_id END) as running_runs,
          COUNT(DISTINCT job_id) as total_jobs
        FROM system.lakeflow.job_run_timeline
        WHERE period_start_time >= CURRENT_TIMESTAMP() - INTERVAL 7 DAYS
      `;
      
      const jobStats = await executeSQLQuery(jobStatsQuery, sqlConfig);
      const stats = jobStats[0] || {};
      
      // Parse string values to numbers (Databricks returns strings)
      const totalJobs = parseInt(stats.total_jobs) || 0;
      const runningJobs = parseInt(stats.running_runs) || 0;
      const failedJobs = parseInt(stats.failed_runs) || 0;
      const successfulRuns = parseInt(stats.successful_runs) || 0;
      
      // Calculate success rate
      const totalCompleted = successfulRuns + failedJobs;
      const successRate = totalCompleted > 0 
        ? Math.round((successfulRuns / totalCompleted) * 100) 
        : 0;
      
      // Get cluster count
      const clusterQuery = `
        SELECT COUNT(DISTINCT cluster_id) as total_clusters
        FROM system.compute.clusters
        WHERE change_time >= CURRENT_TIMESTAMP() - INTERVAL 7 DAYS
      `;
      const clusterStats = await executeSQLQuery(clusterQuery, sqlConfig);
      const totalClusters = parseInt(clusterStats[0]?.total_clusters) || 0;
      
      // Get active pipelines count from system.lakeflow.pipelines
      // Count all pipelines modified/active in the last 30 days
      const pipelinesQuery = `
        SELECT COUNT(DISTINCT pipeline_id) as pipeline_count
        FROM system.lakeflow.pipelines
        WHERE change_time >= CURRENT_TIMESTAMP() - INTERVAL 30 DAYS
          AND delete_time IS NULL
      `;
      const pipelinesStats = await executeSQLQuery(pipelinesQuery, sqlConfig);
      const pipelinesCount = parseInt(pipelinesStats[0]?.pipeline_count) || 0;
      
      // Get recent activity (last 10 job runs)
      const recentActivityQuery = `
        SELECT 
          job_id,
          run_id,
          run_name,
          result_state,
          period_end_time,
          termination_code
        FROM system.lakeflow.job_run_timeline
        WHERE period_end_time >= CURRENT_TIMESTAMP() - INTERVAL 1 DAY
          AND result_state IN ('SUCCESS', 'FAILED')
        ORDER BY period_end_time DESC
        LIMIT 10
      `;
      const recentActivity = await executeSQLQuery(recentActivityQuery, sqlConfig);
      
      // Calculate system health (30 days)
      // Based on job success rate - percentage of successful vs non-successful job runs
      const healthQuery = `
        SELECT 
          COUNT(DISTINCT CASE WHEN result_state = 'SUCCESS' THEN run_id END) as successful_runs_30d,
          COUNT(DISTINCT CASE WHEN result_state IN ('SUCCESS', 'FAILED', 'CANCELED', 'TIMEDOUT') THEN run_id END) as total_terminal_30d
        FROM system.lakeflow.job_run_timeline
        WHERE period_start_time >= CURRENT_TIMESTAMP() - INTERVAL 30 DAYS
      `;
      const healthStats = await executeSQLQuery(healthQuery, sqlConfig);
      const successful30d = parseInt(healthStats[0]?.successful_runs_30d) || 0;
      const totalTerminal30d = parseInt(healthStats[0]?.total_terminal_30d) || 0;
      
      // Calculate system health as job success rate over 30 days
      const systemHealth = totalTerminal30d > 0 
        ? parseFloat(((successful30d / totalTerminal30d) * 100).toFixed(1))
        : 0;
      
      res.json({
        jobs: {
          total: totalJobs,
          running: runningJobs,
          failed: failedJobs,
          success_rate: successRate,
        },
        clusters: {
          total: totalClusters,
        },
        workflows: {
          count: pipelinesCount,
        },
        system_health: systemHealth,
        recent_activity: recentActivity,
      });
    } catch (error) {
      console.error("Get dashboard metrics error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get dashboard metrics" });
    }
  });

  // Get failed jobs for RCA Dashboard
  app.get("/api/rca/failed-jobs", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const sqlConfig = await getSQLWarehouseConfig(req.user!.id);
      const limit = parseInt(req.query.limit as string) || 50;
      
      // Query job_run_timeline for recent failed jobs
      const query = `
        SELECT 
          job_id,
          run_id,
          run_name,
          period_start_time,
          period_end_time,
          result_state,
          termination_code,
          trigger_type,
          compute_ids
        FROM system.lakeflow.job_run_timeline
        WHERE result_state = 'FAILED'
        ORDER BY period_end_time DESC
        LIMIT ${limit}
      `;
      
      const failedJobs = await executeSQLQuery(query, sqlConfig);
      
      res.json({ jobs: failedJobs });
    } catch (error) {
      console.error("Get failed jobs error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get failed jobs" });
    }
  });

  // Get RCA analysis progress
  app.get("/api/rca/analyze/progress/:runId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { runId } = req.params;
      const { getAnalysisProgress } = await import("./utils/ai-rca");
      const progress = getAnalysisProgress(runId);
      res.json(progress);
    } catch (error) {
      console.error("Get RCA progress error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get progress" });
    }
  });

  // AI-Powered RCA route with internet research
  app.post("/api/rca/analyze", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { runId } = req.body;
      
      if (!runId) {
        return res.status(400).json({ error: "runId is required" });
      }
      
      const sqlConfig = await getSQLWarehouseConfig(req.user!.id);
      const aiConfig = await getDatabricksConfig(req.user!.id);
      
      console.log(`Starting AI-powered RCA for job run ${runId}...`);
      
      // 1. Get job failure details
      const jobQuery = `
        SELECT 
          job_id,
          run_id,
          run_name,
          period_start_time,
          period_end_time,
          result_state,
          termination_code,
          trigger_type,
          compute_ids
        FROM system.lakeflow.job_run_timeline
        WHERE run_id = '${runId.replace(/'/g, "''")}'
          AND result_state = 'FAILED'
        LIMIT 1
      `;
      
      const jobResults = await executeSQLQuery(jobQuery, sqlConfig);
      
      if (jobResults.length === 0) {
        return res.status(404).json({ error: `Job run ${runId} not found or did not fail` });
      }
      
      const jobFailure = jobResults[0];
      console.log(`Found failed job: ${jobFailure.job_id} - ${jobFailure.run_name}`);
      
      // 2. Get cluster information
      let clusterInfo = null;
      if (jobFailure.compute_ids && jobFailure.compute_ids.length > 0) {
        const clusterQuery = `
          SELECT 
            cluster_id,
            cluster_name,
            owned_by,
            change_time
          FROM system.compute.clusters
          WHERE cluster_id = '${jobFailure.compute_ids[0].replace(/'/g, "''")}'
          ORDER BY change_time DESC
          LIMIT 1
        `;
        const clusterResults = await executeSQLQuery(clusterQuery, sqlConfig);
        clusterInfo = clusterResults[0] || null;
      }
      
      // 3. Get audit logs for errors
      const auditQuery = `
        SELECT 
          event_time,
          user_identity.email as user_email,
          service_name,
          action_name,
          request_id,
          response.status_code as status_code,
          response.error_message as error_message
        FROM system.access.audit
        WHERE event_time >= TIMESTAMP '${jobFailure.period_start_time}' - INTERVAL 5 MINUTES
          AND event_time <= TIMESTAMP '${jobFailure.period_end_time}' + INTERVAL 5 MINUTES
          AND response.status_code >= 400
        ORDER BY event_time DESC
        LIMIT 20
      `;
      const auditLogs = await executeSQLQuery(auditQuery, sqlConfig);
      
      // 4. Get task run logs with Spark errors
      const { getTaskRunLogs } = await import('./utils/databricks-sql');
      const { parseSparkErrors, formatSparkErrorsForAI } = await import('./utils/spark-log-parser');
      
      let sparkErrors: any[] = [];
      let formattedSparkErrors = '';
      try {
        const taskLogs = await getTaskRunLogs(sqlConfig, runId);
        sparkErrors = parseSparkErrors(taskLogs);
        formattedSparkErrors = formatSparkErrorsForAI(sparkErrors);
        console.log(`Parsed ${sparkErrors.length} Spark errors from task logs`);
      } catch (error) {
        console.warn('Failed to fetch/parse Spark logs:', error);
        formattedSparkErrors = 'Unable to retrieve Spark error logs';
      }
      
      // 5. Perform AI-powered RCA with internet research
      const { performAIRootCauseAnalysis } = await import('./utils/ai-rca');
      const rcaResult = await performAIRootCauseAnalysis(
        jobFailure,
        clusterInfo,
        auditLogs,
        formattedSparkErrors,
        aiConfig.token,
        aiConfig.baseUrl,
        aiConfig.endpointName
      );
      
      await storage.createAuditLog({
        actorId: req.user!.id,
        action: "rca_analysis",
        resourceType: "job_run",
        resourceId: 0,
        diffJson: { runId, confidence: rcaResult.confidence },
      });
      
      res.json({
        job_failure: jobFailure,
        cluster_info: clusterInfo,
        audit_logs: auditLogs,
        rca_analysis: rcaResult,
        likely_root_cause: rcaResult.likely_root_cause,
        confidence: rcaResult.confidence,
      });
    } catch (error) {
      console.error("RCA analysis error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to analyze job failure" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
