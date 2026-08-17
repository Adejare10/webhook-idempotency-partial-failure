import { Database } from "../src/storage/database";
import { PaymentService } from "../src/payments/paymentService";

describe("PaymentService", () => {
  let db: Database;
  let paymentService: PaymentService;

  beforeEach(() => {
    db = new Database();
    paymentService = new PaymentService(db);
  });

  describe("createPayment", () => {
    it("creates a new payment", () => {
      const payment = paymentService.createPayment({
        paymentId: "pay_001",
        amount: 50000,
        currency: "NGN",
      });

      expect(payment).toEqual({
        paymentId: "pay_001",
        amount: 50000,
        currency: "NGN",
        status: "created",
      });
    });

    it("does not create duplicate payments", () => {
      const payload = {
        paymentId: "pay_002",
        amount: 75000,
        currency: "NGN",
      };

      const first =
        paymentService.createPayment(payload);

      const second =
        paymentService.createPayment(payload);

      expect(second).toEqual(first);
      expect(db.listPayments()).toHaveLength(1);
    });
  });

  describe("completePayment", () => {
    it("completes an existing payment", () => {
      paymentService.createPayment({
        paymentId: "pay_003",
        amount: 100000,
        currency: "NGN",
      });

      const payment =
        paymentService.completePayment({
          paymentId: "pay_003",
          amount: 100000,
          currency: "NGN",
        });

      expect(payment.status).toBe("completed");
    });

    it("rejects completion of an unknown payment", () => {
      expect(() =>
        paymentService.completePayment({
          paymentId: "unknown",
          amount: 10000,
          currency: "NGN",
        })
      ).toThrow(
        "Payment unknown does not exist"
      );
    });
  });

  describe("refundPayment", () => {
    it("refunds an existing payment", () => {
      paymentService.createPayment({
        paymentId: "pay_004",
        amount: 25000,
        currency: "NGN",
      });

      const payment =
        paymentService.refundPayment({
          paymentId: "pay_004",
          amount: 25000,
          currency: "NGN",
        });

      expect(payment.status).toBe("refunded");
    });

    it("rejects refund of an unknown payment", () => {
      expect(() =>
        paymentService.refundPayment({
          paymentId: "unknown",
          amount: 10000,
          currency: "NGN",
        })
      ).toThrow(
        "Payment unknown does not exist"
      );
    });
  });
});