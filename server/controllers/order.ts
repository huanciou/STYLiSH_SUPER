import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { Connection } from "mysql2/promise";
import keyBy from "lodash.keyby";
import groupBy from "lodash.groupby";
import flow from "lodash.flow";
import * as dotenv from "dotenv";
import pool from "../models/databasePool.js";
import * as orderModel from "../models/order.js";
import * as orderRecipientModel from "../models/orderRecipient.js";
import * as orderDetailModel from "../models/orderDetail.js";
import { getProductsByIds } from "../models/product.js";
import {
  getProductVariants,
  getVariantsStockWithLock,
  updateVariantsStock,
} from "../models/productVariant.js";
import { ValidationError } from "../utils/errorHandler.js";

dotenv.config();

const TAPPAY_PARTNER_KEY = process.env.TAPPAY_PARTNER_KEY;
const TAPPAY_MERCHANT_ID = process.env.TAPPAY_MERCHANT_ID;

interface OrderInfo {
  shipping: string;
  payment: string;
  subtotal: number;
  freight: number;
  total: number;
}

interface Recipient {
  name: string;
  phone: string;
  email: string;
  address: string;
  time: string;
}

async function payByPrime({
  prime,
  recipient,
  amount,
  details,
  orderNumber,
}: {
  prime: string;
  recipient: Recipient;
  amount: number;
  details: string;
  orderNumber: string;
}) {
  const result = await axios({
    method: "post",
    url: "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": TAPPAY_PARTNER_KEY,
    },
    responseType: "json",
    data: {
      prime,
      partner_key: TAPPAY_PARTNER_KEY,
      merchant_id: TAPPAY_MERCHANT_ID,
      details,
      amount,
      cardholder: {
        phone_number: recipient.phone,
        name: recipient.name,
        email: recipient.email,
        address: recipient.address,
      },
      remember: false,
      order_number: orderNumber,
    },
  });
  if (result.data.status !== 0) {
    throw new Error(result.data.msg);
  }
}

interface ProductInput {
  id: number;
  title: string;
  price: number;
  color: { code: string; name: string };
  size: string;
  qty: number;
}

interface Product extends ProductInput {
  variantId: number;
}

interface VariantMap {
  [variantId: string]: {
    id: number;
    product_id: number;
    stock: number;
  };
}

async function checkProducts(inputList: ProductInput[]): Promise<Product[]> {
  const productIds = inputList.map(({ id }) => Number(id));
  const [productsFromServer, variantsFromServer] = await Promise.all([
    getProductsByIds(productIds),
    getProductVariants(productIds),
  ]);
  const productsFromServerMap = keyBy(productsFromServer, "id");
  const variantsFromServerMap = groupBy(variantsFromServer, "product_id");
  const checkProductExit = (product: ProductInput) => {
    const serverProduct = productsFromServerMap[product.id];
    if (!serverProduct)
      throw new ValidationError(`invalid product: ${product.id}`);
    return product;
  };
  const checkProductPriceMatch = (product: ProductInput) => {
    const serverProduct = productsFromServerMap[product.id];
    if (serverProduct.price !== product.price) {
      throw new ValidationError(`invalid product price: ${product.id}`);
    }
    return product;
  };
  const checkProductVariant = (product: ProductInput) => {
    const variants = variantsFromServerMap[product.id];
    if (!Array.isArray(variants)) {
      throw new ValidationError(`invalid product variants: ${product.id}`);
    }
    const targetVariant = variants.find((v) => {
      return (
        v.color_name === product.color.name &&
        v.color === `#${product.color.code}` &&
        v.size === product.size
      );
    });
    if (!targetVariant) {
      throw new ValidationError(`invalid product variants: ${product.id}`);
    }
    if (targetVariant.stock < product.qty) {
      throw new ValidationError(`product ${product.id} stock not enough`);
    }
  };
  inputList.forEach(
    flow(checkProductExit, checkProductPriceMatch, checkProductVariant)
  );
  return inputList.map((product) => {
    const variants = variantsFromServerMap[product.id];
    const targetVariant = variants.find((v) => {
      return (
        v.color_name === product.color.name &&
        v.color === `#${product.color.code}` &&
        v.size === product.size
      );
    });
    if (!targetVariant) {
      throw new ValidationError(`invalid product variants: ${product.id}`);
    }
    return {
      ...product,
      variantId: targetVariant.id,
    };
  });
}

async function placeOrder({
  userId,
  orderInfo,
  recipient,
  products,
  connection,
}: {
  userId: number;
  orderInfo: OrderInfo;
  recipient: Recipient;
  products: Product[];
  connection: Connection;
}) {
  const { shipping, payment, subtotal, freight, total } = orderInfo;
  connection.query("BEGIN");
  try {
    const { orderId, orderNumber } = await orderModel.createOrder(
      userId,
      {
        shipping,
        payment,
        subtotal,
        freight,
        total,
      },
      connection
    );
    await Promise.all([
      orderRecipientModel.createOrderRecipient(orderId, recipient, connection),
      orderDetailModel.createOrderDetails(orderId, products, connection),
    ]);
    connection.query("COMMIT");
    return { orderId, orderNumber };
  } catch (err) {
    connection.query("ROLLBACK");
    throw err;
  }
}

async function confirmOrder({
  orderId,
  orderNumber,
  amount,
  prime,
  products,
  recipient,
  connection,
}: {
  orderId: number;
  orderNumber: string;
  amount: number;
  prime: string;
  products: Product[];
  recipient: Recipient;
  connection: Connection;
}) {
  try {
    connection.query("BEGIN");

    const variantIds = products.map(({ variantId }) => variantId);
    const variants = await getVariantsStockWithLock(variantIds, connection);
    const variantsMapWithNewStock = products.reduce(function (
      variantsMap: VariantMap,
      product
    ): VariantMap {
      variantsMap[product.variantId].stock -= product.qty;
      return variantsMap;
    },
    keyBy(variants, "id"));

    if (
      Object.values(variantsMapWithNewStock).some(
        (variant) => variant.stock < 0
      )
    ) {
      throw new Error("stock not enough!");
    }

    await updateVariantsStock(
      Object.values(variantsMapWithNewStock),
      connection
    );

    await orderModel.transitionStatusFromCreatedToPaid(orderId, connection);

    await payByPrime({
      prime,
      recipient,
      amount,
      details: products[0].title,
      orderNumber,
    });

    connection.query("COMMIT");
  } catch (err) {
    connection.query("ROLLBACK");
    throw err;
  }
}

export async function checkout(req: Request, res: Response) {
  const connection = await pool.getConnection();
  try {
    const userId = res.locals.userId;
    const { prime, order } = req.body;
    const { shipping, payment, subtotal, freight, total, recipient, list } =
      order;

    const products = await checkProducts(list);

    const { orderId, orderNumber } = await placeOrder({
      userId,
      orderInfo: {
        shipping,
        payment,
        subtotal,
        freight,
        total,
      },
      recipient,
      products,
      connection,
    });

    await confirmOrder({
      orderId,
      orderNumber,
      prime,
      amount: total,
      recipient,
      products,
      connection,
    });

    res.status(200).json({ data: { number: orderNumber } });
  } catch (err) {
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
    connection.release();
  }
}
