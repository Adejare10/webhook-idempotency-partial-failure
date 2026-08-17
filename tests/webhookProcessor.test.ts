import { Database } from "../src/storage/database";
import { PaymentService } from "../src/payments/paymentService";
import { WebhookProcessor } from "../src/webhook/webhookProcessor";

describe("WebhookProcessor", () => {
  let db: Database;
  let paymentService: PaymentService;
  let processor: WebhookProcessor;

  beforeEach(() => {
    db = new Database();
    paymentService = new PaymentService(db);
    processor = new WebhookProcessor(
      db,
      paymentService
    );
  });

  it("processes payment.created", async () => {
    await processor.process({
      eventId: "evt_001",
      type: "payment.created",
      createdAt: "2026-08-17T12:00:00.000Z",
      payload: {
        paymentId: "pay_001",
        amount: 50000,
        currency: "NGN",
      },
    });

    const payment =
      db.getPayment("pay_001");

    expect(payment).toBeDefined();
    expect(payment?.status).toBe("created");
  });

  it("marks webhook event processed", async () => {
    await processor.process({
      eventId: "evt_002",
      type: "payment.created",
      createdAt: "2026-08-17T12:00:00.000Z",
      payload: {
        paymentId: "pay_002",
        amount: 10000,
        currency: "NGN",
      },
    });

    const event =
      db.getWebhookEvent("evt_002");

    expect(event?.status).toBe("processed");
  });

  it("ignores already processed events", async () => {
    const event = {
      eventId: "evt_003",
      type: "payment.created" as const,
      createdAt: "2026-08-17T12:00:00.000Z",
      payload: {
        paymentId: "pay_003",
        amount: 15000,
        currency: "NGN",
      },
    };

    processor.process(event);
    processor.process(event);

    expect(
      db.listPayments()
    ).toHaveLength(1);
  });

  it("processes complete payment event", async () => {
    await processor.process({
      eventId: "evt_004",
      type: "payment.created",
      createdAt: "2026-08-17T12:00:00.000Z",
      payload: {
        paymentId: "pay_004",
        amount: 50000,
        currency: "NGN",
      },
    });

    await processor.process({
      eventId: "evt_005",
      type: "payment.completed",
      createdAt: "2026-08-17T12:00:00.000Z",
      payload: {
        paymentId: "pay_004",
        amount: 50000,
        currency: "NGN",
      },
    });

    expect(
      db.getPayment("pay_004")?.status
    ).toBe("completed");
  });
});