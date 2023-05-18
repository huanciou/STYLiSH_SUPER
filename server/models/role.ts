import z from "zod";
import pool from "./databasePool.js";

/*
roles
  id bigint unsigned NOT NULL AUTO_INCREMENT
  name varchar(127) NOT NULL
**/

/*
user_role
  user_id bigint unsigned NOT NULL
  role_id varchar(127) NOT NULL
**/

export async function isUserHasRole(userId: number, roleName: string) {
  try {
    const [rows] = await pool.query(
      `
      SELECT COUNT(role_id) as count FROM user_role
      LEFT JOIN roles
      ON user_role.role_id = roles.id AND roles.name = ?
      WHERE user_id = ? AND roles.name = ?
    `,
      [roleName, userId, roleName]
    );
    if (!Array.isArray(rows)) {
      throw new Error("invalid rows");
    }
    const result = z
      .object({
        count: z.number(),
      })
      .parse(rows[0]);
    return result.count > 0;
  } catch (err) {
    console.error(err);
    return false;
  }
}
