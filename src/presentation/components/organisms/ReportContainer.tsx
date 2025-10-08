"use client";

import { ReactNode } from 'react';
import FilterForm from '@/presentation/components/molecules/FilterForm';
import PaginationControls from '@/presentation/components/molecules/PaginationControls';

interface ReportContainerProps {
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

export default function ReportContainer({
  title,
  searchValue,
  onSearchChange,
  dateValue,
  onDateChange,
  onReset,
  searchPlaceholder = "Cari gerbang...",
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  children,
  className = ""
}: ReportContainerProps) {
  return (
    <main className={`container mx-auto ${className}`}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>

        <FilterForm
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          dateValue={dateValue}
          onDateChange={onDateChange}
          onReset={onReset}
          showDateFilter={true}
          searchPlaceholder={searchPlaceholder}
        />

        {children}

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
    </main>
  );
}
