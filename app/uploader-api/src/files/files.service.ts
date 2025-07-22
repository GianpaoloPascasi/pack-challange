import { Injectable } from "@nestjs/common";
import fs from "fs/promises";

const JPEG_JPG_SIGNATURES = [
  [0xff, 0xd8, 0xff, 0xdb],
  [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01],
  [0xff, 0xd8, 0xff, 0xee],
];
@Injectable()
export class FilesService {
  async uploadFile(file: Express.Multer.File) {
    const fileName = `${Date.now()}.${file.mimetype.split("/").at(-1)}`;
    await fs.writeFile(fileName, file.buffer);
    return fileName;
  }

  validateUploadedFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = [
      {
        mimetype: "application/pdf",
        signatures: [[0x25, 0x50, 0x44, 0x46, 0x2d]],
      },
      { mimetype: "text/plain", signatures: [[0xef, 0xbb, 0xbf]] },
      {
        mimetype: "image/png",
        signatures: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
      },
      { mimetype: "image/jpeg", signatures: JPEG_JPG_SIGNATURES },
      { mimetype: "image/jpg", signatures: JPEG_JPG_SIGNATURES },
      {
        mimetype: "video/mp4",
        signatures: [[0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]],
      },
    ];

    if (!file) {
      return false;
    }

    const mimeType = allowedMimeTypes.find((e) => e.mimetype == file.mimetype);

    if (!mimeType) {
      return false;
    }
    const maxSize = 4000 * 1024 * 1024; // 4GB
    if (file.size > maxSize) {
      return false;
    }

    let validSignature = false;
    for (const signature of mimeType.signatures) {
      const expectedSignature = Buffer.from(signature); // "%PDF"
      const actualSignature = file.buffer?.subarray(
        0,
        expectedSignature.length,
      );
      if (actualSignature && actualSignature.equals(expectedSignature)) {
        validSignature = true;
      }
    }

    if (!validSignature) {
      return false;
    }

    return true;
  }
}
