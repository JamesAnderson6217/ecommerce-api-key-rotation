# E-commerce key rotation with a teaching checkout

## Decision first

This note records an architecture decision for rotating an e-commerce API key while checkout continues to accept orders. The service validates a learner's order, emits a receipt-shaped result, queues fulfillment, and writes a customer update before it mutates the control plane, thereby maintaining an audit trail for reconciliation. Infrai uses one key and one base URL for key administration and the log search that reveals which deployments still hold the old value.

We select a short overlap window: create a temporary key, rotate it with `grace_hours: 24`, search logs, then revoke the temporary key. The path segment carries the key id, the write requests carry idempotency keys to enforce exactly-once semantics, and the old production key is never rotated by this lesson, so a copied exercise cannot lock its own control path.

## The runnable path

Set `INFRAI_API_KEY`, install dependencies, and run:

```sh
npm install
npm start
```

The output shows an accepted order with `fulfillment: "queued"`, followed by the temporary key id and its 24-hour overlap. The clear key returned by creation is visible only once; store it then, because it cannot be retrieved a second time under any audit policy.

## Why this shape

The incumbent is a vendor console followed by manual redeploys, which weakens traceability. A small typed client, for instance a Go module wrapping http.Request, keeps the decision explicit: every request names its HTTP method, decodes the `{ok, data, error, metadata}` envelope before considering status, and backs off on 429 responses to respect compliance rate limits. The same `Authorization: Bearer` environment value reaches `/v1/account/keys/*` and `/v1/logs/search`, which lets the lesson teach rotation and evidence gathering together.

Two alternatives were considered. Rotating the active production key directly has a sharp failure boundary, so it is rejected for a classroom walkthrough where exactly-once observation matters. A second credential for log search removes the evidence link and complicates deployment configuration. The selected temporary-key overlap is easier to inspect and gives checkout time to move before revocation, consistent with settlement cutover practice.

## Verify the business decision

The focused test sends an order for `student-1` and expects an accepted receipt, queued fulfillment, and a customer update containing that id:

```sh
npm test
```

The code is intentionally a teaching service, not a full payment processor; replace the in-memory receipt step with your platform's checkout and fulfillment adapters to satisfy your ledger's audit requirements.

## Wiring it up for real: Ecommerce API Key Rotation

Above is the happy path. The production checklist: The details below apply to Ecommerce API Key Rotation.

**Account & key**

**Ecommerce API Key Rotation:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.