import mysql from "mysql2/promise";
import { customAlphabet } from "nanoid";

console.log("====== init orders ======");

function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * max);
}

const conn = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  multipleStatements: true,
});

const [users] = await conn.query("SELECT id, name FROM users LIMIT 5");

const userIds = users.map(({ id }) => id);
const generateOrderNumber = customAlphabet("1234567890abcdef", 8);

console.log(users);

let ordersCount = 10000;

const orders = Array.from({ length: ordersCount })
  .fill()
  .map(() => {
    const subtotal = getRandomInt(100, 1000);
    const freight = getRandomInt(30, 50);
    return {
      userId: userIds[getRandomInt(0, 5)],
      status: 1,
      orderNumber: generateOrderNumber(),
      shipping: "delivery",
      payment: "credit_card",
      subtotal,
      freight,
      total: subtotal + freight,
    };
  });

console.log(orders.length);

try {
  conn.query("BEGIN");
  const results = await conn.query(
    `
    INSERT INTO orders (
      user_id, status, number, shipping, payment, subtotal, freight, total
    )
    VALUES ?
  `,
    [
      orders.map((order) => {
        const {
          userId,
          status,
          orderNumber,
          shipping,
          payment,
          subtotal,
          freight,
          total,
        } = order;
        return [
          userId,
          status,
          orderNumber,
          shipping,
          payment,
          subtotal,
          freight,
          total,
        ];
      }),
    ]
  );
  conn.query("COMMIT");
  console.log('====== results ======', results);
} catch (err) {
  console.error(err);
  conn.query("ROLLBACK");
} finally {
  conn.end();
}

process.exit();
