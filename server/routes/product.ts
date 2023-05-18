import { Router } from "express";
import { param, query } from "express-validator";
import {
  getProducts,
  getProduct,
  searchProducts,
  createProduct,
  checkFileType,
  saveImagesToDisk,
} from "../controllers/product.js";
import { uploadToBuffer } from "../middleware/multer.js";
import * as validator from "../middleware/validator.js";

const router = Router();

router.route("/products").get(getProducts);

router
  .route("/products/search")
  .get(
    query("keyword").not().isEmpty().trim(),
    query("paging").if(query("paging").exists()).isInt(),
    validator.handleResult,
    searchProducts
  );

router
  .route("/products/details")
  .get(query("id").not().isEmpty().trim(), validator.handleResult, getProduct);

router
  .route("/products/:category")
  .get(
    param("category").isIn(["all", "men", "women", "accessories"]),
    query("paging").if(query("paging").exists()).isInt(),
    validator.handleResult,
    getProducts
  );

router.route("/product").post(
  uploadToBuffer.fields([
    { name: "main_image", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  checkFileType,
  saveImagesToDisk,
  createProduct
);

export default router;
