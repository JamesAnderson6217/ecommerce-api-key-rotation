import { InfraiClient } from "./infrai_client.js";
import { acceptOrder, rotateTemporaryKey } from "./checkout_service.js";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the example");
const order = acceptOrder({ orderId: "course-1042", customerId: "learner-7", items: [{ sku: "typescript-course", quantity: 1 }] });
console.log("receipt", order);
const infrai = new InfraiClient(key);
console.log("rotation", await rotateTemporaryKey(infrai));
