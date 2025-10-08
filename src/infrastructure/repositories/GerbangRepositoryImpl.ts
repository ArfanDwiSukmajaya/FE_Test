// infrastructure/repositories/GerbangRepositoryImpl.ts
import { GerbangEntity } from '../../domain/entities/Gerbang';
import { GerbangRepository, PaginationParams, PaginatedResponse } from '../../domain/repositories/GerbangRepository';
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

export class GerbangRepositoryImpl implements GerbangRepository {
  constructor(private apiClient: ApiClient) { }

  async getAll(params: PaginationParams, search?: string): Promise<PaginatedResponse<GerbangEntity>> {
    try {
      let url = `/gerbangs?page=${params.page}&limit=${params.limit}`;

      // Add search parameter if provided
      if (search && search.trim()) {
        url += `&NamaGerbang=${encodeURIComponent(search.trim())}`;
      }

      const response = await this.apiClient.get(url);

      const data = response.data as ApiResponse<{
        id: number;
        IdCabang: number;
        NamaGerbang: string;
        NamaCabang: string;
      }>;

      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch gerbangs');
      }

      const gerbangs = data.data.rows.rows.map(item => GerbangEntity.fromApiResponse(item));

      return {
        data: gerbangs,
        total_pages: data.data.total_pages,
        current_page: data.data.current_page,
        total_records: data.data.total_records
      };
    } catch (error) {
      throw new Error(`Failed to fetch gerbangs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getById(id: number): Promise<GerbangEntity | null> {
    try {
      const response = await this.apiClient.get(`/gerbangs/${id}`);

      if (response.status === 404) {
        return null;
      }

      if (response.status >= 400) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data as {
        id: number;
        IdCabang: number;
        NamaGerbang: string;
        NamaCabang: string;
      };

      return GerbangEntity.fromApiResponse(data);
    } catch (error) {
      throw new Error(`Failed to fetch gerbang: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async create(gerbang: GerbangEntity): Promise<GerbangEntity> {
    try {
      const response = await this.apiClient.post('/gerbangs/', {
        id: gerbang.id,
        IdCabang: gerbang.IdCabang,
        NamaGerbang: gerbang.NamaGerbang,
        NamaCabang: gerbang.NamaCabang,
      });

      if (response.status >= 400) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data as {
        id: number;
        IdCabang: number;
        NamaGerbang: string;
        NamaCabang: string;
      };
      return GerbangEntity.fromApiResponse(data);
    } catch (error) {
      throw new Error(`Failed to create gerbang: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(id: number, gerbang: Partial<GerbangEntity>): Promise<GerbangEntity> {
    try {
      const response = await this.apiClient.put('/gerbangs/', {
        id,
        IdCabang: gerbang.IdCabang,
        NamaGerbang: gerbang.NamaGerbang,
        NamaCabang: gerbang.NamaCabang,
      });

      if (response.status >= 400) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data as {
        id: number;
        IdCabang: number;
        NamaGerbang: string;
        NamaCabang: string;
      };
      return GerbangEntity.fromApiResponse(data);
    } catch (error) {
      throw new Error(`Failed to update gerbang: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: number, IdCabang: number): Promise<void> {
    try {
      const response = await this.apiClient.delete('/gerbangs/', { id, IdCabang });

      if (response.status >= 400) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Failed to delete gerbang: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(query: string, params: PaginationParams): Promise<PaginatedResponse<GerbangEntity>> {
    try {
      const allData = await this.getAll({ page: 1, limit: 1000 });

      const filteredData = allData.data.filter(gerbang =>
        gerbang.NamaGerbang.toLowerCase().includes(query.toLowerCase()) ||
        gerbang.NamaCabang.toLowerCase().includes(query.toLowerCase())
      );

      const startIndex = (params.page - 1) * params.limit;
      const endIndex = startIndex + params.limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filteredData.length / params.limit);

      return {
        data: paginatedData,
        total_pages: totalPages,
        current_page: params.page,
        total_records: filteredData.length
      };
    } catch (error) {
      throw new Error(`Failed to search gerbangs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
