import express, { Router } from "express";
import cookieParser from "cookie-parser";
import productRouter from "./routes/product.js";
import userRouter from "./routes/user.js";
import campaignRouter from "./routes/campaign.js";
import orderRouter from "./routes/order.js";
import reportRouter from "./routes/report.js";
import branch from "./middleware/branch.js";
import authenticate from "./middleware/authenticate.js";
import authorization from "./middleware/authorization.js";
import rateLimiter from "./middleware/rateLimiter.js";
import { errorHandler } from "./utils/errorHandler.js";

const app = express();
const port = 3000;

app.use(cookieParser());

app.enable('trust proxy');

const router = Router();

router.use(function (req, res, next) {
  next();
});

app.use(express.json());

app.use("/api", rateLimiter, [
  productRouter,
  userRouter,
  campaignRouter,
  orderRouter,
  reportRouter,
]);

app.use(
  branch(
    (req) => req.path.includes("/admin"),
    [authenticate, authorization("admin")]
  ),
  express.static("../client")
);

app.use("/uploads", express.static("./uploads"));
app.use("/assets", express.static("./assets"));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`STYLiSH listening on port ${port}`);
});
