import type { AccountStatus } from './auth';

export interface TenantAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface Tenant {
  _id: string;
  businessName: string;
  businessType: string;
  ownerName: string;
  mobileNumber: string;
  email?: string;
  address?: TenantAddress;
  gstNumber?: string;
  status: AccountStatus;
  plan: 'FREE' | 'BASIC' | 'PRO';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantPayload {
  businessName: string;
  ownerName: string;
  businessMobileNumber: string;
  email?: string;
  gstNumber?: string;
  address?: TenantAddress;
  adminUser: {
    name: string;
    mobileNumber: string;
    password: string;
  };
}

export interface UpdateTenantPayload {
  businessName?: string;
  ownerName?: string;
  businessMobileNumber?: string;
  email?: string;
  gstNumber?: string;
  address?: TenantAddress;
}

export interface CreateTenantResult {
  tenant: Tenant;
  adminUser: {
    _id: string;
    name: string;
    mobileNumber: string;
    role: string;
    tenantId: string;
  };
}
