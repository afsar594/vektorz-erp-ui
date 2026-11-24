import { Component, OnInit } from '@angular/core';

export interface ItemHistoryRecord {
  date: string;
  type: string;
  qty: number;
  refNo: string;
}

export interface ItemPriceTier {
  tier: string;
  price: number;
}

export interface SalesLineItem {
  id: number;
  partNo: string;
  description: string;
  brand: string;
  qty: number;
  unitPrice: number;
  discountPct: number;
  total: number;
  category: string;
  unit: string;
  imageUrl: string;
  inStock: number;
  reorderLevel: number;
  location: string;
  remarks?: string;
  history: ItemHistoryRecord[];
  priceTiers: ItemPriceTier[];
}

export interface InvoiceHeader {
  invoiceNo: string;
  date: string;
  customer: string;
  contactNo: string;
  reference: string;
  paymentTerms: string;
  salesPerson: string;
  notes: string;
}

@Component({
  selector: 'app-sales-issue',
  templateUrl: './sales-issue.component.html',
  styleUrls: ['./sales-issue.component.scss']
})
export class SalesIssueComponent implements OnInit {
  invoice: InvoiceHeader = {
    invoiceNo: 'IN-000124',
    date: '08/09/2025',
    customer: 'AL FAHAD TRADING LLC',
    contactNo: '+968 9123 4567',
    reference: 'SO-4587',
    paymentTerms: 'Net 30 Days',
    salesPerson: 'Rizwan',
    notes: ''
  };

  paymentTermsList: string[] = [
    'Net 30 Days',
    'Net 15 Days',
    'Net 60 Days',
    'Cash on Delivery',
    'Immediate'
  ];

  Math = Math;

  salesPersonList: string[] = [
    'Rizwan',
    'Ahmed Al-Harthy',
    'Said Al-Mamari',
    'Salim Al-Kiyumi'
  ];

  searchQuery: string = '';
  showItemSearchDropdown: boolean = false;
  activeSideTab: 'history' | 'price' | 'images' | 'remarks' = 'history';

