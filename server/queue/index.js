import { Redis } from "ioredis";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

export const cache = new Redis({
  port: 6379, // Redis port
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
});

async function getUserIdAndTotalFromOrder() {
  const [orders] = await pool.query(
    `
      SELECT user_id, total from orders
    `
  );
  return orders;
}

function calculateOrders(orders) {
  const paymentInfo = orders.reduce((acc, order) => {
    if (!acc[order.user_id]) {
      acc[order.user_id] = 0;
    }
    acc[order.user_id] += order.total;
    return acc;
  }, {});
  return Object.entries(paymentInfo).map(([key, value]) => ({
    user_id: key,
    total_payment: value,
  }));
}

const worker = async () => {
  console.log("queue started");
  while (true) {
    try {
      const result = await cache.brpop("queues", 5);
      if (Array.isArray(result) && result[1] === "calculateOrders") {
        const orders = await getUserIdAndTotalFromOrder();
        console.table(calculateOrders(orders));
      }
    } catch (err) {
      console.error(err);
    }
  }
};

worker();
