// presentation/hooks/useLaporanLalin.ts
import { useState, useCallback, useEffect } from 'react';
import { DIContainer } from '../../shared/container/DIContainer';
import type { ProcessedDataRow } from '../components/ui/LaporanTable';
import type { ReportFilters } from '../../application/use-cases/ReportUseCase';
import { PaymentMethod } from '../../domain/value-objects/PaymentMethod';
import toast from 'react-hot-toast';

export type PaymentMethodType = 'Tunai' | 'EToll' | 'Flo' | 'KTP' | 'Keseluruhan' | 'ETF';

export interface LaporanLalinState {
  // Data
  processedData: ProcessedDataRow[];
  loading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  limit: number;

  // Filters
  searchInput: string;
  tanggal: string;
  activeTab: PaymentMethodType;
}

export interface LaporanLalinActions {
  // Pagination
  setCurrentPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Filters
  setSearchInput: (value: string) => void;
  setTanggal: (value: string) => void;
  setActiveTab: (tab: PaymentMethodType) => void;

  // Actions
  handleFilter: () => void;
  handleReset: () => void;
  handleExportPDF: () => void;
}

export function useLaporanLalin(): LaporanLalinState & LaporanLalinActions {
  const [searchInput, setSearchInput] = useState('');
  const [tanggal, setTanggal] = useState('2023-11-01');
  const [activeTab, setActiveTab] = useState<PaymentMethodType>('Tunai');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [processedData, setProcessedData] = useState<ProcessedDataRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const diContainer = DIContainer.getInstance();
  const reportUseCase = diContainer.getReportUseCase();

  // Fetch data when dependencies change
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: ReportFilters = {
        tanggal,
        search: searchInput || undefined
      };

      const params = {
        page: currentPage,
        limit
      };

      const result = await reportUseCase.getReportData(filters, params);

      if (result.success && result.data) {
        setProcessedData(result.data.data);
        setTotalPages(result.data.totalPages);
      } else {
        setError(result.error || 'Failed to fetch data');
        toast.error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [tanggal, searchInput, currentPage, limit, reportUseCase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilter = useCallback(() => {
    setCurrentPage(1);
    fetchData();
  }, [fetchData]);

  const handleReset = useCallback(() => {
    setSearchInput('');
    setTanggal('2023-11-01');
    setCurrentPage(1);
  }, []);

  const handleExportPDF = useCallback(async () => {
    try {
      const result = await reportUseCase.exportToPDF(
        processedData,
        {
          tanggal,
          search: searchInput || undefined
        },
        new PaymentMethod(activeTab)
      );

      if (result.success) {
        toast.success('PDF berhasil diunduh!');
      } else {
        toast.error(result.error || 'Gagal mengexport PDF');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal mengexport PDF');
    }
  }, [reportUseCase, processedData, tanggal, searchInput, activeTab]);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    // State
    processedData,
    loading,
    error,
    currentPage,
    totalPages,
    limit,
    searchInput,
    tanggal,
    activeTab,

    // Actions
    setCurrentPage: handlePageChange,
    setLimit: handleLimitChange,
    setSearchInput,
    setTanggal,
    setActiveTab,
    handleFilter,
    handleReset,
    handleExportPDF
  };
}
