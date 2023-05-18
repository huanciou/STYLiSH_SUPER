import mysql from "mysql2/promise";
import * as argon2 from "argon2";

const conn = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  multipleStatements: true,
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ROLE_NAME = "admin";

const [roles] = await conn.query(
  `
  SELECT * FROM roles
  WHERE name = ?
`,
  [ROLE_NAME]
);

const [users] = await conn.query(
  `
  SELECT * FROM users
  WHERE email = ?
`,
  [ADMIN_EMAIL]
);

if (users.length > 0 && roles.length > 0) {
  console.log("====== admin already exist ======");
  conn.end();
  process.exit();
}

const [userRows] = await conn.query(
  `
  INSERT INTO users (email, name)
  VALUES(?, ?)
`,
  [ADMIN_EMAIL, "admin"]
);

const userId = userRows.insertId;
const token = await argon2.hash(process.env.ADMIN_PASSWORD);
await conn.query(
  `
  INSERT INTO user_providers (user_id, name, token)
  VALUES(?, ?, ?)
`,
  [userId, "native", token]
);

const [roleRows] = await conn.query(
  `
  INSERT INTO roles (name)
  VALUES(?)
`,
  [ROLE_NAME]
);
const roleId = roleRows.insertId;

await conn.query(
  `
  INSERT INTO user_role (user_id, role_id)
  VALUES(?, ?)
`,
  [userId, roleId]
);

console.log(`###### admin user and role created ######`);
conn.end();
process.exit();
