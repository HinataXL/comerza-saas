export interface SubscriptionGateway {
  createSubscriptionCheckout(
    request: SubscriptionCheckoutRequest
  ): Promise<SubscriptionCheckoutResponse>;
}

export interface SubscriptionCheckoutRequest {
  planCode: "PRO" | "PREMIUM";
  gatewayPlanId: string;
  amount: number;
  currency: "GTQ" | "USD";
  commerceName: string;
  responsibleName: string;
  email: string;
  phone: string;
  nit?: string;
  successUrl: string;
  cancelUrl: string;
  webhookUrl: string;
  metadata: Record<string, string>;
}

export interface SubscriptionCheckoutResponse {
  provider: "RECURRENTE";
  providerSubscriptionId?: string;
  providerCustomerId?: string;
  checkoutUrl: string;
  status: string;
  rawResponse: any;
}
