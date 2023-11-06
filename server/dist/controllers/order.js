import axios from "axios";
import * as dotenv from "dotenv";
import { ValidationError } from "../utils/errorHandler.js";
import mongoose from 'mongoose';
import { product, orderModel } from "../schema/schema.js";
dotenv.config();
const TAPPAY_PARTNER_KEY = process.env.TAPPAY_PARTNER_KEY;
const TAPPAY_MERCHANT_ID = process.env.TAPPAY_MERCHANT_ID;
async function checkStockAndDecrease(list) {
    for (const item of list) {
        const productToUpdate = await product.findOne({
            _id: item.id,
            color: { $in: [item.color.code] },
            size: { $in: [item.size] },
        });
        if (!productToUpdate) {
            throw new ValidationError(`Product ${item.id} not found`);
        }
        const updatedStock = productToUpdate.stock.map((stock, index) => {
            if (stock >= item.qty) {
                return stock - item.qty;
            }
            else {
                throw new ValidationError(`Product ${item.id} stock not enough`);
            }
        });
        productToUpdate.stock = updatedStock;
        await productToUpdate.save();
    }
}
export const checkout = async (req, res) => {
    const userId = res.locals.userId;
    const { prime, order } = req.body;
    const { shipping, payment, subtotal, freight, total, recipient, list } = order;
    const { name, phone, email, address, time } = recipient;
    const orderDetails = [userId, shipping, payment, subtotal, freight, total, name, phone, email, address, time];
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        checkStockAndDecrease(order.list);
        // create order
        const newOrder = await orderModel.create(req.body);
        const orderId = newOrder._id.toString();
        const response = await axios.post('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', {
            "prime": prime,
            "partner_key": TAPPAY_PARTNER_KEY,
            "merchant_id": TAPPAY_MERCHANT_ID,
            "details": "TapPay Test",
            "amount": total,
            "cardholder": {
                "phone_number": phone,
                "name": name,
                "email": email,
                "address": address,
            },
            "remember": false
        }, {
            headers: {
                "Content-Type": "application/json",
                "x-api-key": TAPPAY_PARTNER_KEY
            }
        });
        console.log(response.data);
        if (response.data.status !== 0) {
            return res.status(400).json({ message: 'Transaction Failed' });
        }
        // // create order
        // const newOrder = await orderModel.create(req.body)
        // console.log(newOrder)
        await session.commitTransaction();
        res.status(200).json({
            data: {
                "number": orderId
            }
        });
    }
    catch (err) {
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
    }
    finally {
        session.endSession();
    }
};
