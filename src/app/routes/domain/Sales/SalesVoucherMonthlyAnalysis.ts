export interface SalesVoucherMonthlyAnalysisRow {
  year: number;
  month: number;
  monthKey: string;
  monthLabel: string;
  customerId: number | null;
  customerName: string;
  invoiceCount: number;
  grossBase: number;
  vatBase: number;
  netBase: number;
  quantity: number;
  baseCurrencyId?: number;
  baseCurrencyName?: string;
}

export interface SalesVoucherMonthlyAnalysisResponse {
  baseCurrencyId?: number;
  baseCurrencyName?: string;
  monthKeys: string[];
  rows: SalesVoucherMonthlyAnalysisRow[];
}

export type SalesAnalysisMeasure = 'invoiceCount' | 'gross' | 'vat' | 'net' | 'quantity';