  // Master catalog of products for search and adding
  catalogProducts: SalesLineItem[] = [
    {
      id: 1,
      partNo: 'BGA.6204.C3',
      description: 'Ball Bearing 6204 C3',
      brand: 'SKF',
      qty: 5,
      unitPrice: 12.50,
      discountPct: 0,
      total: 62.50,
      category: 'Bearings',
      unit: 'PCS',
      imageUrl: 'assets/layout/images/bearing-6205.jpg',
      inStock: 35,
      reorderLevel: 10,
      location: 'A1-01',
      remarks: 'Standard deep groove radial bearing with C3 internal clearance.',
      priceTiers: [
        { tier: 'Retail List', price: 12.50 },
        { tier: 'Wholesale Tier 1', price: 11.25 },
        { tier: 'Contract Minimum', price: 10.00 }
      ],
      history: [
        { date: '08/09/2025', type: 'Sales', qty: -5, refNo: 'IN-000124' },
        { date: '01/09/2025', type: 'Purchase', qty: 25, refNo: 'PO-00042' },
        { date: '22/08/2025', type: 'Sales', qty: -4, refNo: 'IN-000115' }
      ]
    },
    {
      id: 2,
      partNo: 'BGA.6205.C3',
      description: 'Ball Bearing 6205 C3',
      brand: 'SKF',
      qty: 4,
      unitPrice: 14.75,
      discountPct: 5,
      total: 56.20,
      category: 'Bearings',
      unit: 'PCS',
      imageUrl: 'assets/layout/images/bearing-6205.jpg',
      inStock: 42,
      reorderLevel: 12,
      location: 'A1-02',
      remarks: 'Single row ball bearing with pressed steel cage.',
      priceTiers: [
        { tier: 'Retail List', price: 14.75 },
        { tier: 'Wholesale Tier 1', price: 13.25 },
        { tier: 'Contract Minimum', price: 11.80 }
      ],
      history: [
        { date: '08/09/2025', type: 'Sales', qty: -4, refNo: 'IN-000124' },
        { date: '03/09/2025', type: 'Sales', qty: -2, refNo: 'IN-000122' },
        { date: '25/08/2025', type: 'Purchase', qty: 30, refNo: 'PO-00043' }
      ]
    },
    {
      id: 3,
      partNo: 'BGA.6206.C3',
      description: 'Ball Bearing 6206 C3',
      brand: 'SKF',
      qty: 6,
      unitPrice: 18.00,
      discountPct: 0,
      total: 108.00,
      category: 'Bearings',
      unit: 'PCS',
      imageUrl: 'assets/layout/images/bearing-6205.jpg',
      inStock: 48,
      reorderLevel: 10,
      location: 'A1-02',
      remarks: 'High rotational velocity deep groove ball bearing.',
      priceTiers: [
        { tier: 'Retail List', price: 18.00 },
        { tier: 'Wholesale Tier 1', price: 16.20 },
        { tier: 'Contract Minimum', price: 14.40 }
      ],
      history: [
        { date: '08/09/2025', type: 'Sales', qty: -6, refNo: 'IN-000124' },
        { date: '05/09/2025', type: 'Sales', qty: -3, refNo: 'IN-000121' },
        { date: '02/09/2025', type: 'Purchase', qty: 20, refNo: 'PO-00045' },
        { date: '28/08/2025', type: 'Sales', qty: -4, refNo: 'IN-000117' },
        { date: '21/08/2025', type: 'Sales', qty: -2, refNo: 'IN-000110' }
      ]
    },
    {
      id: 4,
      partNo: 'PUL.2304',
      description: 'V-Belt Pulley 2304',
      brand: 'Mitsuboshi',
      qty: 5,
      unitPrice: 40.00,
      discountPct: 10,
      total: 180.00,
      category: 'Transmission',
      unit: 'PCS',
      imageUrl: 'assets/layout/images/bearing-6205.jpg',
      inStock: 18,
      reorderLevel: 5,
      location: 'B2-05',
      remarks: 'Dual groove precision cast iron pulley.',
      priceTiers: [
        { tier: 'Retail List', price: 40.00 },
        { tier: 'Wholesale Tier 1', price: 36.00 },
        { tier: 'Contract Minimum', price: 32.00 }
      ],
      history: [
        { date: '08/09/2025', type: 'Sales', qty: -5, refNo: 'IN-000124' },
        { date: '18/08/2025', type: 'Purchase', qty: 10, refNo: 'PO-00039' }
      ]
    },
    {
      id: 5,
      partNo: 'FIL.0012',
      description: 'Oil Filter 0012',
      brand: 'Fleetguard',
      qty: 4,
      unitPrice: 75.00,
      discountPct: 0,
      total: 300.00,
      category: 'Filtration',
      unit: 'PCS',
      imageUrl: 'assets/layout/images/bearing-6205.jpg',
      inStock: 24,
      reorderLevel: 8,
      location: 'C1-14',
      remarks: 'Heavy duty spin-on lube oil filter.',
      priceTiers: [
        { tier: 'Retail List', price: 75.00 },
        { tier: 'Wholesale Tier 1', price: 68.00 },
        { tier: 'Contract Minimum', price: 60.00 }
      ],
      history: [
        { date: '08/09/2025', type: 'Sales', qty: -4, refNo: 'IN-000124' },
        { date: '29/08/2025', type: 'Purchase', qty: 15, refNo: 'PO-00041' }
      ]
    },
    {
      id: 6,
      partNo: 'HYD.3042',
      description: 'Hydraulic Cylinder 50x250',
      brand: 'Parker',
      qty: 1,
      unitPrice: 220.00,
      discountPct: 0,
      total: 220.00,
      category: 'Hydraulics',
      unit: 'PCS',
      imageUrl: 'assets/layout/images/bearing-6205.jpg',
      inStock: 12,
      reorderLevel: 3,
      location: 'H-04-12',
      remarks: 'Double acting high pressure cylinder.',
      priceTiers: [
        { tier: 'Retail List', price: 220.00 },
        { tier: 'Wholesale Tier 1', price: 195.00 }
      ],
      history: [
        { date: '04/09/2025', type: 'Sales', qty: -1, refNo: 'IN-000120' }
      ]
    }
  ];

  // Active line items in the invoice
  lineItems: SalesLineItem[] = [];

  // Currently selected row driving the right-hand panel
  selectedItem!: SalesLineItem;

  // Modal Dialogs state
  showItemDialog: boolean = false;
  isEditMode: boolean = false;
  itemForm: {
    id?: number;
    partNo: string;
    description: string;
    brand: string;
    qty: number;
    unitPrice: number;
    discountPct: number;
  } = {
    partNo: '',
    description: '',
    brand: '',
    qty: 1,
    unitPrice: 0,
    discountPct: 0
  };

  // Quick Action Modal state
  showQuickActionModal: boolean = false;
  quickActionTitle: string = '';
  quickActionType: string = '';

  // Toast / notification
  notificationMessage: string = '';
  showNotification: boolean = false;

