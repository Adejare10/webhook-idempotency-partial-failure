import { Database } from "../src/storage/database";
import { Payment } from "../src/events/eventTypes";

describe("Database", () => {
  let db: Database;

  beforeEach(() => {
    db = new Database();
  });

  describe("payments", () => {
    it("saves and retrieves a payment", () => {
      const payment: Payment = {
        paymentId: "pay_001",
        amount: 50000,
        currency: "NGN",
        status: "created",
      };

      db.savePayment(payment);

      expect(
        db.getPayment("pay_001")
      ).toEqual(payment);
    });

    it("returns undefined for an unknown payment", () => {
      expect(
        db.getPayment("does-not-exist")
      ).toBeUndefined();
    });

    it("lists stored payments", () => {
      db.savePayment({
        paymentId: "pay_001",
        amount: 50000,
        currency: "NGN",
        status: "created",
      });

      db.savePayment({
        paymentId: "pay_002",
        amount: 75000,
        currency: "NGN",
        status: "completed",
      });

      expect(db.listPayments()).toHaveLength(2);
    });
  });

  describe("webhook events", () => {
    it("saves and retrieves webhook events", () => {
      db.saveWebhookEvent({
        eventId: "evt_001",
        type: "payment.created",
        status: "processing",
      });

      expect(
        db.getWebhookEvent("evt_001")
      ).toEqual({
        eventId: "evt_001",
        type: "payment.created",
        status: "processing",
      });
    });

    it("updates an existing webhook event", () => {
      db.saveWebhookEvent({
        eventId: "evt_002",
        type: "payment.created",
        status: "processing",
      });

      db.saveWebhookEvent({
        eventId: "evt_002",
        type: "payment.created",
        status: "processed",
        processedAt: "2026-08-17T12:00:00.000Z",
      });

      const event =
        db.getWebhookEvent("evt_002");

      expect(event?.status).toBe("processed");
      expect(event?.processedAt).toBe(
        "2026-08-17T12:00:00.000Z"
      );
    });

    it("lists webhook events", () => {
      db.saveWebhookEvent({
        eventId: "evt_001",
        type: "payment.created",
        status: "processed",
      });

      db.saveWebhookEvent({
        eventId: "evt_002",
        type: "payment.completed",
        status: "processed",
      });

      expect(
        db.listWebhookEvents()
      ).toHaveLength(2);
    });

    it("claims a new webhook event", () => {
  const claimed =
    db.claimWebhookEvent({
      eventId: "evt_claim_001",
      type: "payment.created",
      status: "processing",
    });

  expect(claimed).toBe(true);

  expect(
    db.getWebhookEvent(
      "evt_claim_001"
    )?.status
  ).toBe("processing");
});

it("rejects a second claim for the same event", () => {
  const event = {
    eventId: "evt_claim_002",
    type: "payment.created" as const,
    status: "processing" as const,
  };

  expect(
    db.claimWebhookEvent(event)
  ).toBe(true);

  expect(
    db.claimWebhookEvent(event)
  ).toBe(false);
  });

  it("allows a failed webhook event to be reclaimed", () => {
  const failedEvent = {
    eventId: "evt_retry_claim_001",
    type: "payment.created" as const,
    status: "failed" as const,
    failedAt: "2026-08-17T14:00:00.000Z",
  };

  db.saveWebhookEvent(failedEvent);

  const reclaimed =
    db.claimWebhookEvent({
      eventId: failedEvent.eventId,
      type: failedEvent.type,
      status: "processing",
    });

  expect(reclaimed).toBe(true);

  expect(
    db.getWebhookEvent(
      failedEvent.eventId
    )?.status
  ).toBe("processing");
});

it("does not reclaim a processed webhook event", () => {
  const processedEvent = {
    eventId: "evt_processed_claim_001",
    type: "payment.created" as const,
    status: "processed" as const,
    processedAt: "2026-08-17T14:00:00.000Z",
  };

  db.saveWebhookEvent(processedEvent);

  const reclaimed =
    db.claimWebhookEvent({
      eventId: processedEvent.eventId,
      type: processedEvent.type,
      status: "processing",
    });

  expect(reclaimed).toBe(false);

  expect(
    db.getWebhookEvent(
      processedEvent.eventId
    )?.status
  ).toBe("processed");
});
});

  describe("reset", () => {
    it("clears payments and webhook events", () => {
      db.savePayment({
        paymentId: "pay_001",
        amount: 50000,
        currency: "NGN",
        status: "created",
      });

      db.saveWebhookEvent({
        eventId: "evt_001",
        type: "payment.created",
        status: "processed",
      });

      db.clear();

      expect(db.listPayments()).toHaveLength(0);
      expect(
        db.listWebhookEvents()
      ).toHaveLength(0);
    });
  });
});