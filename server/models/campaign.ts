import { ResultSetHeader } from "mysql2";
import { z } from "zod";
import pool from "./databasePool.js";

/*
  id bigint unsigned NOT NULL AUTO_INCREMENT
  product_id bigint unsigned NOT NULL FOREIGN KEY
  picture varchar(255) NOT NULL
  story varchar(255) NOT NULL
  created_at
  updated_at
**/

function instanceOfSetHeader(object: any): object is ResultSetHeader {
  return "insertId" in object;
}

export const CampaignSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  story: z.string(),
  picture: z.string(),
});

export async function getCampaigns() {
  const results = await pool.query(
    `SELECT id, product_id, story, picture FROM campaigns;`
  );
  const campaigns = z.array(CampaignSchema).parse(results[0]);
  return campaigns;
}

export async function createCampaign(
  productId: number,
  story: string,
  picture: string = ""
) {
  const results = await pool.query(
    `
    INSERT INTO campaigns (product_id, story, picture)
    VALUES(?, ?, ?)
  `,
    [productId, story, picture]
  );
  if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
    return results[0].insertId;
  }
  throw new Error("create campaign failed");
}
