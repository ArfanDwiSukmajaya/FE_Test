"use client";

import Input from '@/presentation/components/atoms/Input';
import Button from '@/presentation/components/atoms/Button';

interface FilterFormProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  dateValue?: string;
  onDateChange?: (value: string) => void;
  onReset?: () => void;
  showDateFilter?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

export default function FilterForm({
  searchValue,
  onSearchChange,
  dateValue,
  onDateChange,
  onReset,
  showDateFilter = false,
  searchPlaceholder = "Cari...",
  className = ""
}: FilterFormProps) {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Pencarian
          </label>
          <Input
            id="search"
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        {showDateFilter && (
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal
            </label>
            <Input
              id="date"
              type="date"
              value={dateValue || ''}
              onChange={(e) => onDateChange?.(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        <div className="flex items-end gap-2">
          {onReset && (
            <Button
              onClick={onReset}
              variant="secondary"
              className="flex-1"
            >
              Reset Filter
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}