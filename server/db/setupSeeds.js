import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedsFolderPath = path.join(__dirname, `seeds`);

const targetFile = process.argv[2];

const seedsFiles = fs
  .readdirSync(seedsFolderPath)
  .filter((file) => path.extname(file) === ".js")
  .filter((file) => {
    if (!targetFile) return true;
    return file === targetFile;
  });

for (let file of seedsFiles) {
  await new Promise((resolve, reject) => {
    exec(
      `node ./${file} --trace-warnings`,
      {
        cwd: seedsFolderPath,
        env: process.env,
      },
      function (error, stdout, stderr) {
        if (error) {
          console.log("error:", error);
          reject();
          return;
        }
        if (stderr) {
          console.log("stderr:", stderr);
          return;
        }
        console.log("stdout:", stdout);
        resolve();
      }
    );
  });
}

console.log(`###### setup seeds done ######`);
process.exit();
