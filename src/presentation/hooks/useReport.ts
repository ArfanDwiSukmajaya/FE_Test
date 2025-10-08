// presentation/hooks/useReport.ts
import { useState, useCallback } from 'react';
import { DIContainer } from '../../shared/container/DIContainer';
import { ErrorHandler } from '../../shared/utils/ErrorHandler';
import { PaymentMethod } from '../../domain/value-objects/PaymentMethod';
import { ProcessedReportData, ReportFilters } from '../../application/use-cases/ReportUseCase';
import { PaginationParams } from '../../domain/repositories/GerbangRepository';

export interface UseReportReturn {
  reportData: ProcessedReportData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  };
  isLoading: boolean;
  error: string | null;
  activePaymentMethod: PaymentMethod;
  fetchReportData: (filters: ReportFilters, params: PaginationParams) => Promise<void>;
  setActivePaymentMethod: (method: PaymentMethod) => void;
  exportToPDF: () => Promise<void>;
  clearError: () => void;
}

export function useReport(): UseReportReturn {
  const [reportData, setReportData] = useState<ProcessedReportData[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePaymentMethod, setActivePaymentMethod] = useState<PaymentMethod>(
    new PaymentMethod('Tunai')
  );
  const [currentFilters, setCurrentFilters] = useState<ReportFilters>({});
  // const [currentParams] = useState<PaginationParams>({ page: 1, limit: 10 });

  const reportService = DIContainer.getInstance().getReportUseCase();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchReportData = useCallback(async (filters: ReportFilters, params: PaginationParams) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await reportService.getReportData(filters, params);

      setReportData(response.data?.data || []);
      setPagination({
        currentPage: response.data?.currentPage || 1,
        totalPages: response.data?.totalPages || 1,
        totalRecords: response.data?.data?.length || 0
      });

      // Store current filters and params for export
      setCurrentFilters(filters);
      // setCurrentParams(params);  
    } catch (err) {
      const appError = ErrorHandler.handleApiError(err);
      ErrorHandler.logError(appError);
      setError(ErrorHandler.getUserFriendlyMessage(appError));
    } finally {
      setIsLoading(false);
    }
  }, [reportService]);

  const exportToPDF = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await reportService.exportToPDF(reportData, currentFilters, activePaymentMethod);
    } catch (err) {
      const appError = ErrorHandler.handleApiError(err);
      ErrorHandler.logError(appError);
      setError(ErrorHandler.getUserFriendlyMessage(appError));
    } finally {
      setIsLoading(false);
    }
  }, [reportService, reportData, currentFilters, activePaymentMethod]);

  const handleSetActivePaymentMethod = useCallback((method: PaymentMethod) => {
    setActivePaymentMethod(method);
  }, []);

  return {
    reportData,
    pagination,
    isLoading,
    error,
    activePaymentMethod,
    fetchReportData,
    setActivePaymentMethod: handleSetActivePaymentMethod,
    exportToPDF,
    clearError
  };
}
