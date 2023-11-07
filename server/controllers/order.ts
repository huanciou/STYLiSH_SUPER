import { NextFunction, Request, Response } from "express";
import axios from "axios";
import * as dotenv from "dotenv";
import { ValidationError } from "../utils/errorHandler.js";
import mongoose from "mongoose";
import { product, orderModel } from "../schema/schema.js";
import { log } from "console";

dotenv.config();

const TAPPAY_PARTNER_KEY = process.env.TAPPAY_PARTNER_KEY;
const TAPPAY_MERCHANT_ID = process.env.TAPPAY_MERCHANT_ID;

interface listItem {
  id: number;
  name: string;
  price: number;
  color: { code: string; name: string };
  size: string;
  qty: number;
}

// async function checkStockAndDecrease(list: listItem[]) {
//   for (const item of list) {
//     const productToUpdate = await product.findOne({
//       _id: item.id,
//       color: { $in: [item.color.code] },
//       size: { $in: [item.size] },
//     });

//     if (!productToUpdate) {
//       throw new ValidationError(`Product ${item.id} not found`);
//     }

//     const updatedStock = productToUpdate.stock.map((stock, index) => {
//       if (stock >= item.qty) {
//         return stock - item.qty;
//       } else {
//         throw new ValidationError(`Product ${item.id} stock not enough`);
//       }
//     });

//     productToUpdate.stock = updatedStock;
//     await productToUpdate.save();
//   }
// }
// async function checkStockAndDecrease(list: listItem[]) {
//   for (const item of list) {
//     const query = {
//       _id: item.id,
//       color: { $in: [item.color.code] },
//       size: { $in: [item.size] },
//       stock: { $gte: item.qty },
//     };

//     const update = {
//       $inc: { stock: -item.qty },
//     };

//     const productToUpdate = await product.findOneAndUpdate(query, update, {
//       new: true,
//     });
//     console.log(productToUpdate);
//     if (!productToUpdate) {
//       throw new ValidationError(
//         `Product ${item.id} not found or stock not enough`
//       );
//     }
//   }
// }

async function checkStockAndDecrease(list: listItem[]) {
  for (const item of list) {
    const query = {
      _id: item.id,
      color: item.color.code, // 使用特定索引的 color 值
      size: item.size,
      stock: { $gte: item.qty },
    };

    const update = {
      $inc: {
        "stock.$": -item.qty, // 使用 $ 符号来指定匹配的 stock 数组索引
      },
    };

    const productToUpdate = await product.findOneAndUpdate(query, update, {
      new: true,
    });
    console.log(productToUpdate);
    if (!productToUpdate) {
      throw new ValidationError(
        `Product ${item.id} not found or stock not enough`
      );
    }
  }
}

export const checkout = async (req: Request, res: Response) => {
  const userId = res.locals.userId;
  const { prime, order } = req.body;
  console.log(JSON.stringify(order, null, 4));

  const { shipping, payment, subtotal, freight, total, recipient, list } =
    order;

  console.log(shipping);

  const { name, phone, email, address, time } = recipient;
  const orderDetails = [
    userId,
    shipping,
    payment,
    subtotal,
    freight,
    total,
    name,
    phone,
    email,
    address,
    time,
  ];

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    checkStockAndDecrease(order.list);
    // create order
    const newOrder = await orderModel.create(req.body);
    const orderId = newOrder._id.toString();

    const response = await axios.post(
      "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime",
      {
        prime: prime,
        partner_key: TAPPAY_PARTNER_KEY,
        merchant_id: TAPPAY_MERCHANT_ID,
        details: "TapPay Test",
        amount: total,
        cardholder: {
          phone_number: phone,
          name: name,
          email: email,
          address: address,
        },
        remember: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TAPPAY_PARTNER_KEY,
        },
      }
    );
    console.log(response.data);
    if (response.data.status !== 0) {
      return res.status(400).json({ message: "Transaction Failed" });
    }

    // // create order
    // const newOrder = await orderModel.create(req.body)
    // console.log(newOrder)
    await session.commitTransaction();

    res.status(200).json({
      data: {
        number: orderId,
      },
    });
  } catch (err) {
    await session.abortTransaction();

    if (err instanceof ValidationError) {
      res.status(400).json({ errors: err.message });
      return;
    }
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "checkout failed" });
  } finally {
    session.endSession();
  }
};
