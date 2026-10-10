export interface AuditLog {
  _id: string;
  tenantId: string | null;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: { before?: unknown; after?: unknown };
  ipAddress?: string;
  createdAt: string;
}
