import { Connection } from "mysql2/promise";
import { z } from "zod";
import pool from "./databasePool.js";

/**
  id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY
  product_id bigint unsigned NOT NULL FOREIGN KEY
  color varchar(127) NOT NULL
  color_name varchar(127) NOT NULL
  size enum NOT NULL
  stock int unsigned NOT NULL
*/

export async function createProductVariants(
  variantData: {
    productId: number;
    color: string;
    colorName: string;
    size: string;
    stock: number;
  }[]
) {
  try {
    await pool.query(
      `
        INSERT INTO product_variants (product_id, color, color_name, size, stock)
        VALUES ?
      `,
      [
        variantData.map((data) => {
          const { productId, color, colorName, size, stock } = data;
          return [productId, color, colorName, size, stock];
        }),
      ]
    );
  } catch (err) {
    console.error(err);
    return null;
  }
}

const ProductVariantSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  color: z.string(),
  color_name: z.string(),
  size: z.string(),
  stock: z.number(),
});

type ProductVariant = z.infer<typeof ProductVariantSchema>;

export async function getProductVariants(productIds: number[]) {
  if (productIds.length === 0) return [];
  const result = await pool.query(
    `
    SELECT id, product_id, color, color_name, size, stock
    FROM product_variants
    WHERE product_id IN (?)
  `,
    [productIds]
  );
  const productVariants = z.array(ProductVariantSchema).parse(result[0]);
  return productVariants;
}

export function groupVariants(productVariants: ProductVariant[]) {
  const result = productVariants.reduce(function (
    obj: {
      [productId: string]: {
        variants: { color_code: string; size: string; stock: number }[];
        sizes: Set<string>;
        colorsMap: { [colorCode: string]: string };
      };
    },
    variant
  ) {
    if (!obj[variant.product_id]) {
      obj[variant.product_id] = {
        variants: [],
        sizes: new Set(),
        colorsMap: {}
      };
    }
    const colorCode = variant.color.replace("#", "");
    obj[variant.product_id].variants.push({
      color_code: colorCode,
      size: variant.size,
      stock: variant.stock,
    });
    obj[variant.product_id].sizes.add(variant.size);
    obj[variant.product_id].colorsMap[colorCode] = variant.color_name;
    return obj;
  }, {});
  return result;
}

const VariantStockSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  stock: z.number(),
});

export async function getVariantsStockWithLock(
  variantIds: number[],
  connection: Connection
) {
  const result = await connection.query(
    `
    SELECT id, product_id, stock FROM product_variants
    WHERE id IN (?)
    FOR UPDATE;
  `,
    [variantIds]
  );
  const productVariants = z.array(VariantStockSchema).parse(result[0]);
  return productVariants;
}

export async function updateVariantsStock(
  variants: { id: number; stock: number }[],
  connection: Connection
) {
  await connection.query(
    `
      UPDATE product_variants SET stock = (
        CASE id
        ${variants
          .map((variant) => `WHEN ${variant.id} THEN ${variant.stock}`)
          .join(" ")}
        END
      )
      WHERE id IN (?)
    `,
    [variants.map(({ id }) => id)]
  );
}
