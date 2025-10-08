// presentation/components/molecules/PaginationControls.tsx
"use client";

import Button from '@/presentation/components/atoms/Button';
import Select from '@/presentation/components/atoms/Select';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  className?: string;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className = ""
}: PaginationControlsProps) {


  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Jika total halaman <= 5, tampilkan semua
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Jika total halaman > 5, tampilkan dengan ellipsis
      if (currentPage <= 3) {
        // Halaman awal: 1, 2, 3, 4, 5, ..., last
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push('...');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        // Halaman akhir: 1, ..., last-4, last-3, last-2, last-1, last
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Halaman tengah: 1, ..., current-1, current, current+1, ..., last
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 py-4${className}`}>
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-700">Show</span>
        <Select
          value={itemsPerPage.toString()}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          options={[
            { value: '5', label: '5' },
            { value: '10', label: '10' },
            { value: '20', label: '20' },
            { value: '50', label: '50' }
          ]}
          className="w-20 h-9"
        />
        <span className="text-sm text-gray-700">entries</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="secondary"
          size="sm"
        >
          Previous
        </Button>

        {getPageNumbers().map((pageNum, index) => (
          pageNum === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500">
              ...
            </span>
          ) : (
            <Button
              key={pageNum}
              onClick={() => onPageChange(pageNum as number)}
              variant={currentPage === pageNum ? "primary" : "secondary"}
              size="sm"
              className="min-w-[40px]"
            >
              {pageNum}
            </Button>
          )
        ))}

        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="secondary"
          size="sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
}