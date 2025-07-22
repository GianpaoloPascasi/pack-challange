import { Test, TestingModule } from "@nestjs/testing";
import { FilesService } from "./files.service";

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

  it("should upload file", () => {
    const f = {} as Express.Multer.File;
    const req = service.uploadFile(f);
    void expect(req).resolves.toBeTruthy();
  });
});
