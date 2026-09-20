import { z } from "zod";
import { InfraiClient } from "./infrai_client.js";

export const OrderBody = z.object({ orderId: z.string().min(1), customerId: z.string().min(1), items: z.array(z.object({ sku: z.string(), quantity: z.number().int().positive() })).min(1) });
export type Order = z.infer<typeof OrderBody>;
export type Receipt = { orderId: string; status: "accepted"; fulfillment: "queued"; customerUpdate: string };

export function acceptOrder(input: unknown): Receipt {
  const order = OrderBody.parse(input);
  return { orderId: order.orderId, status: "accepted", fulfillment: "queued", customerUpdate: `Order ${order.orderId} is confirmed for ${order.customerId}` };
}

export async function rotateTemporaryKey(client: InfraiClient) {
  const created = await client.createKey({ name: "checkout-rotation-practice", scopes: ["logs.search"], idempotency_key: `lesson-${Date.now()}` });
  await client.rotateKey(created.id, { grace_hours: 24, idempotency_key: `rotate-${created.id}` });
  await client.searchLogs("old API key ecommerce deployment");
  await client.revokeKey(created.id);
  return { keyId: created.id, overlapHours: 24 };
}
