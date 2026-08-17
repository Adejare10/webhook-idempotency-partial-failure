import { Database } from "../src/storage/database";
import { PaymentService } from "../src/payments/paymentService";
import { WebhookProcessor } from "../src/webhook/webhookProcessor";

describe("Webhook concurrency", () => {
  it("processes a duplicate event only once", async () => {
    const db = new Database();
    const paymentService = new PaymentService(db);

    let createPaymentCalls = 0;

    const originalCreatePayment =
      paymentService.createPayment.bind(
        paymentService
      );

    jest
      .spyOn(paymentService, "createPayment")
      .mockImplementation((payload) => {
        createPaymentCalls += 1;

        return originalCreatePayment(payload);
      });

    const processor = new WebhookProcessor(
      db,
      paymentService
    );

    const event = {
      eventId: "evt_concurrent_001",
      type: "payment.created" as const,
      createdAt: "2026-08-17T14:00:00.000Z",
      payload: {
        paymentId: "pay_concurrent_001",
        amount: 50000,
        currency: "NGN",
      },
    };

    await Promise.all([
      processor.process(event),
      processor.process(event),
    ]);

    expect(createPaymentCalls).toBe(1);

    expect(
      db.getWebhookEvent(
        "evt_concurrent_001"
      )?.status
    ).toBe("processed");

    expect(
      db.listPayments()
    ).toHaveLength(1);
  });
});