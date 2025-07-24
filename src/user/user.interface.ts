import { Generated } from "kysely";

export interface User {
  id: number | Generated<number>;
  username: string;
  password: string;
}
