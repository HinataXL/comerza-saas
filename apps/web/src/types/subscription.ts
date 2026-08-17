export type PlanCode = "PRO" | "PREMIUM";

export type SubscriptionStatus =
  | "PENDING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "FAILED"
  | "EXPIRED"
  | "PENDING_CONFIRMATION";

export type TenantStatus =
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "SUSPENDED"
  | "CANCELLED";

export interface CreateSubscriptionCheckoutRequest {
  planCode: PlanCode;
  commerceName: string;
  responsibleName: string;
  email: string;
  phone: string;
  nit?: string;
}

export interface CreateSubscriptionCheckoutResponse {
  tenantId: string;
  subscriptionId: string;
  status: SubscriptionStatus;
  checkoutUrl: string;
}
