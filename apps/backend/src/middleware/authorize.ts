import type { Response, NextFunction } from "express";
import type { RequestWithAuth } from "./authenticate.js";
import type { UserRole } from "@shohojrin/shared";

export function requireRole(...roles: UserRole[]) {
  return (req: RequestWithAuth, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res
        .status(401)
        .json({ success: false, error: { message: "Authentication required" } });
    }
    if (!roles.includes(req.auth.role as UserRole)) {
      return res
        .status(403)
        .json({ success: false, error: { message: "Insufficient permissions" } });
    }
    return next();
  };
}

export function requireOwnership(getUserId: (req: RequestWithAuth) => string | null) {
  return (req: RequestWithAuth, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res
        .status(401)
        .json({ success: false, error: { message: "Authentication required" } });
    }
    const resourceUserId = getUserId(req);
    if (resourceUserId && resourceUserId !== req.auth.userId && req.auth.role !== "admin") {
      return res.status(403).json({ success: false, error: { message: "Access denied" } });
    }
    return next();
  };
}
