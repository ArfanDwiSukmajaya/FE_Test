"use client";

import { ReactNode } from 'react';

interface TableHeaderProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
  sortable?: boolean;
  onClick?: () => void;
}

export default function TableHeader({
  children,
  align = 'left',
  width,
  className = "",
  sortable = false,
  onClick
}: TableHeaderProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  const widthClass = width ? `w-${width}` : '';
  const sortableClass = sortable ? 'cursor-pointer hover:bg-gray-100' : '';

  return (
    <th
      className={`px-6 py-3 ${alignClass} text-xs font-medium text-gray-500 uppercase tracking-wider ${widthClass} ${sortableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </th>
  );
}
