import { Generated } from "kysely";

export interface File {
  id: Generated<number>;
  title: string;
  description: string;
  category: number;
  language: number;
  provider: number;
  roles: number[];
  file: string;
  mimeType: string;
}
