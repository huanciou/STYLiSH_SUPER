import { ResultSetHeader } from "mysql2";
import { z } from "zod";
import pool from "./databasePool.js";

/*
  id bigint unsigned NOT NULL AUTO_INCREMENT
  category enum
  title varchar(255) NOT NULL
  description varchar(255) NOT NULL
  price int unsigned NOT NULL
  texture varchar(127) NOT NULL
  wash varchar(127) NOT NULL
  place varchar(127) NOT NULL
  note varchar(127) NOT NULL
  story varchar(127) NOT NULL
  variants
  images
**/

export const CategorySchema = z.enum(["men", "women", "accessories"]);

const ProductSchema = z.object({
  id: z.number(),
  category: CategorySchema,
  title: z.string(),
  description: z.string(),
  price: z.number(),
  texture: z.string(),
  wash: z.string(),
  place: z.string(),
  note: z.string(),
  story: z.string(),
});

export const PAGE_COUNT = 6;
export async function getProducts({
  paging = 0,
  category,
}: {
  paging: number;
  category: string;
}) {
  const results = await pool.query(
    `
    SELECT * FROM products
    ${
      CategorySchema.safeParse(category).success
        ? `WHERE category = "${category}"`
        : ""
    }
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `,
    [PAGE_COUNT, paging * PAGE_COUNT]
  );
  const products = z.array(ProductSchema).parse(results[0]);
  return products;
}

export async function getProduct(id: number) {
  const results = await pool.query(
    `
    SELECT * FROM products
    WHERE id = ?
  `,
    [id]
  );
  const products = z.array(ProductSchema).parse(results[0]);
  return products;
}

export async function searchProducts({
  paging = 0,
  keyword,
}: {
  paging: number;
  keyword: string;
}) {
  const results = await pool.query(
    `
    SELECT * FROM products
    WHERE title LIKE ?
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `,
    [`%${keyword}%`, PAGE_COUNT, paging * PAGE_COUNT]
  );
  const products = z.array(ProductSchema).parse(results[0]);
  return products;
}

const ProductCountSchema = z.object({
  count: z.number(),
});

type ProductCount = z.infer<typeof ProductCountSchema>;

function instanceOfProductCount(object: any): object is ProductCount {
  return "count" in object;
}

export async function countProducts({
  category,
  keyword,
}: {
  category?: string;
  keyword?: string;
}) {
  const results = await pool.query(
    `
  SELECT COUNT(id) AS count
  FROM products
  ${
    CategorySchema.safeParse(category).success
      ? `WHERE category = "${category}"`
      : ""
  }
  ${typeof keyword === "string" ? `WHERE title LIKE ?` : ""}
`,
    [`%${keyword}%`]
  );
  if (Array.isArray(results[0]) && instanceOfProductCount(results[0][0])) {
    const productCount = ProductCountSchema.parse(results[0][0]);
    return productCount.count;
  }
  return 0;
}

function instanceOfSetHeader(object: any): object is ResultSetHeader {
  return "insertId" in object;
}

export async function createProduct(productData: {
  category: string;
  title: string;
  description: string;
  price: number;
  texture: string;
  wash: string;
  place: string;
  note: string;
  story: string;
}) {
  try {
    const {
      category,
      title,
      description,
      price,
      texture,
      wash,
      place,
      note,
      story,
    } = productData;
    const results = await pool.query(
      `
        INSERT INTO products (category, title, description, price, texture, wash, place, note, story)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [category, title, description, price, texture, wash, place, note, story]
    );
    if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
      return results[0].insertId;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function isProductExist(productId: number) {
  const results = await pool.query(
    `
    SELECT COUNT(id) AS count FROM products
    WHERE id = ?
  `,
    [productId]
  );
  if (Array.isArray(results[0]) && instanceOfProductCount(results[0][0])) {
    const productCount = ProductCountSchema.parse(results[0][0]);
    return productCount.count === 1;
  }
  return false;
}

const PartialProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
});

export async function getProductsByIds(ids: number[]) {
  const results = await pool.query(
    `
    SELECT id, title, price FROM products
    WHERE id IN (?)
  `,
    [ids]
  );
  const products = z.array(PartialProductSchema).parse(results[0]);
  return products;
}
