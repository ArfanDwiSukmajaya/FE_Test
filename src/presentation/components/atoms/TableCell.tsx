"use client";

import { ReactNode } from 'react';

interface TableCellProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  onClick?: () => void;
}

export default function TableCell({
  children,
  align = 'left',
  className = "",
  onClick
}: TableCellProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${alignClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </td>
  );
}
