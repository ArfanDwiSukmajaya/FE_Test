"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { DIContainer } from '../../shared/container/DIContainer';
import { GerbangEntity } from '../../domain/entities/Gerbang';
import { GerbangFormData } from '../../presentation/components/organisms/GerbangModal';
import { debounce } from '../../shared/utils/DebounceUtils';
import toast from 'react-hot-toast';

export interface GerbangFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export function useGerbang() {
  const [gerbangs, setGerbangs] = useState<GerbangEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalItems, setTotalItems] = useState(0);

  const fetchGerbangs = useCallback(async (page: number = currentPage, pageLimit: number = limit, search: string = searchTerm) => {
    setLoading(true);

    try {
      const gerbangUseCase = DIContainer.getInstance().getGerbangUseCase();

      const result = await gerbangUseCase.getGerbangs(
        { search },
        { page, limit: pageLimit }
      );

      if (result.success && result.data) {
        setGerbangs(result.data.data);
        setTotalPages(result.data.total_pages);
        setCurrentPage(result.data.current_page);
        setTotalItems(result.data.total_records);
      } else {
        toast.error(result.error || 'Gagal mengambil data gerbang');
      }
    } catch (error) {
      console.error('Fetch gerbangs error:', error);
      toast.error('Terjadi kesalahan saat mengambil data gerbang');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm]);

  const createGerbang = useCallback(async (formData: GerbangFormData) => {
    try {
      const gerbangUseCase = DIContainer.getInstance().getGerbangUseCase();

      const payload = {
        id: Number(formData.id),
        IdCabang: Number(formData.IdCabang),
        NamaGerbang: formData.NamaGerbang,
        NamaCabang: formData.NamaCabang
      };


      const result = await gerbangUseCase.createGerbang(payload);

      if (result.success) {
        toast.success('Data berhasil disimpan!');
        await fetchGerbangs(currentPage, limit);
        return { success: true };
      } else {
        toast.error(result.error || 'Gagal menyimpan data');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Create gerbang error:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
      return { success: false, error: 'Terjadi kesalahan saat menyimpan data' };
    }
  }, [fetchGerbangs, currentPage, limit]);

  const updateGerbang = useCallback(async (id: number, formData: GerbangFormData) => {
    try {

      const gerbangUseCase = DIContainer.getInstance().getGerbangUseCase();

      // Use DDD architecture - call use case
      const result = await gerbangUseCase.updateGerbang(id, {
        IdCabang: Number(formData.IdCabang),
        NamaGerbang: formData.NamaGerbang,
        NamaCabang: formData.NamaCabang
      });

      if (result.success) {
        toast.success('Data berhasil diperbarui!');
        await fetchGerbangs(currentPage, limit);
        return { success: true };
      } else {
        toast.error(result.error || 'Gagal memperbarui data');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Update gerbang error:', error);
      toast.error('Terjadi kesalahan saat memperbarui data');
      return { success: false, error: 'Terjadi kesalahan saat memperbarui data' };
    }
  }, [fetchGerbangs, currentPage, limit]);

  const deleteGerbang = useCallback(async (id: number, IdCabang: number) => {
    try {
      const gerbangUseCase = DIContainer.getInstance().getGerbangUseCase();

      const result = await gerbangUseCase.deleteGerbang(id, IdCabang);

      if (result.success) {
        toast.success('Data berhasil dihapus!');
        await fetchGerbangs(currentPage, limit);
        return { success: true };
      } else {
        toast.error(result.error || 'Gagal menghapus data');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Delete gerbang error:', error);
      toast.error('Terjadi kesalahan saat menghapus data');
      return { success: false, error: 'Terjadi kesalahan saat menghapus data' };
    }
  }, [fetchGerbangs, currentPage, limit]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((search: unknown) => {
      setSearchTerm(search as string);
      setCurrentPage(1);
    }, 100),
    []
  );

  useEffect(() => {
    fetchGerbangs(currentPage, limit, searchTerm);
  }, [fetchGerbangs, currentPage, limit, searchTerm]);

  return {
    gerbangs,
    loading,
    currentPage,
    totalPages,
    limit,
    totalItems,
    searchTerm,

    fetchGerbangs,
    createGerbang,
    updateGerbang,
    deleteGerbang,
    handlePageChange,
    handleLimitChange,
    handleSearch,
    debouncedSearch
  };
}