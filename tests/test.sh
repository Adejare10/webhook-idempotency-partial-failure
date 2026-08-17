#!/usr/bin/env bash

set -u

echo "========================================"
echo "Webhook Idempotency Odyssey Verifier"
echo "========================================"

FAILURES=0

echo
echo "[1/3] Building TypeScript project..."

if ! npm run build; then
    echo "BUILD FAILED"
    exit 1
fi

echo "BUILD PASSED"

echo
echo "[2/3] Running regression test suite..."

if npm test -- --runInBand; then
    echo "REGRESSION TESTS PASSED"
else
    echo "REGRESSION TESTS FAILED"
    FAILURES=$((FAILURES + 1))
fi

echo
echo "[3/3] Running Odyssey idempotency checks..."

# The held-out verifier is supplied separately by the Odyssey
# grading environment. It is intentionally not part of the
# candidate-visible development test suite.

if [ -x "/opt/odyssey/verify-webhook-idempotency.sh" ]; then
    if /opt/odyssey/verify-webhook-idempotency.sh; then
        echo "HELD-OUT CHECKS PASSED"
    else
        echo "HELD-OUT CHECKS FAILED"
        FAILURES=$((FAILURES + 1))
    fi
else
    echo "HELD-OUT VERIFIER NOT PRESENT IN LOCAL DEVELOPMENT ENVIRONMENT"
fi

echo
echo "========================================"

if [ "$FAILURES" -eq 0 ]; then
    echo "VERIFICATION PASSED"
    exit 0
fi

echo "VERIFICATION FAILED"
exit 1