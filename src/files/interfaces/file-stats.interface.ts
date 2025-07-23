import { Category } from "./category.interface";

export interface FileStats {
  filesByCategory: {
    category: Category;
    filesCout: number;
  }[];
  filesCount: number;
}
