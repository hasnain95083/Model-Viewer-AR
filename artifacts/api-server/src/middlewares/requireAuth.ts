import { Request, Response, NextFunction } from "express";
import { verifyToken, COOKIE_NAME_EXPORT } from "../lib/auth.js";

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.[COOKIE_NAME_EXPORT];
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }
  req.user = payload;
  next();
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[COOKIE_NAME_EXPORT];
  if (token) {
    const payload = verifyToken(token);
    if (payload) req.user = payload;
  }
  next();
}
