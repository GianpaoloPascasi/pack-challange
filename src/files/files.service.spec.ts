import { Test, TestingModule } from "@nestjs/testing";
import { FilesService } from "./files.service";
import { createMulterFile } from "../utils/create-multer-file";
import { DatabaseService } from "../database/database.service";

describe("FilesService", () => {
  let service: FilesService;
  const testFilesDir = `${__dirname}/../../test/fixtures`;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService, DatabaseService],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should validate a jpg pristine file", async () => {
    const file = await createMulterFile(`${testFilesDir}/clippy.jpg`);
    const res = service.validateUploadedFile(file);
    expect(res).toBe(true);
  });

  it("should not validate a pdf with jpg signature", async () => {
    const file = await createMulterFile(`${testFilesDir}/clippy.pdf`);
    const res = service.validateUploadedFile(file);
    expect(res).toBe(false);
  });
});
