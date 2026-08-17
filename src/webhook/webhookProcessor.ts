import { WebhookEvent } from "../events/eventTypes";
import {
  Database,
  StoredWebhookEvent,
} from "../storage/database";
import { PaymentService } from "../payments/paymentService";

export class WebhookProcessor {
  constructor(
    private readonly db: Database,
    private readonly paymentService: PaymentService,
    private readonly beforeProcess?: () => Promise<void>
  ) {}

  async process(
    event: WebhookEvent
  ): Promise<void> {
    const record: StoredWebhookEvent = {
      eventId: event.eventId,
      type: event.type,
      status: "processing",
    };

    const claimed =
      this.db.claimWebhookEvent(record);

    if (!claimed) {
      return;
    }

    if (this.beforeProcess) {
      await this.beforeProcess();
    }

    try {
      switch (event.type) {
        case "payment.created": {
          // If the payment already exists, the side effect
          // was completed by an earlier delivery. This can
          // happen when the payment was created successfully
          // but recording the webhook as processed failed.
          //
          // Do not invoke createPayment again.
          const existingPayment =
            this.db.getPayment(
              event.payload.paymentId
            );

          if (!existingPayment) {
            this.paymentService.createPayment(
              event.payload
            );
          }

          break;
        }

        case "payment.completed":
          this.paymentService.completePayment(
            event.payload
          );
          break;

        case "payment.refunded":
          this.paymentService.refundPayment(
            event.payload
          );
          break;

        default:
          throw new Error(
            `Unsupported event type: ${event.type}`
          );
      }

      this.db.saveWebhookEvent({
        ...record,
        status: "processed",
        processedAt:
          new Date().toISOString(),
      });
    } catch (error) {
      this.db.saveWebhookEvent({
        ...record,
        status: "failed",
        failedAt:
          new Date().toISOString(),
      });

      throw error;
    }
  }
}