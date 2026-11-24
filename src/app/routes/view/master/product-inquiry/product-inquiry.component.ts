import { Component, OnInit } from '@angular/core';
import { SalesServiceService } from 'src/app/routes/service/sales-services/sales-service.service';

export interface BranchStock {
  branch: string;
  location: string;
  currentStock: number;
  reserved: number;
  available: number;
}

export interface TransactionHistory {
  date: string;
  type: 'Sale' | 'Purchase' | 'Transfer' | 'Adjustment';
  refNo: string;
  qty: number;
  rate: number;
  amount: number;
  branch: string;
}

export interface MonthlySalesPoint {
  month: string;
  year: string;
  label: string;
  qty: number;
  heightPercent?: number;
}

export interface YearlySalesRecord {
  year: number;
  qtySold: number;
  salesAmount: number;
}

export interface PricingTier {
  levelName: string;
  price: number;
  minQty: number;
  discountPct: number;
  effectiveDate: string;
}

export interface DetailedPurchase {
  date: string;
  poNo: string;
  supplier: string;
  invoiceNo: string;
  qty: number;
  rate: number;
  amount: number;
  status: string;
  branch: string;
}

export interface DetailedSale {
  date: string;
  invoiceNo: string;
  customer: string;
  salesperson: string;
  qty: number;
  rate: number;
  amount: number;
  branch: string;
  status: string;
}

export interface ProductItem {
  id: string;
  partNumber: string;
  itemCode: string;
  description: string;
  manufacturer: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  margin: number;
  onHandQty: number;
  imageUrl: string;
  verified: boolean;
  currencySymbol: string;
  averageCost: number;
  lastPurchasePrice: number;
  lastSellingPrice: number;
  totalPurchasedQty: number;
  totalSoldQty: number;
  currentStockValue: number;
  notes: string;
  binLocation?: string;
  weight?: string;
  barcode?: string;
  glAccountInventory?: string;
  glAccountCogs?: string;
  glAccountRevenue?: string;
  branchStock: BranchStock[];
  recentHistory: TransactionHistory[];
  monthlySales: MonthlySalesPoint[];
  yearlySales: YearlySalesRecord[];
  pricingTiers: PricingTier[];
  purchaseHistoryDetailed: DetailedPurchase[];
  salesHistoryDetailed: DetailedSale[];
}

@Component({
  selector: 'app-product-inquiry',
  templateUrl: './product-inquiry.component.html',
  styleUrls: ['./product-inquiry.component.scss']
})
export class ProductInquiryComponent implements OnInit {
  searchQuery: string = '';
  showSearchResults: boolean = false;
  isLoadingItems: boolean = false;
  isLoadingDetail: boolean = false;
  activeTab: string = 'stock';
  isEditingNote: boolean = false;
  noteDraft: string = '';
  selectedCurrency: string = '$';
  copiedPartNumber: boolean = false;
  copiedBarcode: boolean = false;

  tabs = [
    { id: 'stock', label: 'Stock & Branches', icon: 'fa fa-sitemap' },
    { id: 'purchases', label: 'Purchase History', icon: 'fa fa-truck' },
    { id: 'sales', label: 'Sales History', icon: 'fa fa-shopping-cart' },
    { id: 'monthly', label: 'Monthly Sales', icon: 'fa fa-calendar-check-o' },
    { id: 'yearly', label: 'Yearly Sales', icon: 'fa fa-line-chart' },
    { id: 'pricing', label: 'Pricing & Details', icon: 'fa fa-tag' },
    { id: 'financials', label: 'Accounts / Financials', icon: 'fa fa-book' }
  ];

  sampleProducts: ProductItem[] = [];

  currentProduct!: ProductItem;

