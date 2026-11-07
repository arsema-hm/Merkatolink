import { z } from "zod";
export const roleSchema = z.enum([
  "admin",
  "trader_owner",
  "trader_staff",
  "broker",
  "buyer",
]);
export const wholesaleUnitSchema = z.enum([
  "piece",
  "carton",
  "sack",
  "quintal",
  "kg",
  "roll",
]);
export const deliveryTypeSchema = z.enum(["pickup", "porter", "truck"]);
export const paymentTermsSchema = z.enum([
  "cash",
  "transfer",
  "mobile_money",
  "credit",
]);
export const moneySchema = z.number().finite().nonnegative();
export type Role = z.infer<typeof roleSchema>;
export type WholesaleUnit = z.infer<typeof wholesaleUnitSchema>;
