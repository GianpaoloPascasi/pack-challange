import * as fs from "fs/promises";
import * as fsSync from "node:fs";
import * as path from "path";
import * as mime from "mime-types";

export async function createMulterFile(
  filePath: string,
): Promise<Express.Multer.File> {
  const buffer = await fs.readFile(filePath);
  const stats = await fs.stat(filePath);

  const multerFile: Express.Multer.File = {
    fieldname: "file",
    originalname: path.basename(filePath),
    encoding: "7bit",
    mimetype: mime.lookup(filePath) || "application/octet-stream",
    size: stats.size,
    destination: path.dirname(filePath),
    filename: path.basename(filePath),
    path: filePath,
    buffer: buffer,
    stream: fsSync.createReadStream(filePath),
  };

  return multerFile;
}
