import { CreateFileDTO } from "../dto/create-file.dto";

export function validateCreateFileDTO(data: CreateFileDTO) {
  if (
    data.category &&
    data.description &&
    data.title &&
    data.language &&
    data.uploaded_by &&
    data.roles &&
    Array.isArray(data.roles) &&
    data.provider
  ) {
    return true;
  }
  return false;
}
