import { Category } from "./category.interface";
import { Language } from "./language.interface";

export interface FileStats {
  byLanguage: {
    language: Language | null;
    filesCountForLanguage: number;
  }[];
  byCategory: {
    category: Category | null;
    filesCountForCategory: number;
  }[];
  totalFilesCount: number;
}
