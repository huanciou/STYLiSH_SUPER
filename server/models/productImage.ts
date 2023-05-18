import { z } from "zod";
import pool from "./databasePool.js";

/**
  id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY
  product_id bigint unsigned NOT NULL FOREIGN KEY
  original_name varchar(255) NOT NULL
  mimetype varchar(127) NOT NULL
  filename varchar(255) NOT NULL
  path varchar(255) NOT NULL
  size int unsigned NOT NULL
  field_name varchar(127) NOT NULL
*/

export async function createProductImages(
  imageData: {
    productId: number;
    originalname: string;
    mimetype: string;
    filename: string;
    path: string;
    size: number;
    fieldname: string;
  }[]
) {
  try {
    await pool.query(
      `
        INSERT INTO product_images (product_id, original_name, mimetype, filename, path, size, field_name)
        VALUES ?
      `,
      [
        imageData.map((data) => {
          const {
            productId,
            originalname,
            mimetype,
            filename,
            path,
            size,
            fieldname,
          } = data;
          return [
            productId,
            originalname,
            mimetype,
            filename,
            path,
            size,
            fieldname,
          ];
        }),
      ]
    );
  } catch (err) {
    console.error(err);
    return null;
  }
}

const ProductImageSchema = z.object({
  product_id: z.number(),
  path: z.string(),
  mimetype: z.string(),
  field_name: z.string(),
});

type ProductImage = z.infer<typeof ProductImageSchema>;

export async function getProductImages(productIds: number[]) {
  if (productIds.length === 0) return [];
  const result = await pool.query(
    `
    SELECT product_id, path, mimetype, field_name
    FROM product_images
    WHERE product_id IN (?)
  `,
    [productIds]
  );
  const productImages = z.array(ProductImageSchema).parse(result[0]);
  return productImages;
}

export function groupImages(productImages: ProductImage[]) {
  const result = productImages.reduce(function (
    obj: {
      [productId: string]: {
        main_image: string;
        images: string[];
      };
    },
    image
  ) {
    if (!obj[image.product_id]) {
      obj[image.product_id] = { main_image: "", images: [] };
    }
    if (image.field_name === "main_image") {
      obj[image.product_id].main_image = image.path;
    }
    if (image.field_name === "images") {
      obj[image.product_id].images.push(image.path);
    }
    return obj;
  }, {});
  return result;
}
