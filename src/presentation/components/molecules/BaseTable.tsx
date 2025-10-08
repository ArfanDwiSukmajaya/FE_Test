"use client";

import { ReactNode } from 'react';

export interface BaseTableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface BaseTableRow {
  [key: string]: ReactNode;
}

interface BaseTableProps {
  columns: BaseTableColumn[];
  data: BaseTableRow[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: BaseTableRow, index: number) => void;
  renderRow?: (row: BaseTableRow, index: number) => ReactNode;
  renderHeader?: () => ReactNode;
}

export default function BaseTable({
  columns,
  data,
  loading = false,
  emptyMessage = "Tidak ada data",
  className = "",
  onRowClick,
  renderRow,
  renderHeader
}: BaseTableProps) {

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
    <div className={`bg-white shadow-sm rounded-lg border border-gray-200 ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {renderHeader ? renderHeader() : (
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`px-6 py-3 text-${column.align || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width ? `w-${column.width}` : ''} ${column.className || ''}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => {
              if (renderRow) {
                return renderRow(row, rowIndex);
              }

              return (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'} ${column.className || ''}`}
                    >
                      {row[column.key] || '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
