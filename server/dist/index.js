import express, { Router } from "express";
import cookieParser from "cookie-parser";
import productRouter from "./routes/product.js";
import userRouter from "./routes/user.js";
import campaignRouter from "./routes/campaign.js";
import orderRouter from "./routes/order.js";
import reportRouter from "./routes/report.js";
import branch from "./middleware/branch.js";
import authenticate from "./middleware/authenticate.js";
import rateLimiter from "./middleware/rateLimiter.js";
import { errorHandler } from "./utils/errorHandler.js";
import morganBody from 'morgan-body';
import fs from 'fs';
import './models/mongo.js';
const app = express();
const port = 5000;
app.use(cookieParser());
app.enable('trust proxy');
const router = Router();
router.use(function (req, res, next) {
    next();
});
app.use(express.json());
// log
const log = fs.createWriteStream('./logs/morganBody/morganBody.log', { flags: "a" });
morganBody(app, {
    noColors: true,
    stream: log,
});
app.use("/api", rateLimiter, [
    productRouter,
    userRouter,
    campaignRouter,
    orderRouter,
    reportRouter,
]);
app.use(branch((req) => req.path.includes("/admin"), [authenticate]), express.static("../client"));
app.use("/uploads", express.static("./uploads"));
app.use("/assets", express.static("./assets"));
app.use(errorHandler);
app.listen(port, () => {
    console.log(`STYLiSH listening on port ${port}`);
});
const outputLogStream = fs.createWriteStream('./logs/console/console.log', { flags: 'a' });
if (process.env.SERVER_STATUS === 'production') {
    const originalConsoleLog = console.log;
    console.log = (...args) => {
        const message = args.join(' ');
        outputLogStream.write(message + '\n');
        originalConsoleLog(...args);
    };
    const originalConsoleError = console.error;
    console.error = (...args) => {
        const message = args.join(' ');
        outputLogStream.write(`[ERROR] ${message}\n`);
        for (const arg of args) {
            if (arg instanceof Error) {
                outputLogStream.write(`[ERROR Stack Trace] ${arg.stack}\n`);
            }
        }
        originalConsoleError(...args);
    };
}
