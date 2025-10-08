import { GerbangEntity } from '../entities/Gerbang';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total_pages: number;
  current_page: number;
  total_records: number;
}

export interface GerbangRepository {
  getAll(params: PaginationParams): Promise<PaginatedResponse<GerbangEntity>>;
  getById(id: number): Promise<GerbangEntity | null>;
  create(gerbang: Omit<GerbangEntity, 'id'>): Promise<GerbangEntity>;
  update(id: number, gerbang: Partial<GerbangEntity>): Promise<GerbangEntity>;
  delete(id: number, IdCabang: number): Promise<void>;
  search(query: string, params: PaginationParams): Promise<PaginatedResponse<GerbangEntity>>;
}
