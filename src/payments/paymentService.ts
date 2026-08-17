import {
  Payment,
  PaymentPayload,
} from "../events/eventTypes";

import { Database } from "../storage/database";

export class PaymentService {
  constructor(
    private readonly db: Database
  ) {}

  createPayment(
    payload: PaymentPayload
  ): Payment {
    const existing =
      this.db.getPayment(payload.paymentId);

    if (existing) {
      return existing;
    }

    const payment: Payment = {
      paymentId: payload.paymentId,
      amount: payload.amount,
      currency: payload.currency,
      status: "created",
    };

    this.db.savePayment(payment);

    return payment;
  }

  completePayment(
    payload: PaymentPayload
  ): Payment {
    const existing =
      this.db.getPayment(payload.paymentId);

    if (!existing) {
      throw new Error(
        `Payment ${payload.paymentId} does not exist`
      );
    }

    const updated: Payment = {
      ...existing,
      status: "completed",
    };

    this.db.savePayment(updated);

    return updated;
  }

  refundPayment(
    payload: PaymentPayload
  ): Payment {
    const existing =
      this.db.getPayment(payload.paymentId);

    if (!existing) {
      throw new Error(
        `Payment ${payload.paymentId} does not exist`
      );
    }

    const updated: Payment = {
      ...existing,
      status: "refunded",
    };

    this.db.savePayment(updated);

    return updated;
  }
}