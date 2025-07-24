import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateFileDTO } from "./dto/create-file.dto";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { File } from "./interfaces/file.interface";
import { DatabaseService } from "../database/database.service";
import { FileStats } from "./interfaces/file-stats.interface";
import { sql } from "kysely";
import {
  GetObjectCommand,
  GetObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";

const JPEG_JPG_SIGNATURES = [
  [0xff, 0xd8, 0xff, 0xdb],
  [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01],
  [0xff, 0xd8, 0xff, 0xee],
];
@Injectable()
export class FilesService {
  private s3Client: S3Client;

  constructor(private dbService: DatabaseService) {
    this.s3Client = new S3Client({});
  }

  async uploadAndCreateFile(
    file: Express.Multer.File,
    data: CreateFileDTO,
    userId: number,
  ): Promise<CreateFileDTO> {
    const fileUrl = await this.uploadFile(file);
    return await this.createFile(data, fileUrl, file.mimetype, userId);
  }

  async createFile(
    data: CreateFileDTO,
    fileUrl: string,
    mimetype: string,
    userId: number,
  ): Promise<CreateFileDTO> {
    const res = await this.dbService
      .getDb()
      .insertInto("files")
      .values({
        category: data.category,
        description: data.description,
        file: fileUrl,
        language: data.language,
        mimetype: mimetype,
        title: data.title,
        provider: data.provider,
        uploaded_by: userId,
      })
      .returning([
        "id",
        "category",
        "description",
        "file",
        "language",
        "mimetype",
        "provider",
        "title",
        "uploaded_by",
      ])
      .executeTakeFirstOrThrow();

    const roles = await this.dbService
      .getDb()
      .insertInto("files_roles")
      .values(data.roles.map((e) => ({ file_id: res.id, role_id: e })))
      .returning("role_id")
      .execute();

    return {
      ...res,
      roles: roles.map((e) => e.role_id),
      file: fileUrl,
      mimetype: mimetype,
    };
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

    const mimetype = allowedMimeTypes.find((e) => e.mimetype == file.mimetype);

    if (!mimetype) {
      return false;
    }
    const maxSize = 4000 * 1024 * 1024; // 4GB
    if (file.size > maxSize) {
      return false;
    }

    let validSignature = false;
    for (const signature of mimetype.signatures) {
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

  async uploadFile(file: Express.Multer.File) {
    if (!this.validateUploadedFile(file)) {
      throw new BadRequestException("Invalid_file");
    }
    const fileName = `${file.originalname.split(".").at(0)}_${Date.now()}.${file.mimetype.split("/").at(-1)}`;

    const upload = new Upload({
      params: {
        Bucket: process.env.BUCKET_NAME ?? Resource.PackMultimediaBucket.name,
        ContentType: file.mimetype,
        Key: fileName,
        Body: file.buffer,
      },
      client: this.s3Client,
    });

    await upload.done();

    return fileName;
  }

  async readFile(url: string): Promise<string> {
    // if (!fs.existsSync(url)) {
    //   throw new NotFoundException();
    // }
    // const file = fs.createReadStream(url);
    const params: GetObjectCommandInput = {
      Bucket: process.env.BUCKET_NAME ?? Resource.PackMultimediaBucket.name,
      Key: url,
    };

    const command = new GetObjectCommand(params);
    const res = await this.s3Client.send(command);

    if (!res.Body) {
      throw new NotFoundException();
    }

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });
    // const stream = res.Body.transformToWebStream();
    return signedUrl;
  }

  async getAllFiles(page: number, itemsPerPage: number): Promise<File[]> {
    if (!page) {
      page = 1;
    }
    if (!itemsPerPage) {
      itemsPerPage = 10;
    }
    const res = await this.dbService
      .getDb()
      .selectFrom("files")
      .select((eb) => [
        "id",
        "category",
        "description",
        "file",
        "language",
        "mimetype",
        "provider",
        "title",
        "uploaded_by",
        jsonArrayFrom(
          eb
            .selectFrom("files_roles")
            .select("role_id")
            .whereRef("files_roles.file_id", "=", "files.id"),
        ).as("roles"),
      ])
      .limit(itemsPerPage)
      .offset((page - 1) * itemsPerPage)
      .execute();
    return res;
  }

  async downloadFileById(id: number): Promise<string> {
    const res = await this.dbService
      .getDb()
      .selectFrom("files")
      .select(["file"])
      .where("id", "=", id)
      .executeTakeFirstOrThrow();
    return await this.readFile(res?.file);
  }

  async getStats(): Promise<FileStats> {
    const byLanguage = await this.dbService
      .getDb()
      .selectFrom("files")
      .select((eb) => [
        sql<number>`COUNT(*)`.as("filesCountForLanguage"),
        jsonObjectFrom(
          eb
            .selectFrom("languages")
            .select(["languages.id", "languages.name"])
            .whereRef("files.language", "=", "languages.id"),
        ).as("language"),
      ])
      .groupBy(["files.language"])
      .execute();

    const byCategory = await this.dbService
      .getDb()
      .selectFrom("files")
      .select((eb) => [
        sql<number>`COUNT(*)`.as("filesCountForCategory"),
        jsonObjectFrom(
          eb
            .selectFrom("categories")
            .select(["categories.id", "categories.name"])
            .whereRef("files.category", "=", "categories.id"),
        ).as("category"),
      ])
      .groupBy(["files.category"])
      .execute();

    const totalFilesCount = await this.dbService
      .getDb()
      .selectFrom("files")
      .select(() => [sql<number>`COUNT(*)`.as("count")])
      .executeTakeFirst();

    return {
      byCategory,
      byLanguage,
      totalFilesCount: totalFilesCount?.count ?? 0,
    };
  }

  async fileMetaById(id: number): Promise<File> {
    const res = await this.dbService
      .getDb()
      .selectFrom("files")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirstOrThrow();
    return res;
  }
}
