export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** A self-service business sign-up from the mobile app's Register screen. */
export interface RegistrationRequest {
  _id: string;
  businessName: string;
  ownerName: string;
  mobileNumber: string;
  email?: string;
  status: RegistrationStatus;
  rejectionReason?: string;
  reviewedBy?: { _id: string; name: string } | null;
  reviewedAt?: string;
  tenantId?: string;
  createdAt: string;
}
