
export enum PaymentMethod {
  PIX = 'PIX',
  CASH = 'Dinheiro',
  DEBIT = 'Cartão de Débito',
  CREDIT = 'Cartão de Crédito'
}

export type UserRole = 'MANAGER' | 'SELLER';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  cpf: string;
  address: string;
  phone: string;
  ficha: string;
  pendingBalance: number;
}

export interface Sale {
  id: string;
  customerId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date: Date;
  isReturn?: boolean;
  sellerId: string;
  sellerName: string;
}

export interface Receipt {
  id: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  installments: number;
  date: Date;
  sellerId: string;
  sellerName: string;
}

export interface DashboardStats {
  weeklySales: number;
  monthlySales: number;
  weeklyReceipts: number;
  monthlyReceipts: number;
  monthlyGoal: number;
}
