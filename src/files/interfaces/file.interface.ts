import { Generated } from "kysely";

export interface File {
  id: Generated<number> | number;
  title: string;
  description: string;
  category: number;
  language: number;
  provider: number;
  file: string;
  mimetype: string;
  uploaded_by: number;
}
