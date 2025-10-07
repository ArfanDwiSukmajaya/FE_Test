// app/(private)/laporan-lalin/laporan-per-hari/page.tsx
"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import LaporanTable from '@/components/LaporanTable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Tipe untuk data mentah dari API
interface LalinRecord {
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
}

interface GerbangRecord {
  id: number;
  IdCabang: number;
  NamaGerbang: string;
  NamaCabang: string;
}

// Tipe untuk data yang sudah diolah
export interface ProcessedDataRow {
  Ruas: string;
  Gerbang: string;
  Gardu: number;
  Tanggal: string;
  Hari: string;
  Gol: {
    [key: number]: {
      Tunai: number;
      KTP: number;
      Flo: number;
      EToll: number;
      Keseluruhan: number;
      ETF: number; // E-Toll + Tunai + Flo
    };
  };
}


export default function LaporanPage() {
  const [processedData, setProcessedData] = useState<ProcessedDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [tanggal, setTanggal] = useState('2023-11-01');
  const [activeTab, setActiveTab] = useState<'Tunai' | 'EToll' | 'Flo' | 'KTP' | 'Keseluruhan' | 'ETF'>('Tunai');

  // Fungsi untuk memproses data dari API
  const processApiData = (lalinList: LalinRecord[], gerbangList: GerbangRecord[]): ProcessedDataRow[] => {
    const gerbangMap: { [key: string]: { ruas: string; gerbang: string } } = {};
    gerbangList.forEach(g => {
      gerbangMap[`${g.IdCabang}-${g.id}`] = { ruas: g.NamaCabang, gerbang: g.NamaGerbang };
    });

    const aggregatedData: { [key: string]: ProcessedDataRow } = {};
    const formatDate = (d: string) => { const [y, m, day] = d.split('-'); return `${day}-${m}-${y}`; };
    const getDayName = (d: string) => new Intl.DateTimeFormat('id-ID', { weekday: 'long', timeZone: 'Asia/Jakarta' }).format(new Date(d));

    lalinList.forEach(lalin => {
      const date = lalin.Tanggal.split('T')[0];
      const key = `${date}-${lalin.IdCabang}-${lalin.IdGerbang}-${lalin.IdGardu}`;

      if (!aggregatedData[key]) {
        const gerbangInfo = gerbangMap[`${lalin.IdCabang}-${lalin.IdGerbang}`] || { ruas: 'N/A', gerbang: 'N/A' };
        aggregatedData[key] = {
          Ruas: gerbangInfo.ruas,
          Gerbang: gerbangInfo.gerbang,
          Gardu: lalin.IdGardu,
          Tanggal: formatDate(date),
          Hari: getDayName(date),
          Gol: {} as ProcessedDataRow['Gol'],
        };
      }

      const tunai = lalin.Tunai;
      const ktp = lalin.DinasOpr + lalin.DinasMitra + lalin.DinasKary;
      const flo = lalin.eFlo;
      const etoll = lalin.eMandiri + lalin.eBri + lalin.eBni + lalin.eBca + lalin.eNobu + lalin.eDKI + lalin.eMega;

      aggregatedData[key].Gol[lalin.Golongan] = {
        Tunai: tunai, KTP: ktp, Flo: flo, EToll: etoll,
        Keseluruhan: tunai + ktp + flo + etoll,
        ETF: etoll + tunai + flo,
      };
    });

    return Object.values(aggregatedData);
  };

  // Fetch data dari API
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
      });
      if (searchInput) params.append('search', searchInput);
      if (tanggal) params.append('tanggal', tanggal);

      const apiUrl = `http://localhost:8080/api/lalins?${params.toString()}`;

      const [lalinRes, gerbangRes] = await Promise.all([
        fetch(apiUrl),
        fetch('http://localhost:8080/api/gerbangs')
      ]);

      if (!lalinRes.ok || !gerbangRes.ok) {
        throw new Error('Gagal mengambil data dari API');
      }

      const lalinApiResponse = await lalinRes.json();
      const gerbangApiResponse = await gerbangRes.json();

      const lalinList: LalinRecord[] = lalinApiResponse.data.rows.rows;
      const gerbangList: GerbangRecord[] = gerbangApiResponse.data.rows.rows;

      const processed = processApiData(lalinList, gerbangList);
      setProcessedData(processed);
      setTotalPages(lalinApiResponse.data.total_pages || 1);

    } catch {
      toast.error('Terjadi kesalahan saat memproses data');
      setProcessedData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);

  const handleFilter = () => {
    setCurrentPage(1);
    fetchData();
  };

  const handleReset = () => {
    setSearchInput('');
    setTanggal('2023-11-01');
    setCurrentPage(1);
    setTimeout(() => fetchData(), 0);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');

      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Laporan Lalu Lintas Per Hari', 14, 20);

      // Tanggal laporan
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tanggal: ${tanggal}`, 14, 30);

      // Data untuk tabel berdasarkan tab aktif - sama seperti yang ditampilkan di UI
      const methodDisplayNames: Record<string, string> = {
        Tunai: 'Tunai',
        EToll: 'E-Toll',
        Flo: 'Flo',
        KTP: 'KTP',
        Keseluruhan: 'Keseluruhan',
        ETF: 'E-Toll+Tunai+Flo'
      };

      const tableData = processedData.map((row, index) => {
        const getValue = (gol: number) => {
          const golData = row.Gol[gol];
          if (!golData) return 0;
          return golData[activeTab] || 0;
        };

        const totalLalin = [1, 2, 3, 4, 5].reduce((sum, gol) => sum + getValue(gol), 0);

        return [
          index + 1,
          row.Ruas,
          row.Gerbang,
          row.Gardu,
          row.Hari,
          row.Tanggal,
          methodDisplayNames[activeTab] || activeTab, // Payment method sesuai tab aktif
          getValue(1),
          getValue(2),
          getValue(3),
          getValue(4),
          getValue(5),
          totalLalin
        ];
      });

      // Kolom headers
      const headers = [
        'No.',
        'Ruas',
        'Gerbang',
        'Gardu',
        'Hari',
        'Tanggal',
        'Metode Pembayaran',
        'Gol I',
        'Gol II',
        'Gol III',
        'Gol IV',
        'Gol V',
        'Total Lalin'
      ];

      // Buat tabel
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 15 }, // No
          1: { cellWidth: 30 }, // Ruas
          2: { cellWidth: 30 }, // Gerbang
          3: { cellWidth: 20 }, // Gardu
          4: { cellWidth: 20 }, // Hari
          5: { cellWidth: 25 }, // Tanggal
          6: { cellWidth: 30 }, // Metode Pembayaran
          7: { cellWidth: 20 }, // Gol I
          8: { cellWidth: 20 }, // Gol II
          9: { cellWidth: 20 }, // Gol III
          10: { cellWidth: 20 }, // Gol IV
          11: { cellWidth: 20 }, // Gol V
          12: { cellWidth: 25 }, // Total Lalin
        },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Halaman ${i} dari ${pageCount}`, 14, doc.internal.pageSize.height - 10);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10);
      }

      // Download PDF
      const fileName = `Laporan_Lalin_${tanggal.replace(/-/g, '_')}.pdf`;
      doc.save(fileName);

      toast.success('PDF berhasil diunduh!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal mengexport PDF');
    }
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <main className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Laporan Lalin Per Hari</h1>
        <div>Memuat data...</div>
      </main>
    );
  }

  return (
    <main className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Laporan Lalin Per Hari</h1>

      <LaporanTable
        data={processedData}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        tanggal={tanggal}
        setTanggal={setTanggal}
        onFilter={handleFilter}
        onReset={handleReset}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportPDF={handleExportPDF}
      />

      {/* Pagination Controls */}
      <div className="flex justify-end items-center mt-4 gap-6">
        {/* Limit Selector */}
        <div className="relative">
          <select
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="appearance-none bg-white border border-gray-300 rounded px-4 py-2 pr-8 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>Show : 5 entries</option>
            <option value={10}>Show : 10 entries</option>
            <option value={20}>Show : 20 entries</option>
            <option value={50}>Show : 50 entries</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* Pagination Numbers Group */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded ${currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            &lt;
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((pageNum, idx) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-3 py-2">...</span>
            ) : (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum as number)}
                className={`px-3 py-2 rounded min-w-[40px] ${currentPage === pageNum
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {pageNum}
              </button>
            )
          ))}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded ${currentPage === totalPages
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            &gt;
          </button>
        </div>
      </div>
    </main>
  );
}