import { Router } from "express";
import { param, query } from "express-validator";
import { getProducts, getProduct, createProduct, checkFileType, saveImagesToDisk, recommendProduct, } from "../controllers/product.js";
import { searchProductsId } from "../controllers/search.js";
import { uploadToBuffer } from "../middleware/multer.js";
import * as validator from "../middleware/validator.js";
import whoRU from "../middleware/whoRU.js";
const router = Router();
router.route("/products").get(getProducts);
router
    .route("/products/search")
    .get(query("keyword").not().isEmpty().trim(), query("paging").if(query("paging").exists()).isInt(), query("category").if(query("category").exists()).isString(), validator.handleResult, searchProductsId);
router
    .route("/products/details")
    .get(query("id").not().isEmpty().trim(), validator.handleResult, whoRU, getProduct);
router
    .route("/products/:category")
    .get(param("category").isIn(["all", "men", "women", "accessories"]), query("paging").if(query("paging").exists()).isInt(), validator.handleResult, getProducts);
////
// router.route("/pd").post(
//   (req: Request, res: Response, next: NextFunction) => {
//     uploadProductsToElasticSearch(req.body);
//     next();
//   },
//   (req: Request, res: Response) => {
//     res.send("upload");
//   }
// );
////
router.route("/product").post(uploadToBuffer.fields([
    { name: "main_image", maxCount: 1 },
    { name: "images", maxCount: 5 },
]), checkFileType, saveImagesToDisk, createProduct);
router.route("/products/recommendation").get(whoRU, recommendProduct);
export default router;
