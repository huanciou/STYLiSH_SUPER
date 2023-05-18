import { Connection } from "mysql2/promise";

/*
  id bigint unsigned NOT NULL AUTO_INCREMENT
  order_id bigint unsigned NOT NULL FOREIGN KEY
  product_id bigint unsigned NOT NULL FOREIGN KEY
  variant_id bigint unsigned NOT NULL FOREIGN KEY
  product_title
  quantity
  price
  created_at
  updated_at
**/

interface ProductInput {
  id: number;
  title: string;
  variantId: number;
  price: number;
  qty: number;
}

export async function createOrderDetails(
  orderId: number,
  products: ProductInput[],
  connection: Connection
) {
  await connection.query(
    `
      INSERT INTO order_details (
        order_id, product_id, variant_id, product_title, quantity, price)
      VALUES ?
    `,
    [
      products.map((product) => {
        const { id: productId, variantId, title, qty, price } = product;
        return [orderId, productId, variantId, title, qty, price];
      }),
    ]
  );
}
