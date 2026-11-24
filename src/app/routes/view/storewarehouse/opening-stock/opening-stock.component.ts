import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ChartofAccounts, ItemMaster } from 'src/app/routes/domain';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { OpeningStock } from 'src/app/routes/domain/Store/OpeningStock';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { StorewarehousesApiService } from 'src/app/routes/service/storewarehouse.api.services';
import { defaults } from 'src/app/shared/service/settings';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { DecimalConfigService } from 'src/app/routes/service/decimal-config.service';
import { LoginService } from 'src/app/routes/service/login.service';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { ApiResponse } from 'src/app/routes/domain/Masters/ApiResponse';

@Component({
  selector: 'app-opening-stock',
  templateUrl: './opening-stock.component.html',
  styleUrls: ['./opening-stock.component.scss'],
})
export class OpeningStockComponent implements OnInit {
  date: Date | undefined;

  elementReference: ElementRef;
  @ViewChild('acctCtrl', { static: false }) accountCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;

  confirmDropDatabaseDialogVisible = false;
  btnFlag: ButtonFlag;
  search: string = null;
    filter: any;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];

  CodeArry: string[] = [];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  DefLocation: string;
  DefLocationCheck: string;

  lookupGridColumns = [];
  dataList: Array<any> = [];
  showstorewarehouseLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[] = [];
  locationArry: string[] = [];

  licensekey: string;

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];

  unitAry: any;
  unitListt: any;
  units: any;
  JOBCOST: boolean = true;
  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  openingStockarry: OpeningStock[] = [];
  savedOpeningStock: OpeningStock;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'openingStockEntry';
  displayPrintPreview: boolean = false;
  showstorewarehouseJobLookUp: boolean = false;
  accountTransactionList: AccountsTransactions[] = [];

  ItemMasterArrayByName: ItemMaster = null;
  funitid: number;
  ScreenId: number;
  Permission: any;
  user: any;
  callDDLs = false;
  isServerSearch = false;
  pagedRequest: PagedRequest;
  width = `40%`;
  decimalpoint: number = 2;
  Math: any;
  accountName: string = '';
  debitAccountName: string = '';
  list3: any[] = [];
  option: any[] = []; 
  state : any;

