import React from 'react';
import MasterDataContainer from '../organisms/MasterDataContainer';

interface Column<T> {
  key: keyof T;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

interface MasterDataTemplateProps<T> {
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
  searchPlaceholder?: string;
  onAdd?: () => void;
  addButtonText?: string;
  showAddButton?: boolean;
  onSort?: (column: keyof T | string, direction: 'asc' | 'desc' | null) => void;
  title: string;
  className?: string;
}

export default function MasterDataTemplate<T>({
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
  searchPlaceholder = 'Cari...',
  onAdd,
  addButtonText = 'Tambah Data',
  showAddButton = false,
  onSort,
  title,
  className = '',
}: MasterDataTemplateProps<T>) {
  return (
    <MasterDataContainer
      data={data}
      columns={columns}
      loading={loading}
      emptyMessage={emptyMessage}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
      onItemsPerPageChange={onItemsPerPageChange}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
      onAdd={onAdd}
      addButtonText={addButtonText}
      showAddButton={showAddButton}
      onSort={onSort}
      title={title}
      className={className}
    />
  );
}
