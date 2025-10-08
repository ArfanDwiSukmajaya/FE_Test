"use client";

import { ReactNode } from 'react';
import BaseTable, { BaseTableColumn, BaseTableRow } from './BaseTable';

interface ResponsiveTableProps {
  columns: BaseTableColumn[];
  data: BaseTableRow[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: BaseTableRow, index: number) => void;
  renderRow?: (row: BaseTableRow, index: number) => ReactNode;
  renderHeader?: () => ReactNode;
}

export default function ResponsiveTable({
  columns,
  data,
  loading = false,
  emptyMessage = "Tidak ada data",
  className = "",
  onRowClick,
  renderRow,
  renderHeader
}: ResponsiveTableProps) {

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-8 text-center text-gray-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <BaseTable
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage={emptyMessage}
          onRowClick={onRowClick}
          renderRow={renderRow}
          renderHeader={renderHeader}
        />
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`bg-white shadow-sm rounded-lg border border-gray-200 p-4 ${onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
              }`}
            onClick={() => onRowClick?.(row, rowIndex)}
          >
            {columns.map((column, colIndex) => {
              const value = row[column.key];
              const displayValue = value !== null && value !== undefined ? value : '-';

              return (
                <div key={colIndex} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider flex-shrink-0 mr-2">
                    {column.label}
                  </span>
                  <span className="text-sm text-gray-900 text-right break-words max-w-[60%]">
                    {displayValue}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