referenceJvNumber: string | null = null;
financialStartDate: string | null = null;

  usrid: number;

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private masterapi: MasterApiService,
    private permission: PermissionsService,
    private utilityService: UtilityService,
    private accountapi: AccountApiService,

    private decimalConfig: DecimalConfigService,
    private storewarehouseapi: StorewarehousesApiService,
    private crystalReportService: CrystalReportService,
    private loginser: LoginService,
    private accService: AccountstatementService,
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  title: string;
  openingstockentry: Handsontable.GridSettings;
  OpeningStockFormGroup: FormGroup;
  locationLocked = false;
  cols;
  ngOnInit(): void {

    // this.fetchFromBalanceSheet(null);

    this.getAccountSetting();

    this.cols = [
      { field: 'openingStockVoucherNo', header: 'V.no' },

      { field: 'openingStockVoucherLocationId', header: 'Location' },
      { field: 'openingStockVoucherRemarks', header: 'Remark' },
      { field: 'openingStockVoucherDate', header: 'Date' },
      // { field: 'openingStockVoucherDetailsTotal', header: 'Total' },
      { field: 'action', header: 'Action' },
    ];
    this.decimalpoint = this.decimalConfig.getDecimal();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.user = this.permission.getUser();
      var rights = this.permission.getById(this.ScreenId);
      this.stationmasterObj = this.permission.getStation();
      this.user = this.permission.getUser();
      if (rights) {
        var res = rights[0];
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

    this.initializeControls();

    this.OpeningStockFormGroup = this.fb.group({
      openingStockVoucherId: [{ value: null, disabled: true }],
      openingStockVoucherNo: [{ value: null, disabled: true }],
      openingStockVoucherDate: [
        { value: null, disabled: true },
        [Validators.required],
      ],
      openingStockVoucherLocationId: [{ value: [-1], disabled: true }],
      openingStockVoucherRemarks: [''],
      openingStockVoucherDetailsTotal: [{ value: [0], disabled: true }],
    });

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.bykeys();


    this.activatedroute.queryParams.subscribe((params) => {
      let voucherNo = params['OsNo'];
      if (voucherNo) {
        this.GetSavedOpeningStockVoucherDetails(voucherNo);
      }
    });

    var user = this.loginser.GetCredentialData();
    this.usrid = user?.userId;

    this.getAllLocation();
  }

  get f() {
    return this.OpeningStockFormGroup.controls;
  }

  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;
  bykeys() {
    this.utilityService
      .getProgramSettings('Hide_Job_Detail,Hide_CostCenter_Detail')
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );
        const costCenterSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_CostCenter_Detail'
        );

        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;
        this.hideCostCenterDetail =
          costCenterSetting?.programSettingsBoolValue ?? false;
        setTimeout(() => {
          this.updateTableConfiguration();
        }, 1000);
      });
  }
  updateTableConfiguration() {
    const hiddenColumns = [6, 10, 11];
    if (this.hideJobDetail) {
      hiddenColumns.push(8);
    }

    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }




  getDefaultLocation() {
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.OpeningStockFormGroup,
        'openingStockVoucherLocationId'
      );
      return;
    }
    this.masterapi.GetGeneralSettingbyKey('DEFAULT_LOCATION').subscribe(
      (data) => {
        if (!data || !data.result || data.result.length === 0) return;
        const text = data.result[0].generalSettingsTextValue;
        if (!text) return;
        this.DefLocationCheck = text;
        const splitText = text.split('::');
        const locText = splitText[1] ? splitText[1].trim() : null;
        if (locText == null) return;
        const locId = Number(locText);
        if (this.locationLocked) {
          this.utilityService.applyLocationLock(
            this.OpeningStockFormGroup,
            'openingStockVoucherLocationId'
          );
          return;
        }

        // If locations are already loaded, set the control; otherwise load locations first then set
        if (this.locationList && this.locationList.length > 0) {
          this.DefLocation = locText;
          this.OpeningStockFormGroup.get(
            'openingStockVoucherLocationId'
          ).setValue(locId);
        } else {
          this.masterapi.GetAllLocation().subscribe((k) => {
            this.locationArray = k;
            this.locationList = k
              ?.filter((x) => x.locationMasterLocationStatus != false)
              .map((kl) => ({
                label: kl.locationMasterLocationName,
                value: kl.locationMasterLocationId,
              }));
            this.locationArry = k.map((ar) => ar.locationMasterLocationName);
            this.DefLocation = locText;
            if (this.locationLocked) {
              this.utilityService.applyLocationLock(
                this.OpeningStockFormGroup,
                'openingStockVoucherLocationId'
              );
              return;
            }
            this.OpeningStockFormGroup.get(
              'openingStockVoucherLocationId'
            ).setValue(locId);
          });
        }
      },
      () => {
        return;
      }
    );
  }

  initializeControls() {
    const hiddenColumns = [6, 8, 10, 11];
    this.openingstockentry = this.utilityService.getTableConfig(
      columnDetailList(this),
      hiddenColumns
    );

    this.openingstockentry.afterSelection = (
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

      if (column === 0 && this.openingstockentry.readOnly === false) {
        this.isServerSearch = true;
        this.lookupGridColumns = ['Item', 'Item Code'];
        this.onSearch('');
        this.dataList = this.itemSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showstorewarehouseLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3) {
        this.lookupGridColumns = ['Unit', 'Unit ID'];
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.getUnitByItemId(data[0]);
        this.activeRow = { row, column };
        this.showstorewarehouseJobLookUp = true;
      } else if (column === 8) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showstorewarehouseJobLookUp = true;
        this.activeRow = { row, column };
      } else {
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.storewarehouse == x);
      } else {
        this.selectItem = {};
      }
    };

    this.openingstockentry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showstorewarehouseLookUp = false;
      if (change[0][1] === 0) {
        this.showstorewarehouseLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.openingstockentry.beforeChangeRender = (change, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      if (change != null) {
        var data = hotinstance.getDataAtRow(change[0][0]);

        if (data[4] != null && data[5] != null && change[0][1] != 'amount') {
          //&& data[7] != null
          var sum = data[4] * data[5]
          // var sum = data[4] * data[5] * (data[6] ? data[6] : 1);
          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(change[0][0], 7, sum);
        }
      }
      this.ColumnSum();
    };

    this.openingstockentry.afterRemoveRow = (index: number, Code: number) => {
      this.ColumnSum();
    };

    this.openingstockentry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }

  ColumnSum() {
    var amt = 0;
    this.openingstockentry.data.forEach((elemt: any) => {
      if (elemt.amount) {
        amt += elemt.amount;
      }
      this.OpeningStockFormGroup.controls.openingStockVoucherDetailsTotal.setValue(
        amt.toFixed(this.decimalpoint)
      );
    });
  }
  onSearch(term: string) {
    this.dataList = [];
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi.LoadFilteredItemMaster(this.pagedRequest).subscribe((m) => {
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster?.map((kl) => ({
        sales: kl?.itemMasterItemName,
        salesId: kl?.itemMasterItemId,
        barcode: kl?.itemMasterBarcode,
      }));
      this.dataList = this.itemSetLookup;
    });
  }

  callDropdowns() {
    if (!this.callDDLs) {
      this.getAllJobs();
      this.getAllLocation();
      this.getAllAccount();
      this.getAllUnit();
      this.callDDLs = true;
    }
  }

  getAllJobs() {
    this.masterapi.GetJobMaster().subscribe((k) => {
      this.jobArray = k.result;
      console.log(k);
      this.jobList = k.result.map((kl) => ({
        label: kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobArry = k.result.map((ar) => ar.jobMasterJobName?.trim());
      console.log(this.jobArray);
    });
  }

  getAllLocation() {
    this.masterapi.GetAllLocation().subscribe((k) => {
      const list = k ?? [];
      this.locationArray = list;
      this.locationList = list
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationArry = list.map((ar) => ar.locationMasterLocationName);
      this.locationLocked = this.utilityService.applyLocationLock(
        this.OpeningStockFormGroup,
        'openingStockVoucherLocationId'
      );
    });
  }

  getAccountSetting() {
    console.log("hitting");

    this.masterapi.getAccountSetting().subscribe((res: any) => {
      this.accountapi.GetAllAcounts().subscribe((k: any) => {

        this.option = k.result.filter((m: any) => m.maDelStatus != true);

        this.list3 = res.map((m: any) => {
          m.options = this.option.map((l: any) => {
            return {
              keyText: l.maAccName + ` :: ` + l.maAccNo,
              keyValue: l.maAccName + ` :: ` + l.maAccNo,
            };
          });

          m.accountSettingsAccountTextValue = {
            keyText: m.accountSettingsAccountTextValue,
            keyValue: m.accountSettingsAccountTextValue,
          };

          m.options.unshift({
            keyText: '--Select Account--',
            keyValue: -1,
          });

          return m;
        });

        // --- Extraction Logic ---

        // 1. Credit Account (ID 31)
        const targetAccount = this.list3.find(
          (account: any) => account.accountSettingsAccountId == 31
        );

        if (targetAccount) {
          this.accountName = targetAccount.accountSettingsAccountTextValue.keyText;
          console.log("Credit account name: " + this.accountName);
        }

        // 2. Debit Account (ID 6)
        const targetDebitAccount = this.list3.find(
          (account: any) => account.accountSettingsAccountId == 6
        );

        if (targetDebitAccount) {
          this.debitAccountName = targetDebitAccount.accountSettingsAccountTextValue.keyText;
          console.log("Debit account name: " + this.debitAccountName);
        }

      });
    });
  }

  getAllAccount() {
    this.accountapi.GetAllAcounts().subscribe((k) => {
      this.accountArray = k.result;
      this.accountList = k.result
        ?.filter((v) => v.maRelativeNo?.trim())
        .map((kl) => ({ label: kl.maAccName, value: kl.maAccNo }));
      this.accountList.unshift({ label: '--Select--', value: -1 });
      this.acctArry = k.result.map((ar) => ar.maAccName?.trim());
    });
  }

  getAllItemMaster() {
    this.masterapi.GetAllItemNotGroup().subscribe((k) => {
      this.ItemMasterArray = k.result;
      this.ItemMasterList = k.result.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      this.ItemMasterArry = k.result.map(
        (ar) => ar.itemMasterItemName?.trim() + '|' + ar.itemMasterItemId
      );
    });
  }

  getAllUnit() {
    this.masterapi.GetAllUnit().subscribe((k) => {
      this.units = k;
      this.unitListt = k.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = k.map((ar) => ar?.unitMasterUnitShortName?.trim());
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  get accountSetLookup() {
    return this.accountArray.map((kl) => ({
      storeandwarehouses: kl.maAccName,
      storeandwarehousesid: kl.maAccNo,
    }));
  }

  get itemSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      storeandwarehouses: kl.itemMasterItemName,
      storeandwarehousesid: kl.itemMasterItemId,
    }));
  }

  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      unit: kl.unitMasterUnitShortName,
      unitId: kl.unitMasterUnitId,
    }));
  }

  get jobSetLookup() {
    return this.jobArray.map((kl) => ({
      job: kl.jobMasterJobName,
      jobId: kl.jobMasterJobId,
    }));
  }

  public getItemMasterName(itemMasterItemId: number): string {
    return this.ItemMasterArray?.find(
      (j) => j.itemMasterItemId === itemMasterItemId
    )?.itemMasterItemName;
  }

  public getUnitName(unit: number): string {
    return this.unitArray?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }
  public getlocationName(id: number): string {
    return this.locationArray?.find((j) => j.locationMasterLocationId === id)
      .locationMasterLocationName;
  }

  public getJobName(Job: number): string {
    return this.jobArray?.find((j) => j.jobMasterJobId === Job)
      .jobMasterJobName;
  }

  saveOpeningStock() {
    const savedData: any = this.openingstockentry?.data?.filter(
      (k: any) => k.ItemID != null
    );
    const openingStock: OpeningStock = this.OpeningStockFormGroup
      .getRawValue() as OpeningStock;
    // if (this.btnFlag.update) {
    openingStock.openingStockVoucherDetails = savedData
      ?.filter((k: any) => k.ItemID != null)
      .map((k: GridData) => {
        return {
          openingStockVoucherDetailsId: k.id || 0,
          openingStockVoucherDetailsNo:
            this.OpeningStockFormGroup.getRawValue().openingStockVoucherNo,
          openingStockVoucherId:
            this.OpeningStockFormGroup.getRawValue().openingStockVoucherId,
          openingStockVoucherDetailsPartNO: k?.partNo ? k?.partNo : '',
          openingStockVoucherDetailsMatId: k?.ItemID,
          openingStockVoucherDetailsManualQty: k?.qty,
          openingStockVoucherDetailsItemName:
            k.materialName ??
            this.ItemMasterArray?.find(
              (x) => x?.itemMasterItemName?.trim() === k?.materialName?.trim()
            )?.itemMasterItemName,
          openingStockVoucherDetailsUnitId:
            k?.unitId ??
            this.units?.find(
              (x) => x?.unitMasterUnitShortName?.trim() === k?.unit?.trim()
            )?.unitMasterUnitId,
          openingStockVoucherDetailsAmount: k?.amount,
          openingStockVoucherDetailsCost: k?.price,
          openingStockVoucherDetailsConversionType: k?.conversion
            ? k?.conversion
            : null,
          openingStockVoucherDetailsIsEdit: true,
          openingStockVoucherDetailsDelStatus: false,
          openingStockVoucherDetailsJob_Id:
            k?.jobId ??
            this.jobArray?.find(
              (j) => j.jobMasterJobName?.trim() === k.job?.trim()
            )?.jobMasterJobId,
          openingStockVoucherDetailsRemarks: k?.remarks,
        };
      });

    if (this.btnFlag.save) {
      this.saveOpenStock(openingStock);
    } else {
      this.updateOpenStock(openingStock);
    }
  }

  saveOpenStock(openingStock: OpeningStock) {
    this.OpeningStockFormGroup.markAllAsTouched();
    if (this.OpeningStockFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to  Opening Stock?',
        accept: () => {
          this.storewarehouseapi
            .InsertOpeningStockVoucher(openingStock)
            .subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.savedOpeningStock = data.result;
                if (data.valid) {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Alert',
                    detail: 'Opening Stock Saved Successfully',
                  });
                  this.updateFormGrid(data.result);
                  this.userTrackingLog('Insert');

                  this.postOpeningStockJV();

                } else if (data.error) {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Alert',
                    detail:
                      data.message != null && data.message?.trim() !== ''
                        ? data.message
                        : data.exception,
                  });
                }
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Opening Stock Save Failed',
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
      this.OpeningStockFormGroup.markAllAsTouched();
      this.OpeningStockFormGroup.markAsDirty();
    }
  }

  updateOpenStock(openingStock: OpeningStock) {
    this.OpeningStockFormGroup.markAllAsTouched();

    if (this.OpeningStockFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing Opening Stock?',
        accept: () => {
          this.storewarehouseapi
            .UpdateOpeningStockVoucher(openingStock)
            .subscribe(
              (data) => {
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
                  detail: 'Opening Stock Updated Succesfully',
                });
                this.postOpeningStockJV();
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Opening Stock Update Failed',
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
      this.OpeningStockFormGroup.markAllAsTouched();
      this.OpeningStockFormGroup.markAsDirty();
    }
  }

postOpeningStockJV() {
  // 1. Define the state for the Balance Sheet call
  const state = {
    Dir: 'desc',
    Field: 'AccountsTransactions_TransSno',
    Skip: 0,
    Take: 10000,
    Search: this.search,
    Filter: this.filter,
  };

  // 2. Fetch the Balance Sheet data and wait for the response
  this.accService.GetBalanceSheetList(state).subscribe({
    next: (response: any) => {
      if (response && response.result) {
        this.referenceJvNumber = response.result.oldBsMasterRefJv;
        this.financialStartDate = response.result.financialPeriodsStartDate;

        // 3. ONLY NOW (inside the success block) build the JV payload
        const savedData: any = this.openingstockentry?.data?.filter((k: any) => k.ItemID != null) || [];
        const totalAmount = Number(savedData.reduce((sum: number, current: any) => sum + (Number(current.amount) || 0), 0).toFixed(2));

        const debitAccountNo = this.debitAccountName ? this.debitAccountName.split('::')[1]?.trim() : '';
        // const creditAccountNo = this.debitAccountName ? this.debitAccountName.split('::')[1]?.trim() : '';

        const journalVoucher_Save: any = {
          journalVoucherVrefNo: this.referenceJvNumber,
          journalVoucherDate: this.financialStartDate,
          journalVoucherCrAmount: totalAmount,
          journalVoucherDrAmount: totalAmount,
          journalVoucherFcCrAmount: totalAmount,
          journalVoucherFcDrAmount: totalAmount,
          journalVoucherUserId: this.usrid,
          accountsTransactions: []
        };

        const debitTransaction: any = {
          accountsTransactionsAccNo: debitAccountNo,
          accountsTransactionsVoucherNo: this.referenceJvNumber,
          accountsTransactionsTransDate: this.financialStartDate,
          accountsTransactionsTstamp: this.financialStartDate,
          accountsTransactionsParticulars: 'Opening Stock Debit Entry',
          accountsTransactionsDebit: totalAmount,
          accountsTransactionsCredit: 0,
          accountsTransactionsFcDebit: totalAmount,
          accountsTransactionsFcCredit: 0,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsVoucherType: "Opening Stock",
          accountstransactionsDelStatus: false
        };


  //       const creditTransaction: any = {
  //   accountsTransactionsAccNo: creditAccountNo,
  //   accountsTransactionsVoucherNo:  this.referenceJvNumber,  // ADDED
  //   accountsTransactionsTransDate: this.financialStartDate,
  //   accountsTransactionsTstamp: this.financialStartDate, 
  //   accountsTransactionsParticulars: 'Opening Stock Credit Entry',
  //   accountsTransactionsDebit: 0,
  //   accountsTransactionsCredit: totalAmount,
  //   accountsTransactionsFcDebit: 0,
  //   accountsTransactionsFcCredit: totalAmount,
  //   accountsTransactionsUserId: this.usrid,        
  //   accountstransactionsDelStatus: false
  // };

        journalVoucher_Save.accountsTransactions.push(debitTransaction);
        // journalVoucher_Save.accountsTransactions.push(creditTransaction);

        // 4. Send the completely populated payload to the JV API
        if (this.btnFlag.save) {
          this.accountapi.InsertJournalVoucher(journalVoucher_Save).subscribe((data: any) => {
            console.log('Opening Stock JV Created Successfully');
          });
        } else {
          this.accountapi.UpdateJournalVoucherOs(journalVoucher_Save).subscribe((data: any) => {
            console.log('Opening Stock JV Updated Successfully');
          });
        }
      }
    },
    error: (err) => {
      console.error('Error fetching balance sheet list:', err);
    }
  });
}


  // fetchFromBalanceSheet(event : any) { 
  //   this.state = {
  //     Dir: event != null ? (event.sortOrder == -1 ? 'asc' : 'desc') : 'desc',
  //     Field:
  //       event != null
  //         ? event.sortField != null && event.sortField != ''
  //           ? event.sortField
  //           : 'AccountsTransactions_TransSno'
  //         : 'AccountsTransactions_TransSno',
  //     Skip: event != null ? (event.first != null ? event.first : 0) : 0,
  //     Take: event != null ? (event.rows != null ? event.rows : 0) : 10000,
  //     Search: this.search,
  //     Filter: this.filter,
  //   };

  //  this.accService
  //   .GetBalanceSheetList(this.state)
  //   .subscribe({
  //     next: (response: ApiResponse<any>) => {
  //       // Adding a safety check to ensure 'result' exists before grabbing the data
  //       if (response && response.result) {
  //         this.referenceJvNumber = response.result.oldBsMasterRefJv;
  //         this.financialStartDate = response.result.financialPeriodsStartDate;
          
  //         // Optional: Console log to verify it worked
  //         console.log('Ref JV:', this.referenceJvNumber);
  //         console.log('Start Date:', this.financialStartDate);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error fetching balance sheet list:', err);
  //     }
  //   });
  // }

  userTrackingLog(type) {
    let req = {
      page: 'Opening Stock',
      // section: this.salesReportList,
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.OpeningStockFormGroup.get('openingStockVoucherNo').value,
      vpType: 'Opening Stock',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      console.log('Response:', res);
    });
  }

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  getOpeningStockV() {
    this.storewarehouseapi.GetOpeningStockVoucher().subscribe((data) => {
      this.openingStockarry = data.result;
    });
  }

  rptFilter: ReportFilterModel;
  pdfSource: any;
  displayPrint() {
    this.rptFilter = {
      ReportName: 'OpeningStock',
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from vw_openingstockvoucher where OpeningStockVoucherId =${this.savedOpeningStock.openingStockVoucherId}`,
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
  new() {
    this.callDropdowns();
    this.OpeningStockFormGroup.reset();
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.OpeningStockFormGroup,
        'openingStockVoucherLocationId'
      );
    }
    this.openingstockentry.data = [];
    this.openingstockentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.openingstockentry);

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.search = null;
    this.index = 0;
    this.OpeningStockFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.OpeningStockFormGroup,
      'openingStockVoucherLocationId',
      this.locationLocked
    );
    this.OpeningStockFormGroup.controls.openingStockVoucherDate.setValue(
      new Date()
    );
    this.getDefaultLocation();
    this.updateTableConfiguration();
    this.OpeningStockFormGroup.updateValueAndValidity();
  }

  showMaximizableDialog() {
    this.callDropdowns();
    this.getOpeningStockV();
    this.displayMaximizable = true;
  }

  GetSavedOpeningStockVoucherDetails(id: string) {
    this.index = 0;

    this.storewarehouseapi.GetOpeningStockVoucherDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.accountTransactionList = data.result.accountsTransactions;
          this.updateFormGrid(data.result);
          this.savedOpeningStock = data.result;
          this.OpeningStockFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: this.translate.instant('Sales Voucher not found'),
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Failed'),
        });
        this.OpeningStockFormGroup.updateValueAndValidity();
        console.log(this.savedOpeningStock);
      }
    );
  }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  updateFormGrid(openingStockVoucher_update: OpeningStock) {
    this.openingstockentry.data = [];
    this.OpeningStockFormGroup.patchValue({
      openingStockVoucherId: openingStockVoucher_update?.openingStockVoucherId,
      openingStockVoucherNo: openingStockVoucher_update?.openingStockVoucherNo,
      openingStockVoucherDate: new Date(
        openingStockVoucher_update?.openingStockVoucherDate
      ),
      openingStockVoucherRemarks:
        openingStockVoucher_update?.openingStockVoucherRemarks,
      openingStockVoucherLocationId:
        openingStockVoucher_update?.openingStockVoucherLocationId,
    });
    var total = 0;
    const gridData: any =
      openingStockVoucher_update?.openingStockVoucherDetails.map((k) => {
        total += k?.openingStockVoucherDetailsAmount;
        this.OpeningStockFormGroup.controls.openingStockVoucherDetailsTotal.setValue(
          total.toFixed(this.decimalpoint)
        );

        const ItemId: string =
          k?.openingStockVoucherDetailsMatId != null
            ? this.ItemMasterList?.find(
              (l) => l.value == k?.openingStockVoucherDetailsMatId
            )?.label
            : null;
        const UnitId: string =
          k?.openingStockVoucherDetailsUnitId != null
            ? this.unitListt?.find(
              (l) => l.value == k?.openingStockVoucherDetailsUnitId
            )?.label
            : null;
        const job: string =
          k?.openingStockVoucherDetailsJob_Id != null
            ? this.jobList?.find(
              (l) => l.value == k?.openingStockVoucherDetailsJob_Id
            )?.label
            : null;

        return {
          ItemID: k?.openingStockVoucherDetailsMatId,
          partNo: k?.openingStockVoucherDetailsPartNO
            ? k.openingStockVoucherDetailsPartNO
            : '',
          materialName: k?.openingStockVoucherDetailsItemName ?? ItemId,
          unit: UnitId,
          unitId: k?.openingStockVoucherDetailsUnitId,
          qty: k?.openingStockVoucherDetailsManualQty,
          price: k?.openingStockVoucherDetailsCost,
          amount: k?.openingStockVoucherDetailsAmount,
          job: job,
          jobId: k?.openingStockVoucherDetailsJob_Id,
          remarks: k?.openingStockVoucherDetailsRemarks,
          id: k?.openingStockVoucherDetailsId,
        };
      });

    this.openingstockentry.data = gridData;
    this.openingstockentry.readOnly = true;

    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.OpeningStockFormGroup.disable();
    this.f.openingStockVoucherNo.clearValidators();
    this.OpeningStockFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.storewarehouseapi
          .DeleteOpeningStock(this.savedOpeningStock)
          .subscribe(
            (data) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Opening Stock Deleted Succesfully',
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

  cancel() {
    this.new();
    // this.GetSavedOpeningStockDetails(this.OpeningStockFormGroup.getRawValue().openingStockOsId);
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });

    this.OpeningStockFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.OpeningStockFormGroup,
      'openingStockVoucherLocationId',
      this.locationLocked
    );
    this.OpeningStockFormGroup.updateValueAndValidity();
    this.openingstockentry.readOnly = false;
    this.updateTableConfiguration();
  }
  public get IsValidGrid(): boolean {
    if (this.openingstockentry?.data.length > 0) {
      return Object.values(this.openingstockentry.data).some(
        (k: GridData) => k.ItemID != null
      );
    }
    return false;
  }

  selectstorewarehouse(evt) {
    debugger
    if (evt.unit) {
      var UnitId: any = this.unitArray?.find(
        (l) => l.unitMasterUnitId == evt.unitId
      );
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 3, UnitId?.unitMasterUnitShortName);
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 5, UnitId?.unitDetailsRate);

      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(
          this.activeRow.row,
          6,
          UnitId?.unitDetailsConversionType
        );
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 11, evt.unitId);
    }
    if (evt.job) {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 8, evt?.job);
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 10, evt?.jobId);
    }
    this.showstorewarehouseJobLookUp = false;
  }

  selectsales(evt) {
    debugger
    this.masterapi
      .GetAllItemMasterById(evt.storeandwarehousesid)
      .subscribe((k) => {
        this.ItemMasterArrayByName = k.result;

        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.setDataAtCell(
          this.activeRow.row,
          0,
          this.ItemMasterArrayByName?.itemMasterItemId
        );
        hot.setDataAtCell(
          this.activeRow.row,
          1,
          this.ItemMasterArrayByName?.itemMasterPartNo
        );
        hot.setDataAtCell(
          this.activeRow.row,
          2,
          this.ItemMasterArrayByName?.itemMasterItemName
        );
        hot.setDataAtCell(
          this.activeRow.row,
          4,
          this.ItemMasterArrayByName?.itemMasterLastPurchasePrice
        );
        if (
          this.ItemMasterArrayByName.unitDetails &&
          this.ItemMasterArrayByName.unitDetails.length > 0
        ) {
          const unitId =
            this.ItemMasterArrayByName.unitDetails[0].unitDetailsUnitId;
          const UnitId: string =
            unitId != null
              ? this.unitListt?.find((l) => l.value == unitId).label
              : null;
          hot.setDataAtCell(this.activeRow.row, 3, UnitId);
          hot.setDataAtCell(
            this.activeRow.row,
            5,
            this.ItemMasterArrayByName.unitDetails[0]?.unitDetailsRate
          );
          hot.setDataAtCell(
            this.activeRow.row,
            6,
            this.ItemMasterArrayByName.unitDetails[0]?.unitDetailsConversionType
          );
        }
        this.showstorewarehouseLookUp = false;
      });
  }

  getUnitByItemId(id) {
    this.unitArray = [];
    this.masterapi.GetUnitDetails(id).subscribe((res) => {
      this.unitArray = res.result;
      this.dataList = this.unitSetLookup;
      this.unitArry = res.result.map((ar) =>
        ar.unitMasterUnitShortName?.trim()
      );
      this.showstorewarehouseLookUp = true;
    });
  }

  exit(evt) {
    this.showstorewarehouseLookUp = false;
    this.formControlLookUp = false;
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
    this.showstorewarehouseLookUp = false;
    this.formControlLookUp = false;
  }
  selectControl(evt) {
    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(
        this.activeRow.row,
        this.activeRow.column,
        evt.storeandwarehouses
      );
    // this.control.setValue(evt.storeandwarehousesid);
    // this.elementReference.nativeElement.value = evt.storeandwarehouses;
    this.formControlLookUp = false;
    this.showstorewarehouseJobLookUp = false;
  }
  hide(evt: boolean) {
    this.showstorewarehouseLookUp = false;
    this.formControlLookUp = false;
  }
  getLocation(id) {
    return this.locationList?.find((res) => res.value == id)?.label;
  }
}

export const vchrnoAsyncValidator = (
  acctService: AccountApiService,
  time: number = 800
) => {
  return (input: FormControl) => {
    if (input.value != null && input.value?.trim() !== '') {
      return timer(time).pipe(
        switchMap(() => acctService.CheckVnoExist(input.value)),
        map((res) => {
          return res.result === false ? null : { Exist: true };
        })
      );
    }
  };
};

interface GridData {
  jobId?: number;
  unitId?;
  number;
  ItemID?: string;
  partNo?: number;
  materialName?: string;
  unit?: string;
  qty?: number;
  price?: number;
  conversion?: number;
  amount?: number;
  job?: string;
  remarks?: string;
  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export interface PagedRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  sortDirection: string;
}
export const columnDetailList = (component: OpeningStockComponent) => [
  {
    data: 'ItemID',
    type: 'autocomplete',
    label: 'Code',
    toolTip: 'Item Code',
    source: component.ItemMasterArry,
    width: 80,
  },
  {
    data: 'partNo',
    type: 'text',
    label: 'Part No',
    toolTip: 'Part Number',
    width: 80,
  },
  {
    data: 'materialName',
    type: 'text',
    label: 'Material Name',
    toolTip: 'Material Name',
  },
  {
    data: 'unit',
    type: 'autocomplete',
    label: 'Unit',
    toolTip: 'Unit Name',
    source: component.unitArry,
    width: 80,
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Curs Stock',
    toolTip: 'Current Stock',
    numericFormat: {
      pattern: '0,0.00',
    },
    readOnly: false,
    width: 80,
  },
  {
    data: 'price',
    type: 'numeric',
    label: 'Avg. Stock Rate ',
    toolTip: 'Average Stock',
    numericFormat: {
      pattern: '0,0.00',
    },
    readOnly: false,
    width: 80,
  },
  {
    data: 'conversion',
    type: 'numeric',
    label: 'Conversion',
    toolTip: 'Conversion Factor',
    width: 80,
  },
  {
    data: 'amount',
    type: 'numeric',
    label: 'Amount',
    numericFormat: {
      pattern: '0,0.00',
    },
    toolTip: 'Amount',
    width: 100,
  },
  {
    data: 'job',
    type: 'autocomplete',
    label: 'Job',
    toolTip: 'Job Name',
    source: component.jobArry,
  },
  {
    data: 'remarks',
    type: 'text',
    label: 'Remarks',
    toolTip: 'Remarks',
  },
  {
    data: 'jodId',
    type: 'numeric',
    label: 'jodId',
    toolTip: 'jodId',
    width: 100,
  },
  {
    data: 'unitId',
    type: 'numeric',
    label: 'unitId',
    toolTip: 'unitId',
    width: 100,
  },
];
