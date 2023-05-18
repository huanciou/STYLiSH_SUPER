import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { nanoid } from "nanoid";

export const uploadToBuffer = multer({ storage: multer.memoryStorage() });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagePath = path.join(__dirname, `../../uploads/`);

export const uploadToDisk = multer({
  storage: multer.diskStorage({
    destination(req, file, callback) {
      callback(null, imagePath);
    },
    filename(req, file, callback) {
      callback(null, `${nanoid(12)}.${path.extname(file.originalname)}`);
    },
  }),
});
