# ERP Internationalization (i18n) Component-by-Component Rollout Guide

This guide establishes the standardized procedure for translating any ERP component into **English (`en-US`)**, **Arabic (`ar-SA`)**, and **Russian (`ru-RU`)**.

---

## 1. System Architecture Overview

- **Engine**: `@ngx-translate/core` with HTTP loader (`./assets/i18n/{lang}.json`).
- **Storage**: `LocalStorageService` persists the active language (`'app_language'`) and direction (`'app_direction'`).
- **Bidirectional Support**:
  - `en-US` & `ru-RU`: LTR (`dir="ltr"`, `lang="en"` or `lang="ru"`)
  - `ar-SA`: RTL (`dir="rtl"`, `lang="ar"`, `.rtl` CSS class applied to `document.body` and root)
- **Shared Module**: `SharedModule` exports `TranslateModule`, making the `translate` pipe and directives available automatically in any module that imports `SharedModule`.

---

## 2. Step-by-Step Component Translation Procedure

When localizing a new or existing component, follow these 3 simple steps:

### Step 1: Identify and Add Translation Keys to JSON Files
Open the three master dictionary files:
1. `src/assets/i18n/en-US.json`
2. `src/assets/i18n/ar-SA.json`
3. `src/assets/i18n/ru-RU.json`

Add a dedicated section for your component (or reuse common action keys):

```json
  "// --- COMPONENT: [COMPONENT NAME] ---": "",
  "Field Label": "Field Label (EN) / تسمية الحقل (AR) / Метка поля (RU)",
  "Table Header": "Table Header (EN) / رأس الجدول (AR) / Заголовок таблицы (RU)"
```

### Step 2: Update the Component HTML Template
Apply the `translate` pipe to buttons, labels, headers, placeholders, and dialogs:

#### A. PrimeNG Toolbar Buttons:
```html
<!-- Before -->
<button pButton type="button" label="Save" class="ui-button-success"></button>
<button pButton type="button" label="Exit" class="ui-button-danger"></button>

<!-- After -->
<button pButton type="button" [label]="'Save' | translate" class="ui-button-success"></button>
<button pButton type="button" [label]="'Exit' | translate" class="ui-button-danger"></button>
```

#### B. Form Labels & Radio Buttons:
```html
<!-- Before -->
<label>Customer Name</label>
<p-radioButton name="type" value="Customer" label="Customer"></p-radioButton>

<!-- After -->
<label>{{ 'Customer Name' | translate }}</label>
<p-radioButton name="type" value="Customer" [label]="'Customer' | translate"></p-radioButton>
```

#### C. Input Placeholders:
```html
<!-- Before -->
<input pInputText placeholder="Search pages..." />
<p-dropdown placeholder="Select Type"></p-dropdown>

<!-- After -->
<input pInputText [placeholder]="'Search' | translate" />
<p-dropdown [placeholder]="'Select Type' | translate"></p-dropdown>
```

#### D. Table Column Headers:
```html
<!-- Before -->
<th pSortableColumn="accNo">Acc No <p-sortIcon field="accNo"></p-sortIcon></th>

<!-- After -->
<th pSortableColumn="accNo">{{ 'Acc No' | translate }} <p-sortIcon field="accNo"></p-sortIcon></th>
```

#### E. Page Header:
```html
<app-page-header
  [nav]="[
    { label: 'account' | translate },
    { label: 'Outstanding Statement' | translate }
  ]"
  [title]="title | translate"
></app-page-header>
```

### Step 3: Handle Dynamic TypeScript Arrays (Dropdowns / Context Menus)
If options or menu models are defined in `.ts`:

```typescript
// Inject TranslateService
constructor(private translate: TranslateService) {}

ngOnInit() {
  this.loadOptions();
  // Listen for language changes to update in-memory labels
  this.translate.onLangChange.subscribe(() => {
    this.loadOptions();
  });
}

loadOptions() {
  this.customerTypes = [
    { label: this.translate.instant('Customers'), value: 'Receivable' },
    { label: this.translate.instant('Suppliers'), value: 'Payable' },
  ];
}
```

---

## 3. RTL Formatting Guidelines (Arabic)

- **Currencies & Amounts**: Always keep amounts in LTR for clean readability:
  `<span class="amount">{{ total | number: '1.2-2' }}</span>` (The global CSS rule enforces `direction: ltr !important` on `.amount` and `.currency`).
- **Dates & Phone Numbers**: Use `.phone-number` or `.date-val` classes to prevent characters from flipping backwards.
- **Handsontable Grids**: Automatically protected by `.handsontable { direction: ltr !important; }`.
