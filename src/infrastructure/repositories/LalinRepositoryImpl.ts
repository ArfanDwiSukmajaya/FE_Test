// infrastructure/repositories/LalinRepositoryImpl.ts
import { LalinEntity } from '../../domain/entities/Lalin';
import { LalinRepository, LalinFilters } from '../../domain/repositories/LalinRepository';
import { PaginationParams, PaginatedResponse } from '../../domain/repositories/GerbangRepository';
import { ApiClient } from '../api/ApiClient';

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: {
    rows: {
      rows: T[];
    };
    total_pages: number;
    current_page: number;
    total_records: number;
  };
}

export class LalinRepositoryImpl implements LalinRepository {
  constructor(private apiClient: ApiClient) { }

  async getLalinData(
    filters: LalinFilters,
    params: PaginationParams
  ): Promise<PaginatedResponse<LalinEntity>> {
    try {
      const searchParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
      });

      if (filters.tanggal) {
        searchParams.append('tanggal', filters.tanggal);
      }

      if (filters.search) {
        searchParams.append('search', filters.search);
      }

      const response = await this.apiClient.get(`/lalins?${searchParams.toString()}`);
      const data = response.data as ApiResponse<{
        Tanggal: string;
        IdCabang: number;
        IdGerbang: number;
        IdGardu: number;
        Golongan: number;
        Tunai: number;
        DinasOpr: number;
        DinasMitra: number;
        DinasKary: number;
        eFlo: number;
        eMandiri: number;
        eBri: number;
        eBni: number;
        eBca: number;
        eNobu: number;
        eDKI: number;
        eMega: number;
      }>;

      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch lalin data');
      }

      const lalinData = data.data.rows.rows.map(item => LalinEntity.fromApiResponse(item));

      return {
        data: lalinData,
        total_pages: data.data.total_pages,
        current_page: data.data.current_page,
        total_records: data.data.total_records
      };
    } catch (error) {
      throw new Error(`Failed to fetch lalin data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getGerbangData(): Promise<Array<{
    id: number;
    IdCabang: number;
    NamaGerbang: string;
    NamaCabang: string;
  }>> {
    try {
      const response = await this.apiClient.get(`/gerbangs`);

      if (!response.status) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data as ApiResponse<{
        id: number;
        IdCabang: number;
        NamaGerbang: string;
        NamaCabang: string;
      }>;

      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch gerbang data');
      }

      return data.data.rows.rows;
    } catch (error) {
      throw new Error(`Failed to fetch gerbang data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
