import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import mysql from "mysql2/promise";
import mime from "mime-types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FOLDER_PATH = path.join(__dirname, `../..`);

console.log("====== init products & campaigns ======");

const conn = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  multipleStatements: true,
});

const DOMAIN_NAME = "https://api.appworks-school.tw";
const PRODUCT_API = `${DOMAIN_NAME}/api/1.0/products/all`;
const CAMPAIGN_API = `${DOMAIN_NAME}/api/1.0/marketing/campaigns`;

async function fetchCampaigns() {
  const response = await fetch(CAMPAIGN_API);
  const result = await response.json();
  return result.data;
}

const campaigns = await fetchCampaigns();
const campaignsMap = campaigns.reduce((acc, campaign) => {
  return {
    ...acc,
    [campaign.product_id]: campaign,
  };
}, {});

async function fetchProducts(page) {
  if (page === undefined) return [];
  const products = [];
  const response = await fetch(`${PRODUCT_API}?paging=${page}`);
  const result = await response.json();
  products.push(...result.data);
  if (result.next_paging) {
    products.push(...(await fetchProducts(result.next_paging)));
  }
  return products;
}

function getImageInfo(images) {
  const paths = images.map((imageUrl) => imageUrl.replace(DOMAIN_NAME, ""));
  const info = paths.map((imagePath, index) => {
    try {
      const targetPath = `${FOLDER_PATH}${imagePath}`;
      const mimetype = mime.lookup(targetPath);
      const stats = fs.statSync(targetPath);
      return {
        mimetype,
        path: imagePath,
        size: stats.size,
        fieldname: index === 0 ? "main_image" : "images",
      };
    } catch (err) {
      console.error(err);
    }
  });
  return info;
}

function getVariantsInfo(variants, colors) {
  return variants.map((variant) => {
    return {
      color: `#${variant.color_code}`,
      colorName: colors.find((color) => color.code === variant.color_code).name,
      size: variant.size,
      stock: variant.stock,
    };
  });
}

async function setProduct({
  id,
  category,
  title,
  description,
  price,
  texture,
  wash,
  place,
  note,
  story,
  main_image,
  images,
  variants,
  colors,
}) {
  const [{ insertId: productId }] = await conn.query(
    `
      INSERT INTO products (category, title, description, price, texture, wash, place, note, story)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [category, title, description, price, texture, wash, place, note, story]
  );
  const imagesInfo = getImageInfo(Array.from(new Set([main_image, ...images])));
  await conn.query(
    `
      INSERT INTO product_images (product_id, original_name, mimetype, filename, path, size, field_name)
      VALUES ?
    `,
    [
      imagesInfo.map((data) => {
        const { mimetype, path, size, fieldname } = data;
        return [productId, id, mimetype, id, path, size, fieldname];
      }),
    ]
  );
  const variantsInfo = getVariantsInfo(variants, colors);
  await conn.query(
    `
      INSERT INTO product_variants (product_id, color, color_name, size, stock)
      VALUES ?
    `,
    [
      variantsInfo.map((data) => {
        const { color, colorName, size, stock } = data;
        return [productId, color, colorName, size, stock];
      }),
    ]
  );
  if (campaignsMap[id]) {
    const { story, picture } = campaignsMap[id];
    await conn.query(
      `
        INSERT INTO campaigns (product_id, story, picture)
        VALUES(?, ?, ?)
      `,
      [productId, story, picture.replace(DOMAIN_NAME, "")]
    );
  }
}

async function generateProducts() {
  try {
    const products = await fetchProducts(0);
    conn.query("BEGIN");
    await Promise.all(products.map(setProduct));
    conn.query("COMMIT");
  } catch (err) {
    console.error(err);
    conn.query("ROLLBACK");
  } finally {
    conn.end();
  }
}

await generateProducts();

console.log("====== init products & campaigns end ======");

process.exit();
