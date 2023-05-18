import { Request, Response, NextFunction } from "express";
import { cache } from "../utils/cache.js";
import { getUserIdAndTotal } from "../models/order.js";

export async function payment(req: Request, res: Response) {
  try {
    const orders = await getUserIdAndTotal();
    const paymentInfo = orders.reduce(function (
      acc: { [userId: string]: number },
      order
    ) {
      if (!acc[order.user_id]) {
        acc[order.user_id] = 0;
      }
      acc[order.user_id] += order.total;
      return acc;
    },
    {});
    res.status(200).json({
      data: Object.entries(paymentInfo).map(([key, value]) => ({
        user_id: key,
        total_payment: value,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("oops, something wrong");
  }
}

export async function paymentAsync(req: Request, res: Response) {
  try {
    const result = await cache.lpush("queues", "calculateOrders");
    if (result) {
      res.status(200).send("start generate reports, please wait...");
      return;
    }
    throw new Error('redis lpush failed');
  } catch (err) {
    console.error(err);
    res.status(500).send("oops, something wrong");
  }
}