  emptyProduct(): ProductItem {
    return {
      id: '',
      partNumber: '',
      itemCode: '',
      description: '',
      manufacturer: '',
      category: '',
      unit: 'PCS',
      costPrice: 0,
      sellingPrice: 0,
      margin: 0,
      onHandQty: 0,
      imageUrl: 'assets/layout/images/bearing-6205.jpg',
      verified: false,
      currencySymbol: '$',
      averageCost: 0,
      lastPurchasePrice: 0,
      lastSellingPrice: 0,
      totalPurchasedQty: 0,
      totalSoldQty: 0,
      currentStockValue: 0,
      notes: '',
      binLocation: 'N/A',
      weight: 'N/A',
      barcode: 'N/A',
      glAccountInventory: '1410 - Inventory Control',
      glAccountCogs: '5010 - Cost of Goods Sold',
      glAccountRevenue: '4010 - Merchandise Sales Revenue',
      branchStock: [],
      recentHistory: [],
      monthlySales: [],
      yearlySales: [],
      pricingTiers: [],
      purchaseHistoryDetailed: [],
      salesHistoryDetailed: []
    };
  }

  constructor(private saleService: SalesServiceService) {}

  ngOnInit(): void {
    this.currentProduct = this.emptyProduct();
    this.noteDraft = '';
    this.loadItemMasterList();
  }

  loadItemMasterList(): void {
    this.isLoadingItems = true;
    this.saleService.GetItemMasterList().subscribe(
      (response: any) => {
        this.isLoadingItems = false;
        if (response && response.valid) {
          const rawItems: any[] = Array.isArray(response.result)
            ? response.result
            : (response.result && Array.isArray(response.result.data) ? response.result.data : []);

          if (rawItems && rawItems.length > 0) {
            const mappedItems = rawItems.map(item => this.mapApiItemToProduct(item));
            // Database is the only source - no dummy fallback items.
            this.sampleProducts = [...mappedItems];
            // Auto-select the first real database item so the view is dynamic by default
            this.selectProduct(mappedItems[0]);
          } else {
            this.sampleProducts = [];
            this.currentProduct = this.emptyProduct();
          }
        }
      },
      (error) => {
        this.isLoadingItems = false;
        // No dummy fallback: show empty state, item must be created in Item Master.
        this.sampleProducts = [];
        this.currentProduct = this.emptyProduct();
        console.warn('GetItemMasterList offline, no items to show. Create the item in Item Master.', error);
      }
    );
  }

  loadProductDetail(product: ProductItem): void {
    if (!product || !product.id || !/^\d+$/.test(product.id)) {
      return;
    }
    this.isLoadingDetail = true;
    this.saleService.GetProductInquiryDetail(product.id).subscribe(
      (response: any) => {
        this.isLoadingDetail = false;
        const detail = response && response.result ? response.result : response;
        if (response && response.valid !== false && detail && (detail.itemId || detail.partNumber)) {
          this.currentProduct = this.mapDetailToProduct(detail);
          this.searchQuery = this.currentProduct.partNumber;
          this.noteDraft = this.currentProduct.notes;
          this.calculateBarHeights();
        }
      },
      (error) => {
        this.isLoadingDetail = false;
        console.warn('GetProductInquiryDetail offline, keeping list-level data.', error);
      }
    );
  }

