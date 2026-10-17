// Shapes returned by the backend's Super Admin /admin/* endpoints
// (backend/src/modules/admin/admin.service.ts).

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'CREDIT';

export interface AdminProduct {
  _id: string;
  name: string;
  sku: string;
  tenantId: string;
  businessName?: string;
  categoryName?: string;
  unitSymbol?: string;
  purchasePrice: number;
  sellingPrice: number;
  taxRate: number;
  lowStockThreshold: number;
  currentStock: number;
  status: StockStatus;
  isActive: boolean;
  createdAt: string;
}

export interface AdminInventoryItem extends AdminProduct {
  stockValue: number;
}

interface AdminDocumentBase {
  _id: string;
  tenantId: string;
  businessName?: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  status: string;
}

export interface AdminSale extends AdminDocumentBase {
  saleNumber: string;
  saleDate: string;
  customerName?: string;
  paymentMethod?: string;
}

export interface AdminPurchase extends AdminDocumentBase {
  purchaseNumber: string;
  invoiceNumber?: string;
  purchaseDate: string;
  supplierName?: string;
}

export interface DocumentTotals {
  count: number;
  amount: number;
  due: number;
}

export interface StockTotals {
  products: number;
  stockQuantity: number;
  stockValue: number;
  lowStock: number;
  outOfStock: number;
}

export interface AdminOverview {
  stock: StockTotals;
  sales: DocumentTotals;
  purchases: DocumentTotals;
  recentSales: AdminSale[];
  recentPurchases: AdminPurchase[];
  lowStock: AdminInventoryItem[];
}

export interface TenantStats {
  stock: StockTotals;
  sales: DocumentTotals;
  purchases: DocumentTotals;
  customers: number;
  suppliers: number;
}

export interface AdminReport {
  totals: { sales: DocumentTotals; purchases: DocumentTotals };
  businesses: {
    tenantId: string;
    businessName: string;
    status: string;
    sales: DocumentTotals;
    purchases: DocumentTotals;
  }[];
  monthly: { month: string; sales: number; purchases: number }[];
}
