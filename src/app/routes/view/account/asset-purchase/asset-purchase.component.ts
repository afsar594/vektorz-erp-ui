import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { AssetPurchase } from 'src/app/routes/domain/Accounts/AssetPurchase';
import { AssetPurchaseVoucherDetails } from 'src/app/routes/domain/Accounts/AssetPurchaseDetails';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ConfirmationService, MessageService, SelectItem } from 'primeng';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { ChartofAccounts } from 'src/app/routes/domain';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
@Component({
  selector: 'app-asset-purchase',
  templateUrl: './asset-purchase.component.html',
  styleUrls: ['./asset-purchase.component.scss'],
})
export class AssetPurchaseComponent implements OnInit {
  @ViewChild('hotTable') hotTable: any;

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[];
  locationArry: string[] = [];
  currencyList: SelectItem[];
  currArry: string[] = [];
  lookupGridColumns = [];
  displayMaximizable: boolean;
  AssetPurchaseVoucherDetails: AssetPurchase;
  savedAssetPurchase: AssetPurchase;
  confirmDropDatabaseDialogVisible = false;

  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];
  Assetpurchaseorder_entryDataset = [];

  assetPurchaseentry: Handsontable.GridSettings;
  assetPurchaseFormGroup: FormGroup;
  btnFlag: ButtonFlag;
  DefCurCheck: string;
  DefCurrency: string;
  accountTransactionList: AccountsTransactions[] = [];
  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];
  title: string;
  dataList: Array<any> = [];
  subtitle: string;
  dataset: any;
  showProcurementsLookUp: boolean = false;
  rptFilter: ReportFilterModel;

  cols;
  index: number = 0;
  location: Array<string>;
  supplier: Array<string>;
  licensekey: any;
  gridHeader: string;
  assetsArray: Array<string>;
  invoiceType: Array<{ value: string }>;
  dummyGroup: FormGroup;
  assetPurchasearry: any;
  defaltLocation: string;
  defaltCurrency: any;
  IsAcount: boolean;
  detail: boolean;
  sign: any;
  activeRow: { row: number; column: number };
  selectItem: any;
  currentRow: number;
  ScreenId: number;
  DefLocCheck: string;
  DefLocid: string;
  locationLocked = false;
  VatCalculation: boolean = false;
  JOBCOST: Boolean = false;
  Permission: any;
  user: any;
  totalcostPrice: number;
  pdfSource: any;
  handleChange(e) {
    this.index = e.index;
  }

  v_typeList: SelectItem[] = [];
  hotid = 'assetPurchaseentry';
  private hotRegisterer = new HotTableRegisterer();
  AssetPurchase: Handsontable.GridSettings;

  initializeControls() {
    this.v_typeList = [
      { label: '  -- Select --', value: null },
      { label: 'CASH', value: 'CASH' },
      { label: 'CREDIT', value: 'CREDIT' },
    ];
    this.sign = [
      { label: '+', value: '+' },
      { label: '-', value: '-' },
    ];
    this.assetPurchaseentry = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 5,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      enterMoves: { row: 0, col: 1 },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      // allowInsertColumn: false,
      // allowRemoveColumn: false,
      // allowRemoveRow: false,
      // autoWrapRow: false,
      // autoWrapCol: false,
      //  autoWrapRow: true,
      // height: 487,
      // maxRows: 22,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      readOnly: true,
      columns: [
        {
          data: 'Code',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'AssetName',
          type: 'text',
          // type: 'autocomplete',
          // source:(query, callback) =>{
          //   callback(this.assetsArray);
          // },
          width: 150,
        },
        // {
        //   data: 'PurrDate',
        //   type: 'text'
        // },
        {
          data: 'PurrDate',
          type: 'date',
          width: 80,
        },
        {
          data: 'PurrReffNo',
          type: 'text',
          width: 80,
        },
        {
          data: 'Qty',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'Rate',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'Amount',
          type: 'numeric',
          readOnly: true,
          width: 80,
        },
        // {
        //   data: 'LifeInYrs',
        //   type: 'numeric'
        // },
        // {
        //   data: 'DepMode',
        //   type: 'text'
        // },
        // {
        //   data: 'DepAmt',
        //   type: 'numeric'
        // },
        // {
        //   data: 'DepPerc',
        //   type: 'numeric'
        // },
        {
          data: 'Remarks',
          type: 'text',
          width: 150,
        },
      ],
      colHeaders: [
        this.translate.instant('Code'),
        this.translate.instant('Asset Name'),
        this.translate.instant('PurDate'),
        this.translate.instant('PurrReffNo'),
        this.translate.instant('Qty'),
        this.translate.instant('Rate'),
        this.translate.instant('Amount'),
        // this.translate.instant('LifeInYrs'),
        // this.translate.instant('DepMode'),
        // this.translate.instant('DepAmt'),
        // this.translate.instant('DepPerc'),
        this.translate.instant('Remarks'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
    this.assetPurchaseentry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      // setting if prevent scrolling after selection
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
      this.currentRow = row;

      if (column === 0 && this.assetPurchaseentry.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showProcurementsLookUp = true;
        this.activeRow = { row, column };
      }
    };
    this.assetPurchaseentry.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      if (change != null) {
        var data = hotinstance.getDataAtRow(change[0][0]);

        if (data[4] != null && data[5] != null && change[0][1] != 'Amount') {
          var sum1 = data[4] * data[5];

          var discountValue = data[7] * data[4];
          if (discountValue > sum1) {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Discount must be less than net amount',
            });
            this.hotRegisterer
              .getInstance(this.hotid)
              .setDataAtCell(change[0][0], 7, 0);
          } else {
            var totalSum = data[4] * data[5];
            var discValue = data[7] * data[4];
            var result = totalSum - discValue;
            if (this.currentRow >= 0 && data[0] != null) {
              if (
                this.Assetpurchaseorder_entryDataset[this.currentRow].Code ===
                undefined
              ) {
                return;
              }

              this.Assetpurchaseorder_entryDataset[this.currentRow].Amount =
                totalSum;
              // this.Assetpurchaseorder_entryDataset[this.currentRow].netAmt = result;

              this.hotRegisterer
                .getInstance(this.hotid)
                .updateSettings({ data: this.Assetpurchaseorder_entryDataset });
            }
          }
        }
      }
      this.ColumnSum();
    };
    //   this.assetPurchaseentry.beforeChangeRender = (change, source) => {
    //     const hotinstance = this.hotRegisterer.getInstance(this.hotid);

    //     if (change !== null) {
    //         const rowIndex = change[0][0];
    //         const data = hotinstance.getDataAtRow(rowIndex);

    //         if (data[4] != null && data[5] != null) {
    //             const quantity = parseFloat(data[4]) || 0;
    //             const unitPrice = parseFloat(data[5]) || 0;
    //             const discountRate = parseFloat(data[7]) || 0;

    //             const totalSum = quantity * unitPrice;

    //             const discountValue = (discountRate / 100) * totalSum;

    //             const result = totalSum - discountValue;

    //             //const vatAmount = (result * 5) / 100;

    //             const finalAmount = result
    //             //+ vatAmount;

    //             hotinstance.setDataAtCell(rowIndex, 6, finalAmount);  // Assuming "Amount" is at column index 6
    //         }
    //     }
    // };

    this.getAllCurrency();
    this.getAllSupplierMaster();
    this.getAllAccountTransaction();
  }

  CalcDiscFromAmt() {
    this.assetPurchaseFormGroup.controls.disPer.setValue(
      parseFloat(
        (
          (Number(this.assetPurchaseFormGroup.value.DisAmount) * 100) /
          Number(this.assetPurchaseFormGroup.value.grossTotal)
        ).toFixed(2)
      )
    );
    this.GetTotal();
  }
  CalcDiscFromPer() {
    this.assetPurchaseFormGroup.controls.DisAmount.setValue(
      parseFloat(
        (
          (Number(this.assetPurchaseFormGroup.value.grossTotal) *
            Number(this.assetPurchaseFormGroup.value.disPer)) /
          100
        ).toFixed(2)
      )
    );
    this.GetTotal();
  }

  GetTotal($event = null) {
    const formValues = this.assetPurchaseFormGroup.value;

    const totalGrossAmount = Number(formValues.grossTotal) || 0;
    const totalitemDisAmount = Number(formValues.DisAmount) || 0;
    const totalActualAmount = totalGrossAmount;

    this.assetPurchaseFormGroup.controls.grossTotal.setValue(
      totalActualAmount.toFixed(2)
    );

    const vatPercentage = Number(formValues.VatPer) || 0;
    const vatAmount = (totalActualAmount * vatPercentage) / 100;

    this.assetPurchaseFormGroup.controls.salesVoucherVatAmt.setValue(
      vatAmount.toFixed(2)
    );

    const vatRoundSign = formValues.vatRoundSign || '-';
    const vatRoundAmount = Number(formValues.roundOff) || 0;
    const TotalDisAmount = Number(formValues.DisAmount) || 0;

    let netAmount = totalActualAmount - TotalDisAmount + vatAmount;
    if (vatRoundSign === '+') {
      netAmount += vatRoundAmount;
    } else if (vatRoundSign === '-') {
      netAmount -= vatRoundAmount;
    } else {
      formValues.vatRoundSign = '-'; // Default to '-'
    }

    this.assetPurchaseFormGroup.controls.grandTotal.setValue(
      netAmount.toFixed(2)
    );

    // Convert net amount to words
    // const toWords = new ToWords();
    // this.sumwordsnew = toWords.convert(netAmount, { currency: true });
  }
  ColumnSum() {
    var discountTotal = 0;
    var disc = 0;
    this.Assetpurchaseorder_entryDataset.forEach((elemt: any) => {
      if (elemt && elemt.disc && elemt && elemt.qty) {
        discountTotal += elemt.disc * elemt.qty;
        discountTotal = parseFloat(discountTotal.toFixed(2));
      }
    });
    disc += discountTotal;
    disc = parseFloat(disc.toFixed(2));
    this.assetPurchaseFormGroup.controls.DisAmount.setValue(disc);
    var value = 0;
    var netAmount = 0;
    var vatamt = 0;
    this.Assetpurchaseorder_entryDataset.forEach((elemt: any) => {
      if (elemt && elemt.vatAmt) {
        vatamt += elemt.vatAmt;
      }
    });
    vatamt = parseFloat(vatamt.toFixed(2));
    // vatamt =
    //   vatamt -
    //   (this.assetPurchaseFormGroup.value.vsalesVoucherTotalDisAmountat ?? 0);
    this.assetPurchaseFormGroup.controls?.vatAMT?.setValue(vatamt);

    this.Assetpurchaseorder_entryDataset.forEach((elemt: any) => {
      if (elemt && elemt.Amount) {
        value += elemt.Amount;
      }
    });
    value = parseFloat(value.toFixed(2));
    this.assetPurchaseFormGroup.controls.grossTotal.setValue(value);
    this.Assetpurchaseorder_entryDataset.forEach((elemt: any) => {
      if (elemt && elemt.Amount) {
        netAmount += elemt.Amount;
      }
    });
    value = parseFloat(value.toFixed(2));
    this.assetPurchaseFormGroup.controls.grandTotal.setValue(netAmount);
    var costtotal = 0;

    this.Assetpurchaseorder_entryDataset.forEach((elemt: any) => {
      if (elemt && elemt.Costprice && elemt && elemt.qty) {
        costtotal += elemt.Costprice * elemt.qty;
        costtotal = parseFloat(costtotal.toFixed(2));
      }
    });

    // costprice = parseFloat(costprice.toFixed(2));
    this.totalcostPrice = costtotal;

    this.GetTotal();
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private masterapi: MasterApiService,
    private confirmation: ConfirmationService,
    private accountapi: AccountApiService,
    private messageService: MessageService,
    private router: Router,
    private crystalReportService: CrystalReportService,
    private permission: PermissionsService,
    private utilityService: UtilityService
  ) { }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.user = this.permission.getUser();

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Asset Purchase') {
          this.Permission = {
            Allow: res?.workGroupPermissionsUallow,
            Add: res?.workGroupPermissionsUadd,
            Delete: res?.workGroupPermissionsUdelete,
            Edit: res?.workGroupPermissionsUedit,
            Print: res?.workGroupPermissionsUprint,
            View: res?.workGroupPermissionsUview,
          };
        }
      });
    });
    this.index = 0;
    // this.inputs = new Array();
    //  this.inputs.push(1);
    // this.dummyGroup = new FormGroup({
    //   invoice:new FormControl('',Validators.required)
    // });

    this.cols = [
      { field: 'assetPurchaseVoucherNo', header: 'Voucher No' },
      { field: 'assetPurchaseDate', header: 'Voucher Date' },
      { field: 'assetPurchaseCustomerID', header: 'Invoice Type' },
      { field: 'assetPurchaseLocationID', header: 'Supplier' },
      { field: 'currencyId', header: 'Location' },
      { field: 'assetPurchaseSalesManID', header: 'Net Amount' },
      { field: 'assetPurchaseCurrencyID', header: 'LPO No' },
      { field: 'action', header: 'View' },
    ];

    this.assetsArray = [
      'Flowers',
      'Balloon',
      'Toy',
      'Service',
      'Bag',
      'Wraping',
    ];
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.initializeControls();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };

    this.assetPurchaseFormGroup = this.fb.group({
      assetPurchaseVoucherNo: [null],
      AstPurchaseRef: [null],
      grNo: [null],
      spAccNo: [null],
      lpoNo: [null],
      description: [null],
      locationID: [-1, [DropDownValidator]],
      supInvNo: [null],
      disPer: [null],
      currencyId: [-1, [DropDownValidator]],

      vatRoundSign: [null],
      astVatNo: [null],
      SupplierId: [-1, [DropDownValidator]],
      astPurchaseType: [-1],
      VoucherNo: [null],
      VoucherDate: [new Date()],
      lpoDate: [new Date()],
      grDate: [new Date()],
      PoWisePur: [null],
      grossTotal: [null],
      astPurID: [null],

      roundOff: [null],
      DisAmount: [null],
      grandTotal: [null],
      salesVoucherVatAmt: [null],
      VatPer: [null],
    });

    this.getAllAccount();
    this.getAllLocation();
  }
  get f() {
    return this.assetPurchaseFormGroup.controls;
  }

  saveAssetPurchase() {
    this.assetPurchaseFormGroup.markAllAsTouched();

    const savedData: Array<any> = this.Assetpurchaseorder_entryDataset?.filter(
      (k) => k?.hasOwnProperty('AssetName')
    );

    const assetPurchase: AssetPurchase = this.assetPurchaseFormGroup
      .value as AssetPurchase;
    (assetPurchase.astPurID = this.assetPurchaseFormGroup.getRawValue().astPurID
      ? this.assetPurchaseFormGroup.getRawValue().astPurID
      : 0),
      (assetPurchase.assetPurchaseVoucherNo =
        this.assetPurchaseFormGroup.getRawValue().assetPurchaseVoucherNo);
    assetPurchase.AstPurchaseRef =
      this.assetPurchaseFormGroup.getRawValue().AstPurchaseRef;
    assetPurchase.astPurchaseType =
      this.assetPurchaseFormGroup.getRawValue().astPurchaseType;
    assetPurchase.grNo = this.assetPurchaseFormGroup.getRawValue().grNo;
    assetPurchase.grDate = this.assetPurchaseFormGroup.getRawValue().grDate;
    assetPurchase.spAccNo = this.assetPurchaseFormGroup.getRawValue().spAccNo;
    assetPurchase.lpoNo = this.assetPurchaseFormGroup.getRawValue().lpoNo;
    assetPurchase.lpoDate = this.assetPurchaseFormGroup.getRawValue().lpoDate;
    assetPurchase.description =
      this.assetPurchaseFormGroup.getRawValue().description;
    assetPurchase.SupplierId =
      this.assetPurchaseFormGroup.getRawValue().SupplierId;

    assetPurchase.disYN = 'Y';

    assetPurchase.status = 'Pending'; //this.assetPurchaseFormGroup.getRawValue().status;

    assetPurchase.locationID = Number(
      this.assetPurchaseFormGroup.get('locationID')?.value
    );
    assetPurchase.supInvNo = this.assetPurchaseFormGroup.getRawValue().supInvNo;
    assetPurchase.disPer = Number(
      this.assetPurchaseFormGroup.getRawValue().disPer
    );
    assetPurchase.currencyId = Number(
      this.assetPurchaseFormGroup.getRawValue().currencyId
    );
    assetPurchase.vatAMT = this.assetPurchaseFormGroup.getRawValue().salesVoucherVatAmt;
    assetPurchase.vatRoundSign =
      this.assetPurchaseFormGroup.getRawValue().vatRoundSign;
    assetPurchase.astVatNo = this.assetPurchaseFormGroup.getRawValue().astVatNo;
    // assetPurchase.actualAmount = this.assetPurchaseFormGroup.getRawValue().grossTotal;

    assetPurchase.actualAmount = Number(
      this.assetPurchaseFormGroup.getRawValue().grossTotal
    );
    assetPurchase.astPurDt = (
      this.assetPurchaseFormGroup.getRawValue().VoucherDate
    );

    assetPurchase.disPer = Number(
      this.assetPurchaseFormGroup.getRawValue().disPer
    );

    assetPurchase.disAmount = Number(
      this.assetPurchaseFormGroup.getRawValue().DisAmount
    );

    assetPurchase.netAmount = Number(
      this.assetPurchaseFormGroup.getRawValue().grandTotal
    );

    assetPurchase.AccountsTransactions = [];
    assetPurchase.AssetPurchaseVoucherDetails = savedData
      ?.filter((k) => k?.AssetName != null && k?.Amount != null)
      .map((k: any) => {
        let accounNo = this.accountList?.find(
          (res) => res?.label == k?.Code
        )?.value;
        return {
          assetPurchaseVoucherDetailsAccNo: accounNo,
          assetPurchaseDetailsVoucherNo:
            this.assetPurchaseFormGroup.getRawValue().assetPurchaseVoucherNo
              ? this.assetPurchaseFormGroup.getRawValue().assetPurchaseVoucherNo
              : '',
          rate: k.Rate,
          quantity: k.Qty,
          amount: k.Amount,
          remarks: k.Remarks,
          astPurRefNo: k.PurrReffNo,
          lifrInYrs: k.LifeInYrs,
          purrDate: k.PurrDate,
          depAmt: k.DepAmt,
          depPerc: k.DepPerc,
          fsno: 1,
          locationID: Number(
            this.assetPurchaseFormGroup.get('locationID')?.value
          ),
          assetSize: k.AssetName,
          astPurchaseID: this.assetPurchaseFormGroup.getRawValue().astPurID
            ? this.assetPurchaseFormGroup.getRawValue().astPurID
            : 0,
        };
      });

    if (this.btnFlag.save) {
      this.saveAsset(assetPurchase);
    } else {
      this.updateAsset(assetPurchase);
    }
  }
  saveAsset(assetPurchase: AssetPurchase) {
    if (this.assetPurchaseFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.accountapi.addAssetPurchase(assetPurchase).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              this.savedAssetPurchase = data.result;
              this.updateFormGrid(data.result);
              this.userTrackingLog('Insert');
              if (data.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: data.message,
                });
              } else if (data.error) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail:
                    data.message != null && data.message.trim() !== ''
                      ? data.message
                      : data.exception,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Customer Quotation Save Failed',
              });
            }
          );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.assetPurchaseFormGroup.markAllAsTouched();
      this.assetPurchaseFormGroup.markAsDirty();
    }
  }
  updateAsset(assetPurchase) {
    if (this.assetPurchaseFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.accountapi.UpdateAssetPurchase(assetPurchase).subscribe(
            (data: any) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              this.updateFormGrid(data.result);
              this.userTrackingLog('Update');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Customer Quotation Updated Succesfully',
              });
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Customer Quotation Update Failed',
              });
            }
          );
        },
      });
    } else {
      // const msg1 = 'Please fill mandatory fields';
      // const msg2 = 'Please fill Empyt Debit account details';
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.assetPurchaseFormGroup.markAllAsTouched();
      this.assetPurchaseFormGroup.markAsDirty();
    }
  }

  new() {
    this.assetPurchaseFormGroup.reset();
    this.GetDefaultSettings();

    this.Assetpurchaseorder_entryDataset = [];
    this.assetPurchaseFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.assetPurchaseFormGroup,
      'locationID',
      this.locationLocked
    );
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.assetPurchaseFormGroup,
        'locationID'
      );
    }
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.assetPurchaseentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.assetPurchaseentry);
    // this.assetPurchaseFormGroup.get('locationID').setValue(this.defaltLocation);
    // this.assetPurchaseFormGroup.get('currencyId').setValue(this.defaltCurrency);
    this.assetPurchaseFormGroup.get('VoucherDate').setValue(new Date());
    this.assetPurchaseFormGroup.get('lpoDate').setValue(new Date());
    this.assetPurchaseFormGroup.get('grDate').setValue(new Date());
    this.assetPurchaseFormGroup
      .get('astPurchaseType')
      ?.setValue(this.v_typeList[1].value);
    this.assetPurchaseFormGroup.controls.purchaseOrderVatRoundSign.setValue(
      '-'
    );
    // this.getAllLocation();
    // this.getAllCurrency();
  }
  GetDefaultSettings() {
    this.masterapi.GetProgramSettingsDropdown().subscribe((m) => {
      let list = m.resultSet.generalSettings;
      // currency

      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY'
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
          this.f.currencyId.setValue(Number(this.DefCurrency));
        }
      }
      //location
      var DEFAULT_LOCATION = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      );

      if (DEFAULT_LOCATION != null) {
        this.DefLocCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
        if (this.DefLocCheck !== null) {
          const splitText = this.DefLocCheck.split('::');
          this.DefLocid = splitText[1]?.trim();
          if (!this.locationLocked) {
            this.f.locationID.setValue(Number(this.DefLocid));
          }
        }
      }
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;
      if (jobcal == true) {
        this.JOBCOST = true;
      }
      var VAT_Calculation = list?.filter(
        (a) => a.generalSettingsKeyValue == 'VAT_Calculation'
      );
      var vatcal = VAT_Calculation[0]?.generalSettingsBoolValue;
      if (vatcal == true) {
        this.VatCalculation = vatcal == true ? true : false;
      }

      const match = m.resultSet.optionSettings.optionsMasterType.match(/(\d+)/);
      if (match) {
        var value = parseInt(match[0], 10);
        this.assetPurchaseFormGroup.controls.VatPer.setValue(
          this.VatCalculation ? value : 0
        );
      }
    });
  }

  getAllCurrency() {
    this.masterapi.GetAllCurrency().subscribe((k) => {
      this.currencyList = k.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select--', value: -1 });
      this.currArry = k.map((ar) => ar.currencyMasterCurrencyName.trim());
      if (this.currencyList.length > 0) {
        this.defaltCurrency = this.currencyList[2].value;
      }
    });
  }

  getAllLocation() {
    this.utilityService.LoadDropdownLocationMaster().subscribe((m: any) => {
      const list = m?.resultSet?.locationMaster ?? [];
      this.locationArray = list;
      this.locationList = list
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select--', value: -1 });
      this.locationLocked = this.utilityService.applyLocationLock(
        this.assetPurchaseFormGroup,
        'locationID'
      );
      this.locationArry = list.map((ar) =>
        ar.locationMasterLocationName?.trim()
      );
      if (this.locationList.length > 0) {
        this.defaltLocation = this.locationList[2].value;
      }
    });
  }
  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllSupplierMaster() {
    this.masterapi.GetAllSupplier().subscribe((k) => {
      this.SupplierMasterArray = k;
      this.SupplierMasterList = k.map((kl) => ({
        label: kl.suppliersMasterSupplierName,
        value: kl.suppliersMasterSupplierId,
      }));
      this.SupplierMasterList.unshift({
        label: '--Select Supplier--',
        value: -1,
      });
      this.SupplierMasterArry = k?.map(
        (ar) =>
          ar.suppliersMasterSupplierName?.trim() +
          '|' +
          ar.suppliersMasterSupplierId
      );
    });
  }
  getsuppliername(id) {
    return this.SupplierMasterList?.find((res) => res.value == id)?.label;
  }
  showMaximizableDialog() {
    this.GetAllAssetPurchase();
    this.displayMaximizable = true;
  }
  GetAllAssetPurchase() {
    this.accountapi.GetAllAssetPurchase().subscribe((data: any) => {
      this.assetPurchasearry = data.result;
    });
  }
  public getCurrency(id): string {
    return this.currencyList?.find((k) => k.value === id).label;
  }
  public getLocation(id): string {
    return this.locationList?.find((k) => k.value === id)?.label;
  }
  GetSavedCustomerQuotationDetails(id) {
    this.index = 0;
    this.accountapi.GetSavedAssetPurchaseDetails(id).subscribe(
      (data) => {
        this.savedAssetPurchase = data.result;
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.updateFormGrid(data.result);
          this.assetPurchaseFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Asset Purchase not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.assetPurchaseFormGroup.updateValueAndValidity();
      }
    );
  }
  updateFormGrid(assetPrchse) {
    console.log('Received asset purchase value:', assetPrchse);

    // Update form group with values from asset purchase object
    this.assetPurchaseFormGroup.patchValue({
      astPurID: assetPrchse?.astPurID,
      assetPurchaseVoucherNo: assetPrchse?.assetPurchaseVoucherNo,
      AstPurchaseRef: assetPrchse?.astPurchaseRef,
      astPurchaseType: assetPrchse?.astPurchaseType,
      SupplierId: assetPrchse?.supplierId,
      grNo: assetPrchse?.grNo,
      grDate: assetPrchse.grDate ? new Date(assetPrchse.grDate) : null,
      VoucherDate: assetPrchse.astPurDt ? new Date(assetPrchse.astPurDt) : null,
      lpoNo: assetPrchse?.lpoNo,
      lpoDate: assetPrchse.lpoDate ? new Date(assetPrchse.lpoDate) : null,
      description: assetPrchse?.description,
      disYN: assetPrchse?.disYN,
      status: assetPrchse?.status,
      locationID: assetPrchse?.locationID,
      supInvNo: assetPrchse?.supInvNo,
      currencyId: assetPrchse?.currencyId,

      grossTotal: assetPrchse.actualAmount,

      disPer: assetPrchse.disPer,
      DisAmount: assetPrchse.disAmount,
      grandTotal: assetPrchse.netAmount,
      salesVoucherVatAmt: assetPrchse.vatAMT,
      vatRoundSign: assetPrchse.vatRoundSign,
      astVatNo: assetPrchse.astVatNo,
    });

    const gridData =
      assetPrchse?.assetPurchaseVoucherDetails?.map((detail, index) => {
        let accounNo = this.accountList?.find(
          (res) => res.label == detail.assetSize
        )?.value;
        console.log('accounNo', accounNo);

        return {
          astPurDetID: detail?.astPurDetID,
          astPurchaseID: assetPrchse?.astPurchaseID,
          assetPurchaseDetailsVoucherNo:
            assetPrchse?.assetPurchaseDetailsVoucherNo,
          sno: index + 1,
          astID: detail?.astID || null,
          Rate: detail?.rate,
          Code: accounNo,
          Qty: detail?.quantity,
          Amount: detail?.amount,
          fcAmount: detail?.fcAmount,
          Remarks: detail?.remarks,
          PurrReffNo: detail?.astPurRefNo,
          lifeInYrs: detail?.LifeInYrs,
          PurrDate: detail?.PurrDate,
          depAmt: detail?.DepAmt,
          depPerc: detail?.DepPerc,
          fsno: detail?.fsno,
          locationID: detail?.locationID,
          lpoid: detail?.lpoid,
          grnno: detail?.grnno,
          batchCode: detail?.batchCode,
          accDepAmt: detail?.accDepAmt,
          AssetName: detail?.assetSize,
        };
      }) || [];

    // Assign data to the grid and make it read-only
    this.Assetpurchaseorder_entryDataset = gridData;
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    if (hotInstance) {
      hotInstance.updateSettings({
        data: gridData,
        readOnly: true,
      });
    } else {
      console.warn('Could not find Handsontable instance.');
    }

    // Disable form and update validity
    this.assetPurchaseFormGroup.disable();
    this.assetPurchaseFormGroup.updateValueAndValidity();
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.accountapi.DeleteAssetPurchase(this.savedAssetPurchase).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Asset Purchase Deleted Succesfully',
            });
            this.userTrackingLog('Delete');
            this.new();
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Failed',
            });
          }
        );
      },
    });
  }
  get accountSetLookup() {
    return this.accountList.map((kl) => ({
      account: kl.label,
      accountId: kl.value,
    }));
  }
  getAllAccount(): void {
    this.accountapi.GetAllAcounts().subscribe({
      next: (response) => {
        if (response && response.result) {
          this.accountArray = response.result;

          this.accountList = response.result
            // ?.filter((kl) => kl.maAccType === 'G')
            .map((kl) => ({
              label: kl.maAccName,
              value: kl.maAccNo,
            }));

          this.accountList.unshift({ label: '--Select--', value: -1 });
        }
      },
      error: (error) => {
        console.error('Error fetching accounts', error);
      },
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  selectaccount(evt) {
    let accountDate = this.accountArray?.find(
      (res) => res.maAccNo == evt.accountId
    )?.maAssetDate;

    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.accountId);

    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.activeRow.row, 1, evt.account);
    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.activeRow.row, 2, accountDate);
    let u = {
      paymentVoucherDetailsAcNo: evt.accountId,
    };
    // this.CurrentselectedAccount = u;
    this.showProcurementsLookUp = false;
  }
  exit(evt) {
    this.showProcurementsLookUp = false;
  }
  hide(evt: boolean) {
    this.showProcurementsLookUp = false;
  }

  edit() {
    this.assetPurchaseentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.assetPurchaseVoucherNo.clearValidators();
    this.assetPurchaseFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.assetPurchaseFormGroup,
      'locationID',
      this.locationLocked
    );
    this.assetPurchaseFormGroup.controls.assetPurchaseVoucherNo.disable();
    this.assetPurchaseFormGroup.updateValueAndValidity();
    // this.hotRegisterer.getInstance(this.hotid).updateSettings(this.salesvoucher_entry);
  }

  clear(evt) {
    if (evt.elementRef != null) {
      (evt.elementRef as ElementRef).nativeElement.value = '';
      // this.elementReference.nativeElement.value ="";
      evt.formControl.setValue(null);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(evt.cell.row, evt.cell.column, null);
    }

    this.showProcurementsLookUp = false;
  }
  userTrackingLog(type) {
    let req = {
      page: 'Asset Purchase',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.assetPurchaseFormGroup.get('assetPurchaseVoucherNo').value,
      vpType: 'Asset Purchase',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }
  getPOReport() {
    this.rptFilter = {
      ReportName: 'AssetPurchaseVoucher',
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from vw_assetvoucherpurchase where AstPurID ='${this.assetPurchaseFormGroup.getRawValue().astPurID
        }'`,
      ],
      SP_Queries: [],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, true)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }


}
interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
