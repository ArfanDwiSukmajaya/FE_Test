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

const MIN_NAME_LENGTH = 3;
const MIN_ID_VALUE = 1;

export class GerbangUseCase {
  constructor(private gerbangRepository: GerbangRepository) { }

  async getGerbangs(
    filters: GerbangFilters = {},
    pagination: PaginationParams
  ): Promise<GerbangUseCaseResult<PaginatedResponse<GerbangEntity>>> {
    try {
      let searchTerm = filters.search;
      if (searchTerm) {
        searchTerm = ValidationUtils.sanitizeString(searchTerm);
      }

      const result = await this.gerbangRepository.getAll(pagination, searchTerm);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getGerbangById(id: number): Promise<GerbangUseCaseResult<GerbangEntity>> {
    try {
      const idError = this.validateId(id, 'ID Gerbang');
      if (idError) {
        return {
          success: false,
          error: idError
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
      return this.handleError(error);
    }
  }

  async createGerbang(gerbangData: {
    id: number;
    IdCabang: number;
    NamaGerbang: string;
    NamaCabang: string;
  }): Promise<GerbangUseCaseResult<GerbangEntity>> {
    try {
      const validationErrors = this.validateGerbangData(gerbangData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: validationErrors.join(', ')
        };
      }

      const sanitizedData = {
        id: gerbangData.id,
        IdCabang: gerbangData.IdCabang,
        NamaGerbang: ValidationUtils.sanitizeString(gerbangData.NamaGerbang),
        NamaCabang: ValidationUtils.sanitizeString(gerbangData.NamaCabang)
      };

      const gerbang = GerbangEntity.create(sanitizedData.id, sanitizedData.IdCabang, sanitizedData.NamaGerbang, sanitizedData.NamaCabang);

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
      return this.handleError(error);
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
      const idError = this.validateId(id, 'ID Gerbang');
      if (idError) {
        return {
          success: false,
          error: idError
        };
      }

      const validationData = {
        IdCabang: gerbangData.IdCabang || 0,
        NamaGerbang: gerbangData.NamaGerbang || '',
        NamaCabang: gerbangData.NamaCabang || ''
      };

      const validationErrors = this.validateGerbangData(validationData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: validationErrors.join(', ')
        };
      }

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
      return this.handleError(error);
    }
  }

  async deleteGerbang(id: number, IdCabang: number): Promise<GerbangUseCaseResult<void>> {
    try {
      const idError = this.validateId(id, 'ID Gerbang');
      if (idError) {
        return {
          success: false,
          error: idError
        };
      }

      const cabangIdError = this.validateId(IdCabang, 'ID Cabang');
      if (cabangIdError) {
        return {
          success: false,
          error: cabangIdError
        };
      }

      await this.gerbangRepository.delete(id, IdCabang);

      return {
        success: true
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: unknown): GerbangUseCaseResult<never> {
    const appError = ErrorHandler.handleApiError(error);
    ErrorHandler.logError(appError);

    return {
      success: false,
      error: ErrorHandler.getUserFriendlyMessage(appError)
    };
  }

  private validateId(id: number, fieldName: string = 'ID'): string | null {
    if (!id || id < MIN_ID_VALUE) {
      return `${fieldName} tidak valid`;
    }
    return null;
  }

  private validateNameField(value: string, fieldName: string): string[] {
    const errors: string[] = [];

    if (!value || value.trim().length === 0) {
      errors.push(`${fieldName} tidak boleh kosong`);
    } else if (value.length < MIN_NAME_LENGTH) {
      errors.push(`${fieldName} minimal ${MIN_NAME_LENGTH} karakter`);
    }

    return errors;
  }

  private validateGerbangData(data: {
    IdCabang: number;
    NamaGerbang: string;
    NamaCabang: string;
  }): string[] {
    const errors: string[] = [];

    errors.push(...this.validateNameField(data.NamaGerbang, 'Nama Gerbang'));
    errors.push(...this.validateNameField(data.NamaCabang, 'Nama Cabang'));

    if (data.IdCabang < MIN_ID_VALUE) {
      errors.push('ID Cabang harus lebih dari 0');
    }

    return errors;
  }
}
