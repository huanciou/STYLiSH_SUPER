import { customAlphabet } from "nanoid";
import { Connection } from "mysql2/promise";
import { z } from "zod";
import pool from "./databasePool.js";
import ORDER_STATUS from "../constants/orderStatus.const.js";
import instanceOfSetHeader from "../utils/instanceOfSetHeader.js";

/*
  id bigint unsigned NOT NULL AUTO_INCREMENT
  user_id bigint unsigned NOT NULL FOREIGN KEY
  status
  number
  shipping
  payment
  subtotal
  freight
  total
  created_at
  updated_at
**/

const generateOrderNumber = customAlphabet("1234567890abcdef", 5);

export async function createOrder(
  userId: number,
  orderInfo: {
    shipping: string;
    payment: string;
    subtotal: number;
    freight: number;
    total: number;
  },
  connection: Connection
) {
  const orderNumber = generateOrderNumber();
  const { shipping, payment, subtotal, freight, total } = orderInfo;
  const results = await connection.query(
    `
    INSERT INTO orders (
      user_id, status, number, shipping, payment, subtotal, freight, total
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      userId,
      ORDER_STATUS.CREATED,
      orderNumber,
      shipping,
      payment,
      subtotal,
      freight,
      total,
    ]
  );
  if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
    return { orderId: results[0].insertId, orderNumber };
  }
  throw new Error("create order failed");
}

export async function transitionStatusFromCreatedToPaid(
  orderId: number,
  connection: Connection
) {
  await connection.query(
    `
      UPDATE orders
      SET status = ?
      WHERE id = ? AND status = ?
    `,
    [ORDER_STATUS.PAID, orderId, ORDER_STATUS.CREATED]
  );
}

const UserIdAndTotalSchema = z.object({
  user_id: z.number(),
  total: z.number(),
});

export async function getUserIdAndTotal() {
  const [rows] = await pool.query(
    `
      SELECT user_id, total from orders
    `
  );
  const orders = z.array(UserIdAndTotalSchema).parse(rows);
  return orders;
}
