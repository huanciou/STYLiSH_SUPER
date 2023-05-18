import { Router } from "express";
import { payment, paymentAsync } from "../controllers/report.js";
import authenticate from "../middleware/authenticate.js";
import authorization from "../middleware/authorization.js";

const router = Router();

router
  .route("/v1/report/payments")
  .get(authenticate, authorization("admin"), payment);

router
  .route("/v2/report/payments")
  .get(authenticate, authorization("admin"), paymentAsync);

export default router;
