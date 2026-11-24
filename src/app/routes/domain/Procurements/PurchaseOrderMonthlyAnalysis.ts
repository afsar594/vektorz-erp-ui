export interface PurchaseOrderMonthlyAnalysisRow {
  year: number;
  month: number;
  monthKey: string; // yyyy-MM
  monthLabel: string; // MMM yyyy
  supplierId: number | null;
  supplierName: string;
  poCount: number;
  grossBase: number;
  vatBase: number;
  netBase: number;
  quantity: number;
  baseCurrencyId?: number;
  baseCurrencyName?: string;
}

export interface PurchaseOrderMonthlyAnalysisResponse {
  baseCurrencyId?: number;
  baseCurrencyName?: string;
  monthKeys: string[];
  rows: PurchaseOrderMonthlyAnalysisRow[];
}

export type AnalysisMeasure = 'poCount' | 'gross' | 'vat' | 'net' | 'quantity';
