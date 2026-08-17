# Webhook Idempotency and Partial-Failure Recovery

You are working on a small TypeScript payment webhook service.

Webhook providers may deliver the same event multiple times because of retries, timeouts, network failures, or concurrent delivery. The current implementation is not fully safe in these situations.

Your task is to improve the webhook processing implementation so that webhook delivery is idempotent and side effects remain consistent.

## Required behavior

### 1. Duplicate delivery

Processing the same webhook event more than once must not apply its payment side effect more than once.

For example, processing the same `payment.created` event repeatedly must not create multiple payment records or otherwise repeat the business side effect.

### 2. Concurrent delivery

Two calls processing the same event concurrently must not both perform the side effect.

The implementation must provide correct behavior even when the two calls reach the processor at approximately the same time.

### 3. Retry after a genuine processing failure

If processing an event fails before its business side effect succeeds, the event must remain retryable.

A later delivery should be able to process the event successfully.

### 4. Partial failure after the side effect

The processor may successfully perform the payment side effect and then fail while recording the webhook's final processing state.

A later retry must not perform the payment side effect again.

This requirement is especially important: webhook completion state and business side effects can fail at different points in the processing flow.

### 5. Generality

Do not special-case the event IDs, payment IDs, or values used by the tests.

The behavior must work for arbitrary valid webhook events.

### 6. Existing behavior

Preserve the existing payment behavior:

- `payment.created` creates a payment when it does not already exist.
- `payment.completed` completes an existing payment.
- `payment.refunded` refunds an existing payment.
- Invalid payment transitions should continue to fail appropriately.
- Unsupported webhook event types should continue to be rejected.

## Constraints

Keep the implementation within the existing TypeScript project structure unless a change is necessary.

Do not remove or weaken existing tests.

Do not hard-code expected test values or event identifiers.

The solution should address the underlying idempotency and consistency problem rather than only making an individual test pass.

## Completion criteria

The implementation is complete when the project builds successfully and the complete test suite passes while preserving the required webhook, payment, retry, concurrency, and partial-failure behavior described above.