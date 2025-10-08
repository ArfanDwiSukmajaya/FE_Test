"use client";

import { ReactNode } from 'react';

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function TableRow({
  children,
  className = "",
  onClick,
  hoverable = true
}: TableRowProps) {
  const hoverClass = hoverable ? 'hover:bg-gray-50' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <tr
      className={`${hoverClass} ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}
