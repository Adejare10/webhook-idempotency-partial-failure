import { Database } from "../src/storage/database";
import { PaymentService } from "../src/payments/paymentService";
import { WebhookProcessor } from "../src/webhook/webhookProcessor";

describe("Webhook side-effect consistency", () => {
  it(
    "does not create a payment twice when completion persistence fails",
    async () => {
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

      const originalSaveWebhookEvent =
        db.saveWebhookEvent.bind(db);

      jest
        .spyOn(db, "saveWebhookEvent")
        .mockImplementation((record) => {
          if (record.status === "processed") {
            throw new Error(
              "Simulated webhook persistence failure"
            );
          }

          return originalSaveWebhookEvent(record);
        });

      const processor = new WebhookProcessor(
        db,
        paymentService
      );

      const event = {
        eventId: "evt_side_effect_001",
        type: "payment.created" as const,
        createdAt: "2026-08-17T14:00:00.000Z",
        payload: {
          paymentId: "pay_side_effect_001",
          amount: 100000,
          currency: "NGN",
        },
      };

      // First delivery:
      // payment is created, but persisting "processed"
      // fails.
      await expect(
        processor.process(event)
      ).rejects.toThrow(
        "Simulated webhook persistence failure"
      );

      expect(createPaymentCalls).toBe(1);

      expect(
        db.getPayment(
          "pay_side_effect_001"
        )
      ).toBeDefined();

      expect(
        db.getWebhookEvent(
          "evt_side_effect_001"
        )?.status
      ).toBe("failed");

      // Retry the same webhook.
      await expect(
        processor.process(event)
      ).rejects.toThrow(
        "Simulated webhook persistence failure"
      );

      // THIS IS CURRENTLY EXPECTED TO FAIL.
      // The starter implementation calls createPayment twice.
      expect(createPaymentCalls).toBe(1);
    }
  );
});