  ngOnInit(): void {
    // Initialize with first 5 sample items from the screenshot
    this.lineItems = this.catalogProducts.slice(0, 5).map(item => ({ ...item }));
    // Row 3 (BGA.6206.C3) is initially selected, matching screenshot
    this.selectedItem = this.lineItems[2] || this.lineItems[0];
  }

  // Row selection
  selectItem(item: SalesLineItem): void {
    this.selectedItem = item;
  }

  selectItemAndTab(item: SalesLineItem, tab: 'history' | 'price' | 'images' | 'remarks'): void {
    this.selectedItem = item;
    this.activeSideTab = tab;
  }

  calcBranchStock(stock: number, ratio: number): number {
    return Math.round((stock || 0) * ratio);
  }

  get computedItemTotal(): number {
    const gross = (Number(this.itemForm.qty) || 0) * (Number(this.itemForm.unitPrice) || 0);
    const disc = gross * ((Number(this.itemForm.discountPct) || 0) / 100);
    return Math.round((gross - disc) * 100) / 100;
  }

  // Side Tab Switching
  setSideTab(tab: 'history' | 'price' | 'images' | 'remarks'): void {
    this.activeSideTab = tab;
  }

  // Financial Calculations
  get totalItemsCount(): number {
    return this.lineItems.length;
  }

  get totalQuantity(): number {
    return this.lineItems.reduce((acc, item) => acc + (Number(item.qty) || 0), 0);
  }

  get subTotal(): number {
    // In the screenshot: Sub Total = 1,233.70 (undiscounted total of lines)
    return this.lineItems.reduce((acc, item) => {
      const gross = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
      return acc + gross;
    }, 0);
  }

  get totalDiscount(): number {
    // In screenshot: Discount = 13.20
    return this.lineItems.reduce((acc, item) => {
      const gross = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
      const disc = gross * ((Number(item.discountPct) || 0) / 100);
      return acc + disc;
    }, 0);
  }

  get taxAmount(): number {
    // 5% VAT on discounted subtotal
    const taxableAmount = this.subTotal - this.totalDiscount;
    return Math.round(taxableAmount * 0.05 * 100) / 100;
  }

  get grandTotal(): number {
    // Sub Total - Discount + Tax (5%) = 1,220.50
    return (this.subTotal - this.totalDiscount) + this.taxAmount;
  }

  // Search Filter
  get filteredCatalog(): SalesLineItem[] {
    if (!this.searchQuery.trim()) {
      return this.catalogProducts;
    }
    const q = this.searchQuery.toLowerCase().trim();
    return this.catalogProducts.filter(p =>
      p.partNo.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );
  }

  onSearchFocus(): void {
    this.showItemSearchDropdown = true;
  }

  onSearchBlur(): void {
    // Small delay to allow click on dropdown item
    setTimeout(() => {
      this.showItemSearchDropdown = false;
    }, 250);
  }

  addCatalogItemToInvoice(product: SalesLineItem): void {
    const existing = this.lineItems.find(i => i.partNo === product.partNo);
    if (existing) {
      existing.qty += 1;
      this.recalculateLineTotal(existing);
      this.selectedItem = existing;
      this.notify(`Increased quantity for ${product.partNo}`);
    } else {
      const newItem: SalesLineItem = {
        ...product,
        id: Date.now(),
        qty: 1,
        total: Math.round(product.unitPrice * (1 - product.discountPct / 100) * 100) / 100
      };
      this.lineItems.push(newItem);
      this.selectedItem = newItem;
      this.notify(`Added ${product.partNo} to invoice`);
    }
    this.searchQuery = '';
    this.showItemSearchDropdown = false;
  }

  recalculateLineTotal(item: SalesLineItem): void {
    const gross = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
    const disc = gross * ((Number(item.discountPct) || 0) / 100);
    item.total = Math.round((gross - disc) * 100) / 100;
  }

  // Add / Edit Modal Controls
  openAddItemModal(): void {
    this.isEditMode = false;
    this.itemForm = {
      partNo: '',
      description: '',
      brand: 'SKF',
      qty: 1,
      unitPrice: 0,
      discountPct: 0
    };
    this.showItemDialog = true;
  }

  openEditItemModal(): void {
    if (!this.selectedItem) return;
    this.isEditMode = true;
    this.itemForm = {
      id: this.selectedItem.id,
      partNo: this.selectedItem.partNo,
      description: this.selectedItem.description,
      brand: this.selectedItem.brand,
      qty: this.selectedItem.qty,
      unitPrice: this.selectedItem.unitPrice,
      discountPct: this.selectedItem.discountPct
    };
    this.showItemDialog = true;
  }

