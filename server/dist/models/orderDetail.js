export async function createOrderDetails(orderId, products, connection) {
    await connection.query(`
      INSERT INTO order_details (
        order_id, product_id, variant_id, product_title, quantity, price)
      VALUES ?
    `, [
        products.map((product) => {
            const { id: productId, variantId, title, qty, price } = product;
            return [orderId, productId, variantId, title, qty, price];
        }),
    ]);
}
