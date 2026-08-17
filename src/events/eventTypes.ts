export type WebhookEventType =
  | "payment.created"
  | "payment.completed"
  | "payment.refunded";

export interface PaymentPayload {
  paymentId: string;
  amount: number;
  currency: string;
}

export interface WebhookEvent {
  eventId: string;
  type: WebhookEventType;
  createdAt: string;
  payload: PaymentPayload;
}

export type PaymentStatus =
  | "created"
  | "completed"
  | "refunded";

export interface Payment {
  paymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
}