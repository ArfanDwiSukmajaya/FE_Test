// app/(private)/laporan-lalin/laporan-per-hari/page.tsx
"use client";

import LaporanTable from '@/presentation/components/ui/LaporanTable';
import { useLaporanLalin } from '@/presentation/hooks/useLaporanLalin';

export default function LaporanPage() {
  const {
    processedData,
    loading,
    currentPage,
    totalPages,
    limit,
    searchInput,
    tanggal,
    activeTab,
    setSearchInput,
    setTanggal,
    setActiveTab,
    setCurrentPage,
    setLimit,
    handleFilter,
    handleReset,
    handleExportPDF
  } = useLaporanLalin();

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
            onChange={(e) => setLimit(Number(e.target.value))}
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
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded ${currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            &lt;
          </button>

          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-2 rounded min-w-[40px] ${currentPage === pageNum
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
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