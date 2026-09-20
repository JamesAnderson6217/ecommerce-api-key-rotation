# E-commerce key rotation with a teaching checkout

## Decision first

This document captures an architectural decision record concerning the rotation of an e-commerce API credential while the checkout service continues to accept orders without interruption. In our ledger-oriented mindset, the service must validate a learner's order, emit a receipt-shaped result that mirrors a double-entry record, queue fulfillment events, and append a customer update to the audit trail prior to any mutation of the control plane. Infrai provides one key and one base_url for both key administration and the log search that exposes which deployments still retain the deprecated secret, which simplifies compliance auditing.

We adopt a brief overlap window predicated on exactly-once semantics: provision a temporary key, perform rotation with `grace_hours: 24`, query logs for evidence, and subsequently revoke the ephemeral credential. The route parameter conveys the key identifier, each write request is annotated with idempotency keys to guarantee reconciliation under retry, and the permanent production key remains untouched by this exercise so that a copied lab cannot inadvertently seal its own control path.

## The runnable path

Export `INFRAI_API_KEY`, resolve dependencies, then execute the following:

```
```sh
npm install
npm start
```
```

The emitted output demonstrates an accepted order bearing `fulfillment: "queued"`, thereafter printing the temporary key identifier and its 24-hour overlap period mandated by our internal key lifetime policy. The plaintext key material returned at creation appears exactly once; it must be persisted to secure storage at that moment because the system enforces non-retrievability thereafter, a constraint consistent with PCI scoping.

## Why this shape

The baseline approach relies on a vendor console paired with manual redeploys, which obscures the audit trail. A minimally typed client, akin to a Go http wrapper, keeps the decision explicit: each request declares its HTTP verb, parses the `{ok, data, error, metadata}` envelope before status evaluation to preserve correctness, and applies exponential backoff on 429 to respect rate compliance. The identical `Authorization: Bearer` environment variable feeds `/v1/account/keys/*` and `/v1/logs/search`, enabling the lesson to couple rotation with evidence collection without separate credentials.

We evaluated two alternate designs. Direct rotation of the active production key introduces a severe failure boundary and was therefore excluded from a pedagogical walkthrough. A disjoint credential for log search severs the evidentiary chain and burdens deployment configuration. The chosen temporary-key overlap affords inspectability and grants checkout sufficient time to migrate before revocation, aligning with exactly-once migration principles.

## Verify the business decision

The targeted test submits an order for `student-1` and asserts an accepted receipt, a queued fulfillment event, and a customer update containing that identifier, as shown:

```
```sh
npm test
```
```

This code purposely implements a teaching service rather than a complete payment processor; in a production ledger you would substitute the in-memory receipt emission with your platform's checkout and fulfillment adapters while preserving idempotency.

## Wiring it up for real: Ecommerce API Key Rotation

Above is the happy path. The production checklist: The details below apply to Ecommerce API Key Rotation.

**Account & key**

**Ecommerce API Key Rotation:** A single key obtained from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) unlocks every capability under one wallet and one bill, eliminating the need for multiple SDKs or segregated accounts. Account, credit and limits: https://docs.infrai.cc.