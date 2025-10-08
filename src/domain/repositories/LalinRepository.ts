import { LalinEntity } from '../entities/Lalin';
import { PaginationParams, PaginatedResponse } from './GerbangRepository';

export interface LalinFilters {
  tanggal?: string;
  search?: string;
}

export interface LalinRepository {
  getLalinData(
    filters: LalinFilters,
    params: PaginationParams
  ): Promise<PaginatedResponse<LalinEntity>>;

  getGerbangData(): Promise<Array<{
    id: number;
    IdCabang: number;
    NamaGerbang: string;
    NamaCabang: string;
  }>>;
}
