import { Injectable } from "@nestjs/common";
import * as fs from "fs/promises";
import { InvalidFileError } from "./invalid-file-error";
import { db } from "../utils/db";
import { CreateFileDTO } from "./dto/create-file.dto";
import { File } from "./interfaces/file.interface";

const JPEG_JPG_SIGNATURES = [
  [0xff, 0xd8, 0xff, 0xdb],
  [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01],
  [0xff, 0xd8, 0xff, 0xee],
];
@Injectable()
export class FilesService {
  async uploadAndCreateFile(file: Express.Multer.File, data: CreateFileDTO) {
    const fileUrl = await this.uploadFile(file);
    return await this.createFile(data, fileUrl, file.mimetype);
  }

  async createFile(data: CreateFileDTO, fileUrl: string, mimeType: string) {
    const res = await db
      .insertInto("files")
      .values({
        category: data.category,
        description: data.description,
        file: fileUrl,
        language: data.language,
        mimeType: mimeType,
        title: data.title,
        provider: data.provider,
        roles: data.roles,
      })
      .returning(["id"])
      .executeTakeFirstOrThrow();
    return {
      category: data.category,
      description: data.description,
      file: fileUrl,
      language: data.language,
      mimeType: mimeType,
      title: data.title,
      provider: data.provider,
      roles: data.roles,
      id: res.id as unknown,
    } as File;
  }

  async uploadFile(file: Express.Multer.File) {
    if (!this.validateUploadedFile(file)) {
      throw new InvalidFileError();
    }
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

  async getAllFiles(page: number, itemsPerPage: number) {
    const res = await db
      .selectFrom("files")
      .selectAll()
      .limit(itemsPerPage)
      .offset(page * itemsPerPage)
      .execute();
    return res;
  }
  async getFileById(id: number) {
    const res = await db
      .selectFrom("files")
      .selectAll()
      .where("id", "=", id)
      .execute();
    return res;
  }
  async getStats() {}
}
