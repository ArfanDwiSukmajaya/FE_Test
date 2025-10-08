// shared/types/index.ts
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  code: number;
  data: T;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total_pages: number;
  current_page: number;
  total_records: number;
}

export interface FilterParams {
  search?: string;
  tanggal?: string;
  [key: string]: unknown;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AppState<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}
