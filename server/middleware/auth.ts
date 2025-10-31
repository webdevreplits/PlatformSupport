import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import type { User } from "@shared/schema";
import { DB_ENABLED } from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

export interface AuthRequest extends Request {
  user?: User;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  // Skip authentication in streamlit mode (no database)
  if (!DB_ENABLED) {
    // Create a mock user for streamlit mode
    req.user = {
      id: 1,
      email: "databricks-user@streamlit.app",
      passwordHash: "",
      role: "admin",
      orgId: 1,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    storage.getUser(decoded.userId).then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Invalid token" });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Skip role check in streamlit mode
    if (!DB_ENABLED) {
      return next();
    }

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
