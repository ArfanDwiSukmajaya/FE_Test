// presentation/components/optimized/LazyTable.tsx
import React, { memo, useMemo, useCallback } from 'react';
import { useVirtualScroll } from '../../../shared/utils/PerformanceUtils';

interface LazyTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    width?: string;
    render?: (value: unknown, row: T, index: number) => React.ReactNode;
  }>;
  height?: number;
  itemHeight?: number;
  onRowClick?: (row: T, index: number) => void;
  loading?: boolean;
  emptyMessage?: string;
}

function LazyTableComponent<T>({
  data,
  columns,
  height = 400,
  itemHeight = 50,
  onRowClick,
  loading = false,
  emptyMessage = 'Tidak ada data'
}: LazyTableProps<T>) {
  const virtualScroll = useVirtualScroll(data, {
    itemHeight,
    containerHeight: height,
    overscan: 5
  });

  const handleRowClick = useCallback((row: T, index: number) => {
    onRowClick?.(row, index);
  }, [onRowClick]);

  const memoizedColumns = useMemo(() => columns, [columns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-auto" style={{ height }}>
      <div style={{ height: virtualScroll.totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${virtualScroll.offsetY}px)` }}>
          <table className="min-w-full bg-white border text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {memoizedColumns.map((column) => (
                  <th
                    key={String(column.key)}
                    className="py-2 px-3 border-b text-left font-semibold"
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {virtualScroll.visibleItems.map((row, index) => {
                const actualIndex = virtualScroll.offsetY / itemHeight + index;
                return (
                  <tr
                    key={actualIndex}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(row, actualIndex)}
                  >
                    {memoizedColumns.map((column) => (
                      <td key={String(column.key)} className="py-2 px-3 border-b">
                        {column.render
                          ? column.render((row as Record<string, unknown>)[column.key as string], row, actualIndex)
                          : String((row as Record<string, unknown>)[column.key as string] || '')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export const LazyTable = memo(LazyTableComponent) as <T>(
  props: LazyTableProps<T>
) => React.JSX.Element;
