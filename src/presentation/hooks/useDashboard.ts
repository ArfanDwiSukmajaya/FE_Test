"use client";

import { useState, useCallback, useEffect } from 'react';
import { DIContainer } from '../../shared/container/DIContainer';
import toast from 'react-hot-toast';

export interface LalinRecord {
  Shift: number;
  IdGerbang: number;
  IdCabang: number;
  Tunai: number;
  eBca: number;
  eBri: number;
  eBni: number;
  eDKI: number;
  eMandiri: number;
  eMega: number;
  eFlo: number;
  DinasOpr: number;
  DinasMitra: number;
  DinasKary: number;
}

export interface GerbangRecord {
  id: number;
  NamaGerbang: string;
  IdCabang: number;
  NamaCabang: string;
}

export interface DashboardData {
  byPaymentMethod: { [key: string]: number };
  byShift: { [key: string]: number };
  byGerbang: { [key: string]: number };
  byRuas: { [key: string]: number };
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tanggal, setTanggal] = useState('2023-11-01');


  const fetchData = useCallback(async (filterDate: string) => {
    setLoading(true);
    setData(null);

    try {
      const dashboardUseCase = DIContainer.getInstance().getDashboardUseCase();

      const result = await dashboardUseCase.getDashboardData({
        tanggal: filterDate,
        limit: 2000
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast.error(result.error || 'Gagal mengambil data dashboard');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Terjadi kesalahan saat mengambil data dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilter = useCallback(() => {
    fetchData(tanggal);
  }, [fetchData, tanggal]);

  const handleDateChange = useCallback((newDate: string) => {
    setTanggal(newDate);
  }, []);


  useEffect(() => {
    fetchData(tanggal);
  }, [fetchData, tanggal]);

  return {
    data,
    loading,
    tanggal,

    fetchData,
    handleFilter,
    handleDateChange
  };
}
