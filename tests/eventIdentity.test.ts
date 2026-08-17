import { Database } from "../src/storage/database";
import { PaymentService } from "../src/payments/paymentService";
import { WebhookProcessor } from "../src/webhook/webhookProcessor";

describe("Webhook event identity", () => {
  it("tracks different event IDs independently", async () => {
    const db = new Database();
    const paymentService = new PaymentService(db);

    const processor = new WebhookProcessor(
      db,
      paymentService
    );

    const event1 = {
      eventId: "evt_identity_001",
      type: "payment.created" as const,
      createdAt: "2026-08-17T14:00:00.000Z",
      payload: {
        paymentId: "pay_identity_001",
        amount: 50000,
        currency: "NGN",
      },
    };

    const event2 = {
      eventId: "evt_identity_002",
      type: "payment.created" as const,
      createdAt: "2026-08-17T14:01:00.000Z",
      payload: {
        paymentId: "pay_identity_001",
        amount: 50000,
        currency: "NGN",
      },
    };

    await processor.process(event1);
    await processor.process(event2);

    expect(
      db.getWebhookEvent("evt_identity_001")
        ?.status
    ).toBe("processed");

    expect(
      db.getWebhookEvent("evt_identity_002")
        ?.status
    ).toBe("processed");

    expect(
      db.listPayments()
    ).toHaveLength(1);
  });
});