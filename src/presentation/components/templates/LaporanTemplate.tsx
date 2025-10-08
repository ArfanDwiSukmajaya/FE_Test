import React, { ReactNode } from 'react';
import ReportContainer from '../organisms/ReportContainer';

interface LaporanTemplateProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  dateValue: string;
  onDateChange: (value: string) => void;
  onReset: () => void;
  searchPlaceholder?: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  children: ReactNode;
  className?: string;
}

export default function LaporanTemplate({
  title,
  searchValue,
  onSearchChange,
  dateValue,
  onDateChange,
  onReset,
  searchPlaceholder = "Cari...",
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  children,
  className = ""
}: LaporanTemplateProps) {
  return (
    <ReportContainer
      title={title}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      dateValue={dateValue}
      onDateChange={onDateChange}
      onReset={onReset}
      searchPlaceholder={searchPlaceholder}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
      onItemsPerPageChange={onItemsPerPageChange}
      className={className}
    >
      {children}
    </ReportContainer>
  );
}
