// presentation/hooks/useLaporanLalin.ts
import { useState, useCallback, useEffect } from 'react';
import { DIContainer } from '../../shared/container/DIContainer';
import type { ProcessedDataRow } from '../components/organisms/LaporanTable';
import type { ReportFilters } from '../../application/use-cases/ReportUseCase';
import { PaymentMethod } from '../../domain/value-objects/PaymentMethod';
import { useDebounce, useMemoizedValue } from '../../shared/utils/PerformanceUtils';
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
  const [allData, setAllData] = useState<ProcessedDataRow[]>([]); // Data asli tanpa filter
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  // const [lastFetchedDate, setLastFetchedDate] = useState<string>(''); // Track tanggal terakhir di-fetch

  // Optimasi: Debounce search input untuk menghindari terlalu banyak filtering
  const debouncedSearchInput = useDebounce(searchInput, 300); // 300ms delay

  const diContainer = DIContainer.getInstance();
  const reportUseCase = diContainer.getReportUseCase();

  // Fetch data when dependencies change
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: ReportFilters = {
        tanggal
        // Tidak mengirim search ke API karena API tidak support
      };

      const params = {
        page: currentPage,
        limit
      };

      const result = await reportUseCase.getReportData(filters, params);

      if (result.success && result.data) {
        setAllData(result.data.data);
        setProcessedData(result.data.data);
        setTotalPages(result.data.totalPages);
        // setLastFetchedDate(tanggal);
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
  }, [tanggal, currentPage, limit, reportUseCase]);

  // Client-side filtering untuk search - hanya saat tombol Filter diklik
  // Optimasi: Memoized search filter dengan debounced input
  const filteredData = useMemoizedValue(() => {
    if (!debouncedSearchInput.trim()) {
      return allData;
    }

    const searchTerm = debouncedSearchInput.toLowerCase();
    return allData.filter(item =>
      item.Ruas.toLowerCase().includes(searchTerm) ||
      item.Gerbang.toLowerCase().includes(searchTerm)
    );
  }, [allData, debouncedSearchInput]);

  // Update processedData ketika filteredData berubah
  useEffect(() => {
    setProcessedData(filteredData);
  }, [filteredData, limit, allData.length, currentPage, totalPages]);

  // Initial data load saat component pertama kali mount
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Include fetchData in dependencies

  // Optimasi: Search filter sudah di-handle oleh memoized filteredData

  // Fetch data saat tanggal berubah
  useEffect(() => {
    fetchData();
  }, [tanggal, fetchData]);

  const handleFilter = useCallback(() => {
    setCurrentPage(1);
    fetchData(); // Fetch data dengan tanggal yang dipilih
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