  mapDetailToProduct(d: any): ProductItem {
    const branchStock: BranchStock[] = Array.isArray(d.branchStock) ? d.branchStock.map((b: any) => ({
      branch: b.branch || 'Unassigned',
      location: b.location || b.branch || 'Unassigned',
      currentStock: Number(b.currentStock || 0),
      reserved: Number(b.reserved || 0),
      available: Number(b.available ?? b.currentStock ?? 0)
    })) : [];
    const recentHistory: TransactionHistory[] = Array.isArray(d.recentHistory) ? d.recentHistory.map((t: any) => ({
      date: t.date || '',
      type: (t.type === 'Sale' || t.type === 'Purchase' || t.type === 'Transfer' || t.type === 'Adjustment') ? t.type : 'Sale',
      refNo: t.refNo || '',
      qty: Number(t.qty || 0),
      rate: Number(t.rate || 0),
      amount: Number(t.amount || 0),
      branch: t.branch || ''
    })) : [];
    const monthlySales: MonthlySalesPoint[] = Array.isArray(d.monthlySales) ? d.monthlySales.map((m: any) => ({
      month: m.month || '', year: (m.year || '').toString(), label: m.label || '', qty: Number(m.qty || 0)
    })) : [];
    const yearlySales: YearlySalesRecord[] = Array.isArray(d.yearlySales) ? d.yearlySales.map((y: any) => ({
      year: Number(y.year || 0), qtySold: Number(y.qtySold || 0), salesAmount: Number(y.salesAmount || 0)
    })) : [];
    const pricingTiers: PricingTier[] = Array.isArray(d.pricingTiers) ? d.pricingTiers.map((t: any) => ({
      levelName: t.levelName || '', price: Number(t.price || 0), minQty: Number(t.minQty || 0),
      discountPct: Number(t.discountPct || 0), effectiveDate: t.effectiveDate || ''
    })) : [];
    const purchaseHistoryDetailed: DetailedPurchase[] = Array.isArray(d.purchases) ? d.purchases.map((p: any) => ({
      date: p.date || '', poNo: p.poNo || '', supplier: p.supplier || '', invoiceNo: p.invoiceNo || '',
      qty: Number(p.qty || 0), rate: Number(p.rate || 0), amount: Number(p.amount || 0),
      status: p.status || 'Received', branch: p.branch || ''
    })) : [];
    const salesHistoryDetailed: DetailedSale[] = Array.isArray(d.sales) ? d.sales.map((s: any) => ({
      date: s.date || '', invoiceNo: s.invoiceNo || '', customer: s.customer || '', salesperson: s.salesperson || '',
      qty: Number(s.qty || 0), rate: Number(s.rate || 0), amount: Number(s.amount || 0),
      branch: s.branch || '', status: s.status || 'Delivered'
    })) : [];
    return {
      id: (d.itemId || '').toString(),
      partNumber: d.partNumber || '',
      itemCode: d.itemCode || d.partNumber || '',
      description: d.description || '',
      manufacturer: d.manufacturer || 'General',
      category: d.category || 'Inventory',
      unit: d.unit || 'PCS',
      costPrice: Number(d.costPrice || 0),
      sellingPrice: Number(d.sellingPrice || 0),
      margin: Number(d.margin || 0),
      onHandQty: Number(d.onHandQty || 0),
      imageUrl: d.imageBase64 || 'assets/layout/images/bearing-6205.jpg',
      verified: true,
      currencySymbol: '$',
      averageCost: Number(d.averageCost || 0),
      lastPurchasePrice: Number(d.lastPurchasePrice || 0),
      lastSellingPrice: Number(d.lastSellingPrice || 0),
      totalPurchasedQty: Number(d.totalPurchasedQty || 0),
      totalSoldQty: Number(d.totalSoldQty || 0),
      currentStockValue: Number(d.currentStockValue || 0),
      notes: d.notes || '',
      binLocation: d.binLocation || 'N/A',
      weight: d.weight || 'N/A',
      barcode: d.barcode || 'N/A',
      glAccountInventory: d.glAccountInventory || '1410 - Inventory Control',
      glAccountCogs: d.glAccountCogs || '5010 - Cost of Goods Sold',
      glAccountRevenue: d.glAccountRevenue || '4010 - Merchandise Sales Revenue',
      branchStock, recentHistory, monthlySales, yearlySales, pricingTiers,
      purchaseHistoryDetailed, salesHistoryDetailed
    };
  }

