import { db, DB_ENABLED } from "./db";
import { organizations, users, pages, widgets, tools } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  if (!DB_ENABLED) {
    console.log("Skipping database seed (running in Streamlit mode - no database)");
    return;
  }

  if (!db) {
    console.log("Skipping database seed (database not initialized)");
    return;
  }

  console.log("Starting database seed...");

  try {
    const passwordHash = await bcrypt.hash("admin123", 10);

    const [org] = await db.insert(organizations).values({
      name: "Demo Organization",
      tenantId: "demo-org-001",
    }).returning();

    console.log("Created organization:", org.name);

    const [adminUser] = await db.insert(users).values({
      email: "admin@demo.com",
      passwordHash,
      role: "admin",
      orgId: org.id,
      metadata: { firstName: "Admin", lastName: "User" },
    }).returning();

    console.log("Created admin user:", adminUser.email);

    const [editorUser] = await db.insert(users).values({
      email: "editor@demo.com",
      passwordHash: await bcrypt.hash("editor123", 10),
      role: "editor",
      orgId: org.id,
      metadata: { firstName: "Editor", lastName: "User" },
    }).returning();

    console.log("Created editor user:", editorUser.email);

    const [viewerUser] = await db.insert(users).values({
      email: "viewer@demo.com",
      passwordHash: await bcrypt.hash("viewer123", 10),
      role: "viewer",
      orgId: org.id,
      metadata: { firstName: "Viewer", lastName: "User" },
    }).returning();

    console.log("Created viewer user:", viewerUser.email);

    const [dashboardPage] = await db.insert(pages).values({
      orgId: org.id,
      name: "Main Dashboard",
      slug: "main-dashboard",
      status: "published",
      layoutJson: {
        rows: [
          {
            id: "row-1",
            columns: [
              { id: "col-1-1", width: 6, widgetId: "widget-1" },
              { id: "col-1-2", width: 6, widgetId: "widget-2" },
            ],
          },
          {
            id: "row-2",
            columns: [
              { id: "col-2-1", width: 12, widgetId: "widget-3" },
            ],
          },
        ],
      },
      version: 1,
      createdBy: adminUser.id,
    }).returning();

    console.log("Created dashboard page:", dashboardPage.name);

    await db.insert(widgets).values([
      {
        pageId: dashboardPage.id,
        type: "metric",
        propsJson: {
          title: "Total Users",
          value: 1247,
          change: 12.5,
          trend: "up",
        },
        positionJson: { row: 0, col: 0 },
      },
      {
        pageId: dashboardPage.id,
        type: "metric",
        propsJson: {
          title: "Active Sessions",
          value: 342,
          change: -5.2,
          trend: "down",
        },
        positionJson: { row: 0, col: 1 },
      },
      {
        pageId: dashboardPage.id,
        type: "chart",
        propsJson: {
          title: "User Growth",
          chartType: "area",
          data: [
            { name: "Jan", value: 400 },
            { name: "Feb", value: 600 },
            { name: "Mar", value: 800 },
            { name: "Apr", value: 1000 },
            { name: "May", value: 1200 },
          ],
        },
        positionJson: { row: 1, col: 0 },
      },
    ]);

    console.log("Created widgets for dashboard");

    const [databricksTool] = await db.insert(tools).values({
      orgId: org.id,
      name: "Databricks",
      type: "data_warehouse",
      baseUrl: "https://adb-123456.azuredatabricks.net",
      authType: "bearer",
      configJson: {
        workspace: "production",
        cluster: "analytics-cluster",
      },
    }).returning();

    console.log("Created Databricks tool:", databricksTool.name);

    await db.insert(tools).values([
      {
        orgId: org.id,
        name: "ServiceNow",
        type: "ticketing",
        baseUrl: "https://demo.service-now.com",
        authType: "basic",
        configJson: {
          instance: "demo",
        },
      },
      {
        orgId: org.id,
        name: "Salesforce",
        type: "crm",
        baseUrl: "https://demo.salesforce.com",
        authType: "oauth2",
        configJson: {
          instanceUrl: "https://demo.salesforce.com",
        },
      },
    ]);

    console.log("Created additional tools");

    console.log("\n✅ Seed completed successfully!");
    console.log("\nDemo accounts:");
    console.log("  Admin:  admin@demo.com / admin123");
    console.log("  Editor: editor@demo.com / editor123");
    console.log("  Viewer: viewer@demo.com / viewer123");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
