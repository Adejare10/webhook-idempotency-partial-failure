import {
  Payment,
  WebhookEvent,
} from "../events/eventTypes";

export type WebhookEventStatus =
  | "processing"
  | "processed"
  | "failed";

export interface StoredWebhookEvent {
  eventId: string;
  type: string;
  status:
    | "processing"
    | "processed"
    | "failed";
  processedAt?: string;
  failedAt?: string;
}

export class Database {
  private readonly payments = new Map<string, Payment>();
  private readonly webhookEvents = new Map<string, StoredWebhookEvent>();

  // -------------------------
  // Payment methods
  // -------------------------

  getPayment(paymentId: string): Payment | undefined {
    const payment = this.payments.get(paymentId);

    if (!payment) {
      return undefined;
    }

    return { ...payment };
  }

  savePayment(payment: Payment): void {
    this.payments.set(payment.paymentId, {
      ...payment,
    });
  }

  listPayments(): Payment[] {
    return Array.from(this.payments.values()).map((payment) => ({
      ...payment,
    }));
  }

  // -------------------------
  // Webhook event methods
  // -------------------------

  getWebhookEvent(
    eventId: string
  ): StoredWebhookEvent | undefined {
    const event = this.webhookEvents.get(eventId);

    if (!event) {
      return undefined;
    }

    return { ...event };
  }

  claimWebhookEvent(
  event: StoredWebhookEvent
): boolean {
  const existing =
    this.webhookEvents.get(event.eventId);

  if (
    existing &&
    existing.status !== "failed"
  ) {
    return false;
  }

  this.webhookEvents.set(event.eventId, {
    ...event,
  });

  return true;
}
  saveWebhookEvent(
    event: StoredWebhookEvent
  ): void {
    this.webhookEvents.set(event.eventId, {
      ...event,
    });
  }

  listWebhookEvents(): StoredWebhookEvent[] {
    return Array.from(
      this.webhookEvents.values()
    ).map((event) => ({
      ...event,
    }));
  }

  // -------------------------
  // Reset
  // -------------------------

  clear(): void {
    this.payments.clear();
    this.webhookEvents.clear();
  }
}