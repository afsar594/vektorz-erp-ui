export interface PurchaseVoucherMonthlyAnalysisRow {
  year: number;
  month: number;
  monthKey: string;
  monthLabel: string;
  supplierId: number | null;
  supplierName: string;
  voucherCount: number;
  grossBase: number;
  vatBase: number;
  netBase: number;
  quantity: number;
  baseCurrencyId?: number;
  baseCurrencyName?: string;
}

export interface PurchaseVoucherMonthlyAnalysisResponse {
  baseCurrencyId?: number;
  baseCurrencyName?: string;
  monthKeys: string[];
  rows: PurchaseVoucherMonthlyAnalysisRow[];
}

export type PurchaseVoucherAnalysisMeasure = 'voucherCount' | 'gross' | 'vat' | 'net' | 'quantity';
