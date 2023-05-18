import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import { NextFunction, Request, Response } from "express";
import { fileTypeFromBuffer } from "file-type";

import * as productModel from "../models/product.js";
import * as productImageModel from "../models/productImage.js";
import * as productVariantModel from "../models/productVariant.js";

function mapId<Item extends { id: number }>(item: Item) {
  return item.id;
}

function mapImages(imagesObj: {
  [productId: string]: { main_image: string; images: string[] };
}) {
  return <Product extends { id: number }>(product: Product) => ({
    ...product,
    main_image: `${imagesObj[product.id]?.main_image}` ?? "",
    images: imagesObj[product.id]?.images?.map?.((image) => `${image}`) ?? [],
  });
}

function mapVariants(variantsObj: {
  [productId: string]: {
    variants: {
      color_code: string;
      size: string;
      stock: number;
    }[];
    sizes: Set<string>;
    colorsMap: { [colorCode: string]: string };
  };
}) {
  return <Product extends { id: number }>(product: Product) => ({
    ...product,
    ...variantsObj[product.id],
    sizes: Array.from(variantsObj[product.id].sizes),
    colors: Object.entries(variantsObj[product.id].colorsMap).map(
      ([key, value]) => ({
        code: key,
        name: value,
      })
    ),
  });
}

export async function getProducts(req: Request, res: Response) {
  try {
    const paging = Number(req.query.paging) || 0;
    const category = req.params.category;
    const [productsData, productsCount] = await Promise.all([
      productModel.getProducts({ paging, category }),
      productModel.countProducts({ category }),
    ]);
    const productIds = productsData?.map?.(mapId);
    const [images, variants] = await Promise.all([
      productImageModel.getProductImages(productIds),
      productVariantModel.getProductVariants(productIds),
    ]);
    const imagesObj = productImageModel.groupImages(images);
    const variantsObj = productVariantModel.groupVariants(variants);
    const products = productsData
      .map(mapImages(imagesObj))
      .map(mapVariants(variantsObj));
    res.json({
      data: products,
      ...(productModel.PAGE_COUNT * (paging + 1) < productsCount
        ? { next_paging: paging + 1 }
        : {}),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ data: [] });
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const id = Number(req.query.id);
    const productsData = await productModel.getProduct(id);
    const productIds = productsData?.map?.(mapId);
    const [images, variants] = await Promise.all([
      productImageModel.getProductImages(productIds),
      productVariantModel.getProductVariants(productIds),
    ]);
    const imagesObj = productImageModel.groupImages(images);
    const variantsObj = productVariantModel.groupVariants(variants);
    const products = productsData
      .map(mapImages(imagesObj))
      .map(mapVariants(variantsObj));
    res.json({
      data: products[0],
    });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    return res.status(500).json({ errors: "get products failed" });
  }
}

export async function searchProducts(req: Request, res: Response) {
  try {
    const paging = Number(req.query.paging) || 0;
    const keyword =
      typeof req.query.keyword === "string" ? req.query.keyword : "";
    const [productsData, productsCount] = await Promise.all([
      productModel.searchProducts({ paging, keyword }),
      productModel.countProducts({ keyword }),
    ]);
    const productIds = productsData?.map?.(mapId);
    const [images, variants] = await Promise.all([
      productImageModel.getProductImages(productIds),
      productVariantModel.getProductVariants(productIds),
    ]);
    const imagesObj = productImageModel.groupImages(images);
    const variantsObj = productVariantModel.groupVariants(variants);
    const products = productsData
      .map(mapImages(imagesObj))
      .map(mapVariants(variantsObj));
    res.json({
      data: products,
      ...(productModel.PAGE_COUNT * (paging + 1) < productsCount
        ? { next_paging: paging + 1 }
        : {}),
    });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    return res.status(500).json({ errors: "search products failed" });
  }
}

function generateImages(files: { [fieldname: string]: Express.Multer.File[] }) {
  const images = Object.values(files).reduce(
    (acc: Express.Multer.File[], value) => {
      if (Array.isArray(value)) {
        acc.push(...value);
      }
      return acc;
    },
    []
  );
  return images;
}

function isFilesObject(object: any): object is {
  [fieldname: string]: Express.Multer.File[];
} {
  return (
    typeof object === "object" && Object.values(object).every(Array.isArray)
  );
}

export async function checkFileType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (isFilesObject(req.files)) {
    const images = await Promise.all(
      generateImages(req.files).map(async (file) => {
        const fileType = await fileTypeFromBuffer(file.buffer);
        return { ...file, ...fileType };
      })
    );
    images.forEach((image) => {
      if (image.mime !== image.mimetype) {
        throw new Error("fake type");
      }
    });
    res.locals.images = images;
  }
  next();
}

export async function saveImagesToDisk(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (Array.isArray(res.locals.images) && res.locals.images.length > 0) {
      const images = await Promise.all(
        res.locals.images.map(
          (image) =>
            new Promise((resolve, reject) => {
              const __filename = fileURLToPath(import.meta.url);
              const __dirname = path.dirname(__filename);
              const filename = `${nanoid(12)}.${image.ext}`;
              const imagePath = path.join(
                __dirname,
                `../../uploads/${filename}`
              );
              fs.writeFile(imagePath, image.buffer, (err) => {
                if (err) {
                  reject(err);
                }
                resolve({ ...image, filename, path: `/uploads/${filename}` });
              });
            })
        )
      );
      res.locals.images = images;
    }
    next();
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    return res.status(500).json({ errors: "save images failed" });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const productId = await productModel.createProduct(req.body);
    if (typeof productId !== "number") {
      throw new Error("create product failed");
    }
    if (Array.isArray(res.locals.images) && res.locals.images.length > 0) {
      const productImageData = res.locals.images.map((image) => {
        return {
          productId,
          ...image,
        };
      });
      productImageModel.createProductImages(productImageData);
    }
    if (typeof req.body.color === "string" && req.body.color.length > 0) {
      await productVariantModel.createProductVariants([
        {
          productId,
          color: req.body.color,
          colorName: req.body.colorName,
          size: req.body.size,
          stock: req.body.stock,
        },
      ]);
    }
    if (Array.isArray(req.body.color) && req.body.color.length > 0) {
      const variants = req.body.color.map((color: string, index: number) => {
        return {
          productId,
          color,
          colorName: req.body.colorName[index],
          size: req.body.size[index],
          stock: req.body.stock[index],
        };
      });
      await productVariantModel.createProductVariants(variants);
    }
    res.status(200).json(productId);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "create product failed" });
  }
}
