import { Database } from "../src/storage/database";
import { PaymentService } from "../src/payments/paymentService";
import { WebhookProcessor } from "../src/webhook/webhookProcessor";

describe("Webhook retry behavior", () => {
  it("allows a failed webhook to be retried", async () => {
    const db = new Database();
    const paymentService = new PaymentService(db);

    const processor = new WebhookProcessor(
      db,
      paymentService
    );

    const event = {
      eventId: "evt_retry_001",
      type: "payment.created" as const,
      createdAt: "2026-08-17T14:00:00.000Z",
      payload: {
        paymentId: "pay_retry_001",
        amount: 75000,
        currency: "NGN",
      },
    };

    const originalCreatePayment =
      paymentService.createPayment.bind(
        paymentService
      );

    const createPayment =
      jest.spyOn(
        paymentService,
        "createPayment"
      );

    createPayment
      .mockImplementationOnce(() => {
        throw new Error(
          "Temporary payment failure"
        );
      })
      .mockImplementationOnce((payload) => {
        return originalCreatePayment(payload);
      });

    await expect(
      processor.process(event)
    ).rejects.toThrow(
      "Temporary payment failure"
    );

    expect(
      db.getWebhookEvent(
        "evt_retry_001"
      )?.status
    ).toBe("failed");

    await processor.process(event);

    expect(
      db.getWebhookEvent(
        "evt_retry_001"
      )?.status
    ).toBe("processed");

    expect(
      db.getPayment("pay_retry_001")
    ).toBeDefined();
  });
});