export class CreateFileDTO {
  title: string;
  description: string;
  category: number;
  language: number;
  provider: number;
  roles: number[];
  file?: string;
  id?: number;
  mimetype?: string;
  uploaded_by: number;
}
