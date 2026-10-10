import type { AccountStatus, UserRole } from './auth';

export interface BusinessUser {
  _id: string;
  name: string;
  mobileNumber: string;
  role: UserRole;
  status: AccountStatus;
  tenantId: string | null;
  mustChangePassword: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}
