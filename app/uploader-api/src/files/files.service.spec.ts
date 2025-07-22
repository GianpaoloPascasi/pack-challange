import { Test, TestingModule } from "@nestjs/testing";
import { FilesService } from "./files.service";
import { createMulterFile } from "../utils/create-multer-file";

describe("FilesService", () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should validate a jpg pristine file", async () => {
    const file = await createMulterFile(
      `${__dirname}../../../test_files/clippy.jpg`,
    );
    const res = service.validateUploadedFile(file);
    expect(res).toBe(true);
  });

  it("should not validate a pdf with jpg signature", async () => {
    const file = await createMulterFile(
      `${__dirname}../../../test_files/clippy.pdf`,
    );
    const res = service.validateUploadedFile(file);
    expect(res).toBe(false);
  });

  it("should upload file", async () => {
    const f = {} as Express.Multer.File;
    const req = service.uploadFile(f);
    await expect(req).resolves.toBeTruthy();
  });
});
