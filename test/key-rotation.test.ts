import assert from "node:assert/strict";
import { acceptOrder } from "../src/checkout_service.js";

const receipt = acceptOrder({ orderId: "o-1", customerId: "student-1", items: [{ sku: "lesson-pack", quantity: 1 }] });
assert.equal(receipt.status, "accepted");
assert.equal(receipt.fulfillment, "queued");
assert.match(receipt.customerUpdate, /student-1/);
console.log("order decision test passed");