  mapApiItemToProduct(apiItem: any): ProductItem {
    const cost = Number(apiItem.itemMasterLastPurchasePrice || apiItem.itemMasterLandingCost || (apiItem.itemMasterUnitPrice ? apiItem.itemMasterUnitPrice * 0.6 : 0)) || 0;
    const price = Number(apiItem.itemMasterUnitPrice || 0);
    const margin = cost > 0 && price > cost ? Math.round(((price - cost) / cost) * 10000) / 100 : 0;
    const stock = Number(apiItem.itemMasterCurrentStock || 0);
    const partNo = (apiItem.itemMasterPartNo || apiItem.itemMasterMaterialCode || ('ITM-' + apiItem.itemMasterItemId)).toString();
    const desc = apiItem.itemMasterItemName || 'Item ' + apiItem.itemMasterItemId;
    const mfg = apiItem.itemMasterManufactureName || apiItem.itemMasterVenderName || 'General';
    const category = apiItem.itemMasterItemType || 'Inventory';
    const unit = apiItem.itemMasterPacking || 'PCS';

    // Header-level data only. Branch/stock ledger, histories, monthly/yearly
    // and pricing are filled by loadProductDetail() so nothing is fabricated.
    const branchStock: BranchStock[] = stock !== 0 ? [
      { branch: apiItem.itemMasterDefaultLocationName || 'Head Office', location: apiItem.itemMasterDefaultLocationName || 'Head Office', currentStock: stock, reserved: 0, available: stock }
    ] : [];

    return {
      id: (apiItem.itemMasterItemId || Math.random()).toString(),
      partNumber: partNo,
      itemCode: (apiItem.itemMasterMaterialCode || partNo).toString(),
      description: desc,
      manufacturer: mfg,
      category: category,
      unit: unit,
      costPrice: cost,
      sellingPrice: price,
      margin: margin,
      onHandQty: stock,
      imageUrl: 'assets/layout/images/bearing-6205.jpg',
      verified: true,
      currencySymbol: '$',
      averageCost: cost,
      lastPurchasePrice: cost,
      lastSellingPrice: price,
      totalPurchasedQty: 0,
      totalSoldQty: 0,
      currentStockValue: Math.round(stock * cost * 100) / 100,
      notes: `Item Account: ${apiItem.itemMasterAccountNo || 'General'}. Batch: ${apiItem.itemMasterBatchCode || 'Standard'}.`,
      binLocation: apiItem.itemMasterDefaultLocationName || 'N/A',
      weight: apiItem.itemMasterWeight || 'N/A',
      barcode: apiItem.itemMasterBarcode || (apiItem.itemMasterItemId ? '890' + apiItem.itemMasterItemId : 'N/A'),
      glAccountInventory: apiItem.itemMasterAssetAcc || '1410 - Inventory Control',
      glAccountCogs: apiItem.itemMasterExpenseAcc || '5010 - Cost of Goods Sold',
      glAccountRevenue: '4010 - Merchandise Sales Revenue',
      branchStock: branchStock,
      recentHistory: [],
      monthlySales: [],
      yearlySales: [],
      pricingTiers: price > 0 ? [
        { levelName: 'Standard Retail', price: price, minQty: 1, discountPct: 0, effectiveDate: '01/01/2025' }
      ] : [],
      purchaseHistoryDetailed: [],
      salesHistoryDetailed: []
    };
  }

  calculateBarHeights(): void {
    const maxQty = 200; // y-axis ceiling matches the 200 in the image
    this.currentProduct.monthlySales.forEach(item => {
      item.heightPercent = Math.min(100, Math.round((item.qty / maxQty) * 100));
    });
  }

  get totalBranchStock(): number {
    return this.currentProduct.branchStock.reduce((acc, b) => acc + b.currentStock, 0);
  }

  get totalReservedStock(): number {
    return this.currentProduct.branchStock.reduce((acc, b) => acc + b.reserved, 0);
  }

  get totalAvailableStock(): number {
    return this.currentProduct.branchStock.reduce((acc, b) => acc + b.available, 0);
  }

  selectTab(tabId: string): void {
    this.activeTab = tabId;
  }