  saveItemForm(): void {
    if (!this.itemForm.partNo.trim()) {
      alert('Please enter a Part Number.');
      return;
    }

    if (this.isEditMode && this.selectedItem) {
      this.selectedItem.partNo = this.itemForm.partNo;
      this.selectedItem.description = this.itemForm.description;
      this.selectedItem.brand = this.itemForm.brand;
      this.selectedItem.qty = Number(this.itemForm.qty) || 1;
      this.selectedItem.unitPrice = Number(this.itemForm.unitPrice) || 0;
      this.selectedItem.discountPct = Number(this.itemForm.discountPct) || 0;
      this.recalculateLineTotal(this.selectedItem);
      this.notify(`Updated line item ${this.selectedItem.partNo}`);
    } else {
      const gross = (Number(this.itemForm.qty) || 1) * (Number(this.itemForm.unitPrice) || 0);
      const disc = gross * ((Number(this.itemForm.discountPct) || 0) / 100);
      const total = Math.round((gross - disc) * 100) / 100;

      const newItem: SalesLineItem = {
        id: Date.now(),
        partNo: this.itemForm.partNo,
        description: this.itemForm.description || this.itemForm.partNo,
        brand: this.itemForm.brand || 'General',
        qty: Number(this.itemForm.qty) || 1,
        unitPrice: Number(this.itemForm.unitPrice) || 0,
        discountPct: Number(this.itemForm.discountPct) || 0,
        total: total,
        category: 'Spares',
        unit: 'PCS',
        imageUrl: 'assets/layout/images/bearing-6205.jpg',
        inStock: 25,
        reorderLevel: 5,
        location: 'A1-05',
        history: [
          { date: this.invoice.date, type: 'Sales', qty: -(Number(this.itemForm.qty) || 1), refNo: this.invoice.invoiceNo }
        ],
        priceTiers: [
          { tier: 'Retail List', price: Number(this.itemForm.unitPrice) || 0 }
        ]
      };
      this.lineItems.push(newItem);
      this.selectedItem = newItem;
      this.notify(`Added ${newItem.partNo} to invoice`);
    }

    this.showItemDialog = false;
  }

  closeItemModal(): void {
    this.showItemDialog = false;
  }

  removeItem(): void {
    if (!this.selectedItem) return;
    const idx = this.lineItems.findIndex(i => i.id === this.selectedItem.id);
    if (idx !== -1) {
      const removedPart = this.selectedItem.partNo;
      this.lineItems.splice(idx, 1);
      if (this.lineItems.length > 0) {
        this.selectedItem = this.lineItems[Math.max(0, idx - 1)];
      }
      this.notify(`Removed ${removedPart} from invoice`);
    }
  }

  // Header Actions
  newInvoice(): void {
    const nextNo = 'IN-000' + Math.floor(100 + Math.random() * 900);
    this.invoice = {
      invoiceNo: nextNo,
      date: new Date().toLocaleDateString('en-GB'),
      customer: 'AL FAHAD TRADING LLC',
      contactNo: '+968 9123 4567',
      reference: 'SO-' + Math.floor(1000 + Math.random() * 9000),
      paymentTerms: 'Net 30 Days',
      salesPerson: 'Rizwan',
      notes: ''
    };
    this.lineItems = [];
    this.notify(`Started new invoice ${nextNo}`);
  }

  saveInvoice(): void {
    this.notify(`Invoice ${this.invoice.invoiceNo} saved successfully!`);
  }

  printInvoice(): void {
    window.print();
  }

  cancelInvoice(): void {
    if (confirm('Are you sure you want to cancel the current invoice entry?')) {
      this.newInvoice();
    }
  }

  // Quick Action Buttons (bottom right)
  openQuickAction(type: 'product' | 'inventory' | 'history' | 'movement'): void {
    this.quickActionType = type;
    if (type === 'product') {
      this.quickActionTitle = `Product Details: ${this.selectedItem?.partNo || 'Selected Item'}`;
    } else if (type === 'inventory') {
      this.quickActionTitle = `Multi-Branch Inventory: ${this.selectedItem?.partNo || 'Selected Item'}`;
    } else if (type === 'history') {
      this.quickActionTitle = `Transaction Audit History: ${this.selectedItem?.partNo || 'Selected Item'}`;
    } else if (type === 'movement') {
      this.quickActionTitle = `Stock Movements & Bin Locations`;
    }
    this.showQuickActionModal = true;
  }

  closeQuickActionModal(): void {
    this.showQuickActionModal = false;
  }

  // Helpers
  formatNumber(val: number, decimals: number = 2): string {
    if (val == null) return '0.00';
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  notify(msg: string): void {
    this.notificationMessage = msg;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 2800);
  }
}
