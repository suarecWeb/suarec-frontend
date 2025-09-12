import { PublicationType } from "./publication.interface";

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: PublicationType;
  category?: string;
  categories?: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
