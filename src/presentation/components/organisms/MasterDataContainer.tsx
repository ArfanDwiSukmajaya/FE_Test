import React from 'react';
import FilterForm from '../molecules/FilterForm';
import DataTable from '../molecules/DataTable';
import PaginationControls from '../molecules/PaginationControls';
import Button from '../atoms/Button';

interface Column<T> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

interface MasterDataContainerProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  dateValue?: string;
  onDateChange?: (value: string) => void;
  showDateFilter?: boolean;
  searchPlaceholder?: string;
  onAdd?: () => void;
  onExport?: () => void;
  addButtonText?: string;
  exportButtonText?: string;
  showAddButton?: boolean;
  showExportButton?: boolean;
  onSort?: (column: keyof T | string, direction: 'asc' | 'desc' | null) => void;
  title: string;
  className?: string;
}

export default function MasterDataContainer<T>({
  data,
  columns,
  loading = false,
  emptyMessage = 'Tidak ada data',
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  searchValue,
  onSearchChange,
  dateValue,
  onDateChange,
  showDateFilter = false,
  searchPlaceholder = 'Cari...',
  onAdd,
  addButtonText = 'Tambah Data',
  showAddButton = false,
  onSort,
  title,
  className = '',
}: MasterDataContainerProps<T>) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>

      <FilterForm
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        dateValue={dateValue}
        onDateChange={onDateChange}
        showDateFilter={showDateFilter}
        searchPlaceholder={searchPlaceholder}
      />

      {showAddButton && onAdd && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={onAdd}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {addButtonText}
          </Button>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <DataTable
          data={data}
          columns={columns}
          loading={loading}
          emptyMessage={emptyMessage}
          onSort={onSort}
        />
      </div>

      <div className="flex justify-end items-center w-full">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>
    </div>
  );
}
