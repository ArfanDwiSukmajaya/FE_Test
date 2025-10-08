// presentation/hooks/useGerbang.ts
import { useState, useCallback } from 'react';
import { GerbangEntity } from '../../domain/entities/Gerbang';
import { DIContainer } from '../../shared/container/DIContainer';
import { ErrorHandler } from '../../shared/utils/ErrorHandler';
import { PaginationParams } from '../../domain/repositories/GerbangRepository';

export interface UseGerbangReturn {
  gerbangs: GerbangEntity[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  };
  isLoading: boolean;
  error: string | null;
  fetchGerbangs: (params: PaginationParams, search?: string) => Promise<void>;
  createGerbang: (data: {
    IdCabang: number;
    NamaGerbang: string;
    NamaCabang: string;
  }) => Promise<void>;
  updateGerbang: (id: number, data: Partial<{
    IdCabang: number;
    NamaGerbang: string;
    NamaCabang: string;
  }>) => Promise<void>;
  deleteGerbang: (id: number, IdCabang: number) => Promise<void>;
  clearError: () => void;
}

export function useGerbang(): UseGerbangReturn {
  const [gerbangs, setGerbangs] = useState<GerbangEntity[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gerbangService = DIContainer.getInstance().getGerbangUseCase();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchGerbangs = useCallback(async (params: PaginationParams, search?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const filters = search ? { search } : {};
      const response = await gerbangService.getGerbangs(filters, params);

      setGerbangs(response.data?.data ?? []);
      setPagination({
        currentPage: response.data?.current_page ?? 1,
        totalPages: response.data?.total_pages ?? 1,
        totalRecords: response.data?.total_records ?? 0
      });
    } catch (err) {
      const appError = ErrorHandler.handleApiError(err);
      ErrorHandler.logError(appError);
      setError(ErrorHandler.getUserFriendlyMessage(appError));
    } finally {
      setIsLoading(false);
    }
  }, [gerbangService]);

  const createGerbang = useCallback(async (data: {
    IdCabang: number;
    NamaGerbang: string;
    NamaCabang: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await gerbangService.createGerbang(data);

      if (!response.success) {
        throw new Error(response.error || 'Gagal membuat gerbang');
      }
    } catch (err) {
      const appError = ErrorHandler.handleApiError(err);
      ErrorHandler.logError(appError);
      setError(ErrorHandler.getUserFriendlyMessage(appError));
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [gerbangService]);

  const updateGerbang = useCallback(async (id: number, data: Partial<{
    IdCabang: number;
    NamaGerbang: string;
    NamaCabang: string;
  }>) => {
    try {
      setIsLoading(true);
      setError(null);

      await gerbangService.updateGerbang(id, data);
    } catch (err) {
      const appError = ErrorHandler.handleApiError(err);
      ErrorHandler.logError(appError);
      setError(ErrorHandler.getUserFriendlyMessage(appError));
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [gerbangService]);

  const deleteGerbang = useCallback(async (id: number, IdCabang: number) => {
    try {
      setIsLoading(true);
      setError(null);

      await gerbangService.deleteGerbang(id, IdCabang);
    } catch (err) {
      const appError = ErrorHandler.handleApiError(err);
      ErrorHandler.logError(appError);
      setError(ErrorHandler.getUserFriendlyMessage(appError));
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [gerbangService]);

  return {
    gerbangs,
    pagination,
    isLoading,
    error,
    fetchGerbangs,
    createGerbang,
    updateGerbang,
    deleteGerbang,
    clearError
  };
}
