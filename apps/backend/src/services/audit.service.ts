import { pool } from "../lib/db.js";
import type { Request } from "express";
import type { PoolClient } from "pg";

export async function logAuditEvent(
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  beforeState: unknown = null,
  afterState: unknown = null,
  req?: Request,
  client?: Pick<PoolClient, "query">,
) {
  const ipAddress = req?.ip || req?.socket?.remoteAddress || null;
  const userAgent = req?.headers["user-agent"] || null;

  try {
    await (client ?? pool).query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, before_state, after_state, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        action,
        entityType,
        entityId,
        beforeState ? JSON.stringify(beforeState) : null,
        afterState ? JSON.stringify(afterState) : null,
        ipAddress,
        userAgent,
      ],
    );
  } catch (error) {
    if (client) throw error;
    console.error("Failed to log audit event:", error);
  }
}
