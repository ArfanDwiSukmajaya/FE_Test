// application/use-cases/GerbangUseCase.ts
import { GerbangEntity } from '../../domain/entities/Gerbang';
import { GerbangRepository, PaginationParams, PaginatedResponse } from '../../domain/repositories/GerbangRepository';
import { ErrorHandler } from '../../shared/utils/ErrorHandler';
import { ValidationUtils } from '../../shared/utils/ValidationUtils';

export interface GerbangUseCaseResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GerbangFilters {
  search?: string;
}

export class GerbangUseCase {
  constructor(private gerbangRepository: GerbangRepository) { }

  async getGerbangs(
    filters: GerbangFilters = {},
    pagination: PaginationParams
  ): Promise<GerbangUseCaseResult<PaginatedResponse<GerbangEntity>>> {
    try {
      // Sanitize search input
      if (filters.search) {
        filters.search = ValidationUtils.sanitizeString(filters.search);
      }

      const result = await this.gerbangRepository.getAll(pagination);

      // Apply search filter if provided
      if (filters.search) {
        const filteredData = result.data.filter(gerbang =>
          gerbang.NamaGerbang.toLowerCase().includes(filters.search!.toLowerCase()) ||
          gerbang.NamaCabang.toLowerCase().includes(filters.search!.toLowerCase())
        );

        return {
          success: true,
          data: {
            ...result,
            data: filteredData
          }
        };
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);

      return {
        success: false,
        error: ErrorHandler.getUserFriendlyMessage(appError)
      };
    }
  }

  async getGerbangById(id: number): Promise<GerbangUseCaseResult<GerbangEntity>> {
    try {
      if (!id || id <= 0) {
        return {
          success: false,
          error: 'ID Gerbang tidak valid'
        };
      }

      const gerbang = await this.gerbangRepository.getById(id);

      if (!gerbang) {
        return {
          success: false,
          error: 'Gerbang tidak ditemukan'
        };
      }

      return {
        success: true,
        data: gerbang
      };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);

      return {
        success: false,
        error: ErrorHandler.getUserFriendlyMessage(appError)
      };
    }
  }

  async createGerbang(gerbangData: {
    IdCabang: number;
    NamaGerbang: string;
    NamaCabang: string;
  }): Promise<GerbangUseCaseResult<GerbangEntity>> {
    try {
      // Validate input
      const validationErrors = this.validateGerbangData(gerbangData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: validationErrors.join(', ')
        };
      }

      // Sanitize input
      const sanitizedData = {
        IdCabang: gerbangData.IdCabang,
        NamaGerbang: ValidationUtils.sanitizeString(gerbangData.NamaGerbang),
        NamaCabang: ValidationUtils.sanitizeString(gerbangData.NamaCabang)
      };

      const gerbang = GerbangEntity.create(0, sanitizedData.IdCabang, sanitizedData.NamaGerbang, sanitizedData.NamaCabang);

      // Additional validation
      const entityValidationErrors = gerbang.validate();
      if (entityValidationErrors.length > 0) {
        return {
          success: false,
          error: entityValidationErrors.join(', ')
        };
      }

      const createdGerbang = await this.gerbangRepository.create(gerbang);

      return {
        success: true,
        data: createdGerbang
      };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);

      return {
        success: false,
        error: ErrorHandler.getUserFriendlyMessage(appError)
      };
    }
  }

  async updateGerbang(
    id: number,
    gerbangData: Partial<{
      IdCabang: number;
      NamaGerbang: string;
      NamaCabang: string;
    }>
  ): Promise<GerbangUseCaseResult<GerbangEntity>> {
    try {
      if (!id || id <= 0) {
        return {
          success: false,
          error: 'ID Gerbang tidak valid'
        };
      }

      // Sanitize input
      const sanitizedData = { ...gerbangData };
      if (sanitizedData.NamaGerbang) {
        sanitizedData.NamaGerbang = ValidationUtils.sanitizeString(sanitizedData.NamaGerbang);
      }
      if (sanitizedData.NamaCabang) {
        sanitizedData.NamaCabang = ValidationUtils.sanitizeString(sanitizedData.NamaCabang);
      }

      const updatedGerbang = await this.gerbangRepository.update(id, sanitizedData);

      return {
        success: true,
        data: updatedGerbang
      };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);

      return {
        success: false,
        error: ErrorHandler.getUserFriendlyMessage(appError)
      };
    }
  }

  async deleteGerbang(id: number, IdCabang: number): Promise<GerbangUseCaseResult<void>> {
    try {
      if (!id || id <= 0) {
        return {
          success: false,
          error: 'ID Gerbang tidak valid'
        };
      }

      if (!IdCabang || IdCabang <= 0) {
        return {
          success: false,
          error: 'ID Cabang tidak valid'
        };
      }

      await this.gerbangRepository.delete(id, IdCabang);

      return {
        success: true
      };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);

      return {
        success: false,
        error: ErrorHandler.getUserFriendlyMessage(appError)
      };
    }
  }

  private validateGerbangData(data: {
    IdCabang: number;
    NamaGerbang: string;
    NamaCabang: string;
  }): string[] {
    const errors: string[] = [];

    if (!data.NamaGerbang || data.NamaGerbang.trim().length === 0) {
      errors.push('Nama Gerbang tidak boleh kosong');
    }

    if (!data.NamaCabang || data.NamaCabang.trim().length === 0) {
      errors.push('Nama Cabang tidak boleh kosong');
    }

    if (data.IdCabang <= 0) {
      errors.push('ID Cabang harus lebih dari 0');
    }

    if (data.NamaGerbang && data.NamaGerbang.length < 3) {
      errors.push('Nama Gerbang minimal 3 karakter');
    }

    if (data.NamaCabang && data.NamaCabang.length < 3) {
      errors.push('Nama Cabang minimal 3 karakter');
    }

    return errors;
  }
}
