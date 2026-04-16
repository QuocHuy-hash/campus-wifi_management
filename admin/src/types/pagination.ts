export interface PageResponse<T> {
  current: number;
  size: number;
  total: number;
  pages: number;
  records: T[];
  orders: OrderItem[];
}

export interface OrderItem {
  column: string;
  asc: boolean;
}

export interface PageParams {
  page: number;
  size: number;
}

export interface PageRequest {
  page?: number;
  size?: number;
}
