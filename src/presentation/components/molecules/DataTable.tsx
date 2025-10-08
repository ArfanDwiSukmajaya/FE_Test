"use client";

import { ReactNode, useState } from 'react';
import { BaseTableColumn, BaseTableRow } from './BaseTable';
import ResponsiveTable from './ResponsiveTable';

export interface Column<T = unknown> {
  key: keyof T | string;
  label: string;
  width?: string;
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => ReactNode;
}

type SortDirection = 'asc' | 'desc' | null;

interface DataTableProps<T = unknown> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onSort?: (column: keyof T | string, direction: SortDirection) => void;
}

export default function DataTable<T = unknown>({
  data,
  columns,
  loading = false,
  emptyMessage = "Tidak ada data",
  className = "",
  onSort
}: DataTableProps<T>) {

  const [sortColumn, setSortColumn] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: keyof T | string) => {
    if (!onSort) return;

    let newDirection: SortDirection = 'asc';
    if (sortColumn === column && sortDirection === 'asc') {
      newDirection = 'desc';
    } else if (sortColumn === column && sortDirection === 'desc') {
      newDirection = null;
    }

    setSortColumn(newDirection ? column : null);
    setSortDirection(newDirection);
    onSort(column, newDirection);
  };

  const getSortIcon = (column: keyof T | string) => {
    if (sortColumn !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    if (sortDirection === 'asc') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }

    if (sortDirection === 'desc') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }

    return null;
  };

  // Convert columns to BaseTable format
  const baseColumns: BaseTableColumn[] = columns.map(column => ({
    key: column.key as string,
    label: column.label,
    width: column.width,
    align: 'left' as const
  }));

  // Convert data to BaseTable format
  const baseData: BaseTableRow[] = data.map((row, rowIndex) => {
    const baseRow: BaseTableRow = {};
    columns.forEach(column => {
      const value = (row as Record<string, unknown>)[column.key as string];
      baseRow[column.key as string] = column.render
        ? column.render(value, row, rowIndex)
        : String(value || '-');
    });
    return baseRow;
  });

  // Custom render for sortable headers
  const renderRow = (row: BaseTableRow, index: number) => {
    return (
      <tr key={index} className="hover:bg-gray-50">
        {columns.map((column, colIndex) => {
          const value = (row as Record<string, unknown>)[column.key as string];
          return (
            <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {column.render
                ? column.render(value, data[index], index)
                : String(value || '-')
              }
            </td>
          );
        })}
      </tr>
    );
  };

  const renderHeader = () => {
    return (
      <thead className="bg-gray-50">
        <tr>
          {columns.map((column, index) => (
            <th
              key={index}
              className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div className="flex items-center space-x-1">
                <span>{column.label}</span>
                {column.sortable && getSortIcon(column.key)}
              </div>
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  return (
    <ResponsiveTable
      columns={baseColumns}
      data={baseData}
      loading={loading}
      emptyMessage={emptyMessage}
      className={className}
      renderRow={renderRow}
      renderHeader={renderHeader}
    />
  );
}