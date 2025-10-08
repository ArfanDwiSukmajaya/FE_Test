"use client";

import LaporanTable from '@/presentation/components/organisms/LaporanTable';
import LaporanTemplate from '@/presentation/components/templates/LaporanTemplate';
import { useLaporanLalin } from '@/presentation/hooks/useLaporanLalin';

export default function LaporanPage() {
  const {
    processedData,
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
    handleReset,
    handleExportPDF
  } = useLaporanLalin();

  return (
    <LaporanTemplate
      title="Laporan Lalin Per Hari"
      searchValue={searchInput}
      onSearchChange={setSearchInput}
      dateValue={tanggal}
      onDateChange={setTanggal}
      onReset={handleReset}
      searchPlaceholder="Cari gerbang..."
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={processedData.length}
      itemsPerPage={limit}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={setLimit}
    >
      <LaporanTable
        data={processedData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportPDF={handleExportPDF}
      />
    </LaporanTemplate>
  );
}