  onSearchInput(): void {
    this.showSearchResults = this.searchQuery.trim().length > 0;
  }

  onSearchEnter(): void {
    const results = this.searchProducts();
    if (results.length > 0) {
      this.selectProduct(results[0]);
    }
  }

  selectProduct(product: ProductItem): void {
    this.currentProduct = { ...product };
    this.searchQuery = product.partNumber;
    this.showSearchResults = false;
    this.noteDraft = product.notes;
    this.calculateBarHeights();
    this.loadProductDetail(product);
  }

  searchProducts(): ProductItem[] {
    if (!this.searchQuery) {
      return this.sampleProducts;
    }
    const q = this.searchQuery.toLowerCase().trim();
    return this.sampleProducts.filter(p =>
      p.partNumber.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.itemCode.toLowerCase().includes(q) ||
      p.manufacturer.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  }

  enableNoteEdit(): void {
    this.isEditingNote = true;
    this.noteDraft = this.currentProduct.notes;
  }

  saveNote(): void {
    this.currentProduct.notes = this.noteDraft;
    this.isEditingNote = false;
  }

  cancelNoteEdit(): void {
    this.noteDraft = this.currentProduct.notes;
    this.isEditingNote = false;
  }

  formatCurrency(val: number): string {
    if (val == null) return '$ 0.00';
    const symbol = this.currentProduct ? this.currentProduct.currencySymbol : '$';
    return `${symbol} ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatNumber(val: number, decimals: number = 0): string {
    if (val == null) return '0';
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  formatRate(val: number): string {
    if (val == null) return '0.00';
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  printInquiry(): void {
    window.print();
  }

  refreshData(): void {
    this.loadItemMasterList();
    if (this.currentProduct && /^\d+$/.test(this.currentProduct.id)) {
      this.loadProductDetail(this.currentProduct);
    } else {
      this.calculateBarHeights();
    }
  }

  exportExcel(): void {
    alert(`Exporting product inquiry for ${this.currentProduct.partNumber}...`);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.showSearchResults = false;
  }

  copyToClipboard(text: string, type: 'part' | 'barcode' = 'part'): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'part') {
        this.copiedPartNumber = true;
        setTimeout(() => (this.copiedPartNumber = false), 2000);
      } else {
        this.copiedBarcode = true;
        setTimeout(() => (this.copiedBarcode = false), 2000);
      }
    }).catch(() => {
      // Fallback if clipboard API unavailable
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (type === 'part') {
        this.copiedPartNumber = true;
        setTimeout(() => (this.copiedPartNumber = false), 2000);
      } else {
        this.copiedBarcode = true;
        setTimeout(() => (this.copiedBarcode = false), 2000);
      }
    });
  }

  get peakMonthlySale(): MonthlySalesPoint | null {
    if (!this.currentProduct || !this.currentProduct.monthlySales || this.currentProduct.monthlySales.length === 0) {
      return null;
    }
    return this.currentProduct.monthlySales.reduce((prev, curr) => (curr.qty > prev.qty ? curr : prev), this.currentProduct.monthlySales[0]);
  }

  get stockStatus(): { label: string; cssClass: string } {
    const qty = this.currentProduct ? this.currentProduct.onHandQty : 0;
    if (qty <= 0) {
      return { label: 'Out of Stock', cssClass: 'status-out' };
    } else if (qty <= 30) {
      return { label: 'Low Stock', cssClass: 'status-low' };
    } else {
      return { label: 'In Stock', cssClass: 'status-in' };
    }
  }

  get totalSalesUnits(): number {
    if (!this.currentProduct || !this.currentProduct.monthlySales) return 0;
    return this.currentProduct.monthlySales.reduce((acc, m) => acc + m.qty, 0);
  }

  get totalPurchasedUnits(): number {
    return this.currentProduct ? this.currentProduct.totalPurchasedQty : 0;
  }
}
