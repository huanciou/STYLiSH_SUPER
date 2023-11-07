import instanceOfSetHeader from "../utils/instanceOfSetHeader.js";
/*
  id bigint unsigned NOT NULL AUTO_INCREMENT
  order_id bigint unsigned NOT NULL FOREIGN KEY
  name
  phone
  email
  address
  time_preference
**/
export async function createOrderRecipient(orderId, recipient, connection) {
    const { name, phone, email, address, time } = recipient;
    const results = await connection.query(`
    INSERT INTO order_recipients (
      order_id, name, phone, email, address, time_preference
    )
    VALUES(?, ?, ?, ?, ?, ?)
  `, [orderId, name, phone, email, address, time]);
    if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
        return results[0].insertId;
    }
    throw new Error("create campaign failed");
}
