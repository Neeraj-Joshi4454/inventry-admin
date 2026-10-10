export type UserRole =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'MANAGER'
  | 'STORE_KEEPER'
  | 'SALES_PERSON'
  | 'ACCOUNTANT';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  tenantId: string | null;
  mustChangePassword: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  mobileNumber: string;
  role: UserRole;
  tenant: { id: string; name: string } | null;
}
