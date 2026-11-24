import { CustomerMaster } from './../../../domain/Masters/CustomerMaster';
import { LocationMaster } from './../../../domain/Masters/LocationMaster';
import { SalesManMaster } from './../../../domain/Masters/SalesManMaster';
import { ItemMaster } from './../../../domain/Masters/ItemMaster';
import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem, MessageService, ConfirmationService, TreeNode } from 'primeng/api';
import { HotTableRegisterer } from '@handsontable/angular';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { CustomerEnquiryDetails } from 'src/app/routes/domain/Sales/CustomerEnquiryDetails';
import { CustomerEnquiry } from 'src/app/routes/domain/Sales/CustomerEnquiry';
import { EnquiryAbount } from 'src/app/routes/domain/Sales/EnquiryAbout';
import { EnquiryStatus } from 'src/app/routes/domain/Sales/EnquiryStatus';
import { BusinessTypeMaster } from 'src/app/routes/domain/Masters/BusinessTypeMaster';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ItemModifyComponent } from '../item-modify/item-modify.component';
import { ImportApiService } from 'src/app/routes/service/import-api.service';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-customerenquiry',
  templateUrl: './customerenquiry.component.html',
  styleUrls: ['./customerenquiry.component.scss'],
})
export class CustomerenquiryComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('enqsCtrl', { static: false }) enquirystatusCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  @ViewChild('custCtrl', { static: false }) customerCtrol: ElementRef;
  @ViewChild('saleCtrl', { static: false }) salesmanCtrol: ElementRef;
  @ViewChild('enqaCtrl', { static: false }) enquiryaboutCtrol: ElementRef;
  @ViewChild('locaCtrl', { static: false }) locationCtrol: ElementRef;
  @ViewChild('bustCtrl', { static: false }) businesstypeCtrol: ElementRef;

  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string = null;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;

  lookupGridColumns = [];
  dataList: Array<any> = [];
  showSalesLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;
  conversion_Type: number;

  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];

  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;

  itemArray: ItemMaster[] = [];
  itemArry: string[] = [];
  itemList: SelectItem[];

  ItemMasterArrayByName: any = null;
  funitid: number;

  invoiceList: SelectItem[];

  customerArray: CustomerMaster[] = [];
  customerArry: string[] = [];
  customerList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[];
  locationArry: string[] = [];

  salesManArray: SalesManMaster[] = [];
  salesManList: SelectItem[];
  salesManArry: string[] = [];

  enquiryAboutArray: EnquiryAbount[] = [];
  enquiryAboutList: SelectItem[];
  enquiryAboutArry: string[] = [];

  businessTypeArray: BusinessTypeMaster[] = [];
  businessTypeList: SelectItem[];
  businessTypeArry: string[] = [];

  enquiryStatusArray: EnquiryStatus[] = [];
  enquiryStatusList: SelectItem[];
  enquiryStatusArry: string[] = [];

  unitAry: any;
  unitListt: any;
  units: any = [];

  unitArray: UnitMaster[] = [];
  unitList: SelectItem[];
  unitArry: string[] = [];
  printbtn: MenuItem[];
  customerEnquiryarry: CustomerEnquiry[] = [];

  savedCustomerEnquiry: CustomerEnquiry;

  private hotRegisterer = new HotTableRegisterer();
  hotid = 'customerEnquiryEntry';
  Permission: any;
  ScreenId: number;
  user: any;
  pdfSource: string | URL;
  isServerSearch = false;
  Obj: any;
  UpdateItem: any;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private permission: PermissionsService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private crystalReportService: CrystalReportService,
    private utilityService: UtilityService,
    private salesapi: SalesApiService,
    public dialogService: DialogService,
    private api: ImportApiService, private sanitizer: DomSanitizer,
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.printbtn = [
      {
        label: 'Enquiry',
        command: () => {
          this.getReport('Enquiry');
        },
      },
      {
        label: 'BOQ Summary',
        command: () => {
          this.getReport('BOQSummary');
        },
      },
    ];
  }

  customerEnquiryentry: Handsontable.GridSettings;
  customerEnquiryFormGroup: FormGroup;
  locationLocked = false;
  cols;
  ngAfterViewInit() { }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.user = this.permission.getUser();

      var rights = this.permission.getById(this.ScreenId);
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

    this.cols = [
      { field: 'enquiryMasterEnquiryId', header: 'Enquiry Id' },
      { field: 'enquiryMasterEnquiryNo', header: 'Enquiry No' },
      { field: 'enquiryMasterEnquiryDate', header: 'Enquiry Date' },
      { field: 'enquiryMasterLocation', header: 'Location' },
      { field: 'enquiryMasterSalesManID', header: 'Sales Man' },
      { field: 'enquiryMasterCurrencyID', header: 'Currency' },
      { field: 'enquiryMasterRemarks', header: 'Remarks' },
      { field: ' ', header: 'Action' },
    ];

    this.invoiceList = [
      { label: '  -- Select --', value: null },
      { label: ' CASH', value: 0 },
      { label: ' CREDIT', value: 1 },
    ];
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };
    this.initializeControls();
    this.customerEnquiryFormGroup = this.fb.group({
      enquiryMasterEnquiryId: [null],
      enquiryMasterEnquiryNo: [null],
      enquiryMasterEnquiryDate: [new Date(), [Validators.required]],
      enquiryMasterContactEmail: [null],
      enquiryMasterEnquiryAboutId: [-1],
      enquiryMasterLocationId: [null],
      enquiryMasterBusineesTypeId: [-1],
      enquiryMasterContactName: [-1],
      enquiryMasterContactId: [null, [DropDownValidator]],
      enquiryMasterSalesManId: [-1],
      enquiryMasterCurrencyId: [-1, [DropDownValidator]],
      enquiryMasterRemarks: [null],
      enquiryMasterCustomerReference: [null],
      enquiryMasterEnquiryStatusId: [-1],
      enquiryMasterAmount: [null],
      itemDetailsChecked: [true],
    });
    this.customerEnquiryFormGroup.disable();
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });

    this.LoadLocationDDL();
  }

  public getCurrency(id): string {
    return this.currencyList?.find((k) => k.value === id)?.label;
  }

  getLocation(id: any): string {
    const location = this.locationList?.find((k) => k.value === id);
    return location ? location?.label : '';
  }

  public getSalesMan(id): string {
    return this.salesManList?.find((k) => k.value === id)?.label;
  }

  public getItems(id): string {
    return this.itemList?.find((k) => k.value === id)?.label;
  }

  public getEnquiryAbout(id): string {
    return this.enquiryAboutList?.find((k) => k.value === id)?.label;
  }

  public getEnquiryStatus(id): string {
    return this.enquiryStatusList?.find((k) => k.value === id)?.label;
  }

  public getBusinessTypes(id): string {
    return this.businessTypeList?.find((k) => k.value === id)?.label;
  }

  public getUnitId(id): string {
    return this.unitList?.find((k) => k.value === id)?.label;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  get f() {
    return this.customerEnquiryFormGroup.controls;
  }

  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();
    this.LoadUnitDDL();
    this.LoadSaleManDDL();
    this.LoadCurrencyDDL();
    this.LoadCustomerDDL();
    this.LoadLocationDDL();
    this.utilityService.GetCustomerEnquiryDropdown().subscribe((m: any) => {

      this.enquiryAboutArray = m.resultSet.enquiryAbout;
      this.enquiryAboutList = m.resultSet.enquiryAbout?.map((kl) => ({
        label: kl.enquiryAboutEnquiryAbout,
        value: kl.enquiryAboutEnquiryAboutId,
      }));
      this.enquiryAboutList.unshift({ label: '--Select--', value: -1 });

      this.enquiryStatusArray = m.resultSet.enquiryStatus;
      this.enquiryStatusList = m.resultSet.enquiryStatus?.map((kl) => ({
        label: kl.enquiryStatusEnquiryStatus,
        value: kl.enquiryStatusEnquiryStatusId,
      }));
      this.enquiryStatusList.unshift({ label: '--Select--', value: -1 });

      this.businessTypeArray = m.resultSet.businesstypeMasters;
      this.businessTypeList = m.resultSet.businesstypeMasters.map((kl) => ({
        label: kl.businessTypeMasterBusinessTypeName,
        value: kl.businessTypeMasterBusinessTypeId,
      }));
      this.businessTypeList.unshift({ label: '--Select--', value: -1 });


    });
    this.GetDefaultSettings();

  }

  LoadCustomerDDL() {
    this.utilityService.LoadCustomerDropdown().subscribe((m: any) => {
      this.customerArray = m.resultSet.customerMasters;

      this.customerList = m.resultSet.customerMasters?.map((kl: any) => ({
        label:
          kl.customerMasterCustomerReffAcNo != null
            ? kl.customerMasterCustomerName +
            ' -- ' +
            kl.customerMasterCustomerReffAcNo
            : kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));

      this.customerList.unshift({
        label: '--Select Customer--',
        value: -1,
      });
    });
  }

  LoadCurrencyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((m: any) => {
      this.currArry = m.resultSet.currencyMasters;
      this.currencyList = m.resultSet.currencyMasters?.map((kl: any) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
    });
  }

  LoadLocationDDL() {
    this.utilityService.LoadDropdownLocationMaster().subscribe((m: any) => {
      const list = m?.resultSet?.locationMaster ?? [];
      this.locationArray = list;
      this.locationList = list
        .filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationLocked = this.utilityService.applyLocationLock(
        this.customerEnquiryFormGroup,
        'enquiryMasterLocationId'
      );
    });
  }

  LoadUnitDDL() {
    this.utilityService.LoadDropdownunitMasters().subscribe((m: any) => {
      this.units = m.resultSet.unitMasters;
      this.unitListt = m.resultSet.unitMasters?.map((kl: any) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
    });
  }

  LoadSaleManDDL() {
    this.utilityService.LoadSaleManDropdown().subscribe((m: any) => {
      this.salesManList = m.resultSet.saleManList?.map((kl: any) => ({
        label: kl.salesManMasterSalesManName,
        value: kl.salesManMasterSalesManId,
      }));
      this.salesManList.unshift({
        label: '--Select Sales Man--',
        value: -1,
      });
    });
  }

  initializeControls() {


    this.customerEnquiryentry = this.utilityService.getTableConfig(
      columnDetailList(this),
      [1, 6]
    );

    this.customerEnquiryentry.afterSelection = (
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

      if (column === 0 && !this.hotRegisterer.getInstance(this.hotid).getSettings().readOnly) {
        this.isServerSearch = true;
        this.lookupGridColumns = ['BarCode', 'Item', 'Item ID'];
        this.dataList = this.itemSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.onSearch('');
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3 && !this.hotRegisterer.getInstance(this.hotid).getSettings().readOnly) {
        this.isServerSearch = false;
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.getUnitByItemId(data[0]);
        this.lookupGridColumns = ['Unit', 'Unit ID'];
        this.dataList = this.unitSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      }
      else {
        this.showSalesLookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.sales == x);
      } else {
        this.selectItem = {};
      }
    };

    this.customerEnquiryentry.afterOnCellMouseDown = (event, coords, TD) => {
      const col = coords.col;
      const row = coords.row;
      if (col === 2 && !this.hotRegisterer.getInstance(this.hotid).getSettings().readOnly) {
        var rowData = this.hotRegisterer.getInstance(this.hotid).getDataAtRow(row);
        this.activeRow = { row, column: col };
        this.hotRegisterer.getInstance(this.hotid).deselectCell();
        this.EditItem(rowData[2], rowData[0]);
      }
    };

    this.customerEnquiryentry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showSalesLookUp = false;
      if (change[0][1] === 0) {
        this.showSalesLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.customerEnquiryentry.beforeChangeRender = (change, source) => {
      this.ColumnSum();

    };


    this.customerEnquiryentry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.ColumnSum();
    };

    this.customerEnquiryentry.afterValidate = (isValid, value, row, prop) => {
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
    if (this.customerEnquiryentry.data.length > 0) {
      const sum1 = this.customerEnquiryentry.data?.filter((item) =>
        item.hasOwnProperty('netamount')
      );
    }
  }

  get itemSetLookup() {
    return this.itemArray.map((kl) => ({
      sales: kl.itemMasterItemName,
      salesId: kl.itemMasterItemId,
      barcode: kl?.itemMasterBarcode,
    }));
  }

  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      sales: kl.unitMasterUnitShortName,
      salesId: kl.unitMasterUnitId,
    }));
  }

  savecustomerEnquiry() {

    const savedData: Array<any> = this.customerEnquiryentry.data;
    const customerEnqy: CustomerEnquiry = this.customerEnquiryFormGroup
      .value as CustomerEnquiry;
    customerEnqy.enquiryMasterEnquiryId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryId;

    customerEnqy.enquiryMasterEnquiryNo =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryNo;


    customerEnqy.enquiryMasterEnquiryDate =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryDate;
    customerEnqy.enquiryMasterContactEmail =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterContactEmail;
    customerEnqy.enquiryMasterEnquiryAboutId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryAboutId;
    customerEnqy.enquiryMasterLocationId =
      this.customerEnquiryFormGroup.get('enquiryMasterLocationId')?.value;
    customerEnqy.enquiryMasterBusineesTypeId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterBusineesTypeId;
    customerEnqy.enquiryMasterContactName =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterContactName;
    customerEnqy.enquiryMasterContactId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterContactId;
    customerEnqy.enquiryMasterSalesManId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterSalesManId;
    customerEnqy.enquiryMasterCurrencyId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterCurrencyId;
    customerEnqy.enquiryMasterRemarks =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterRemarks;
    customerEnqy.enquiryMasterCustomerReference =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterCustomerReference;
    customerEnqy.enquiryMasterEnquiryStatusId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryStatusId;
    customerEnqy.enquiryMasterEnquiryVoucherNo = null;
    customerEnqy.enquiryMasterTypeId = null;
    customerEnqy.enquiryMasterDelStatus = null;
    customerEnqy.enquiryMasterModelId = null;
    customerEnqy.enquiryMasterJobNo = null;
    customerEnqy.enquiryMasterVendorId = null;
    customerEnqy.enquiryMasterVesselId = null;
    customerEnqy.enquiryMasterSerialNo = null;
    customerEnqy.enquiryMasterBuilder = null;
    customerEnqy.customerEnquiryDetails = savedData
      ?.filter((k) => k.itemId != null && k.itemname != null)
      .map((k: any) => {
        return {
          enquiryDetailsEnquiryDetailsId: k.id != null ? k.id : 0,
          enquiryDetailsEnquiryDetailsEquiryId:
            this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryId,
          enquiryDetailsEnquiryDetailsSlno: 0,
          enquiryDetailsEnquiryDetailsItemId: parseInt(k.itemId),
          enquiryDetailsEnquiryDetailsMaterialDescription: k.itemname,
          enquiryDetailsEnquiryDetailsUnitId:
            k.unit != null && k.unit !== ''
              ? this.units?.find(
                (j) => j.unitMasterUnitShortName?.trim() === k.unit?.trim()
              ).unitMasterUnitId
              : null,
          enquiryDetailsEnquiryDetailsQty: k.qty,
          enquiryDetailsEnquiryDetailsDescription: k.description,
          enquiryDetailsEnquiryDetailsDelStatus: false,
          EnquiryDetailsEnquiryDetailsIsEdited: null,
        };
      });

    if (this.btnFlag.save) {
      this.saveEnquiry(customerEnqy);
    } else {
      this.updateEnquiry(customerEnqy);
    }
  }

  saveEnquiry(customerEnqy: CustomerEnquiry) {
    this.customerEnquiryFormGroup.markAllAsTouched();
    if (
      this.customerEnquiryFormGroup.valid &&
      this.customerEnquiryFormGroup.controls['itemDetailsChecked'].value &&
      this.IsValidGrid
    ) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.salesapi.InsertCustomerEnquiry(customerEnqy).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
              this.savedCustomerEnquiry = data.result;
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
                detail: 'Customer Enquiry Save Failed',
              });
            }
          );
        },
      });
    }
    else if (
      this.customerEnquiryFormGroup.valid &&
      !this.customerEnquiryFormGroup.controls['itemDetailsChecked'].value
    ) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          if (customerEnqy.customerEnquiryDetails) {
            customerEnqy.customerEnquiryDetails = null;
          }
          this.salesapi.InsertCustomerEnquiry(customerEnqy).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
              this.savedCustomerEnquiry = data.result;
              this.updateFormGrid(data.result);
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
                detail: 'Customer Enquiry Save Failed',
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
      this.customerEnquiryFormGroup.markAllAsTouched();
      this.customerEnquiryFormGroup.markAsDirty();
    }
  }

  updateEnquiry(customerEnqy: CustomerEnquiry) {
    this.customerEnquiryFormGroup.markAllAsTouched();

    if (!this.customerEnquiryFormGroup.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.customerEnquiryFormGroup.markAsDirty();
      return;
    }

    if (!this.customerEnquiryFormGroup.controls['itemDetailsChecked'].value) {
      customerEnqy.customerEnquiryDetails = null;
    }

    if (this.customerEnquiryFormGroup.controls['itemDetailsChecked'].value && !this.IsValidGrid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Grid validation failed',
      });
      return;
    }

    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to update existing voucher?',
      accept: () => {
        this.salesapi.UpdateCustomerEnquiry(customerEnqy).subscribe(
          (data) => this.handleUpdateResponse(data),
          () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Customer Enquiry Update Failed',
            });
          }
        );
      },
    });
  }

  private handleUpdateResponse(data: any) {
    this.btnFlag = {
      edit: true,
      cancel: false,
      save: false,
      update: true,
      delete: true,
      new: true,
    };
    this.savedCustomerEnquiry = data.result;
    this.updateFormGrid(data.result);
    this.userTrackingLog('Update');

    this.messageService.add({
      severity: data.valid ? 'success' : 'error',
      summary: 'Alert',
      detail: data.message?.trim() || data.exception,
    });
  }

  getAllCustomerEnquiry() {
    this.salesapi.GetCustomerEnquiry().subscribe((data) => {
      this.customerEnquiryarry = data.result;
    });
  }

  new() {
    this.customerEnquiryFormGroup.reset();
    this.customerEnquiryentry.data = [];
    this.customerEnquiryentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.customerEnquiryentry);
    this.customerEnquiryFormGroup.get('enquiryMasterEnquiryId').setValue(0);
    this.customerEnquiryFormGroup
      .get('enquiryMasterEnquiryDate')
      .setValue(null);
    this.customerEnquiryFormGroup
      .get('enquiryMasterContactEmail')
      .setValue(null);
    this.customerEnquiryFormGroup
      .get('enquiryMasterEnquiryAboutId')
      .setValue(-1);
    this.customerEnquiryFormGroup.get('enquiryMasterLocationId').setValue(-1);
    if (this.locationLocked) {
      this.utilityService.applyLocationLock(
        this.customerEnquiryFormGroup,
        'enquiryMasterLocationId'
      );
    }
    this.customerEnquiryFormGroup
      .get('enquiryMasterBusineesTypeId')
      .setValue(-1);
    this.customerEnquiryFormGroup
      .get('enquiryMasterContactName')
      .setValue(null);
    this.customerEnquiryFormGroup.get('enquiryMasterContactId').setValue(-1);
    this.customerEnquiryFormGroup.get('enquiryMasterSalesManId').setValue(-1);
    this.customerEnquiryFormGroup.get('enquiryMasterCurrencyId').setValue(-1);
    this.customerEnquiryFormGroup.get('enquiryMasterRemarks').setValue(null);
    this.customerEnquiryFormGroup
      .get('enquiryMasterCustomerReference')
      .setValue(null);
    this.customerEnquiryFormGroup
      .get('enquiryMasterEnquiryStatusId')
      .setValue(-1);
    this.customerEnquiryFormGroup.get('enquiryMasterAmount').setValue(null);
    this.customerEnquiryFormGroup.get('itemDetailsChecked').setValue(true);

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.search = null;
    this.index = 0;
    this.callDropdowns();

    this.customerEnquiryFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.customerEnquiryFormGroup,
      'enquiryMasterLocationId',
      this.locationLocked
    );
    this.f.enquiryMasterEnquiryDate.setValue(new Date());
    this.customerEnquiryFormGroup.updateValueAndValidity();
  }

  GetDefaultSettings() {
    this.utilityService.GetProgramSettingsDropdown().subscribe((m) => {
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
          this.f.enquiryMasterCurrencyId.setValue(Number(this.DefCurrency));
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
            this.f.enquiryMasterLocationId.setValue(Number(this.DefLocid));
          }
        }
      }

      let data = this.enquiryStatusList?.find(
        (obj) => obj.label === this.enquiryStatusList[5].label
      );
      this.f.enquiryMasterEnquiryStatusId.setValue(data.value);
    });
  }

  showMaximizableDialog() {
    this.callDropdowns();
    this.getAllCustomerEnquiry();
    this.displayMaximizable = true;
  }

  updateFormGrid(CustEnquiry: CustomerEnquiry) {
    this.search = null;
    this.customerEnquiryFormGroup.patchValue({
      enquiryMasterEnquiryId: CustEnquiry.enquiryMasterEnquiryId,
      enquiryMasterEnquiryNo: CustEnquiry.enquiryMasterEnquiryNo,
      enquiryMasterEnquiryDate: new Date(CustEnquiry.enquiryMasterEnquiryDate),
      enquiryMasterContactEmail: CustEnquiry.enquiryMasterContactEmail,
      enquiryMasterEnquiryAboutId: CustEnquiry.enquiryMasterEnquiryAboutId,
      enquiryMasterLocationId: CustEnquiry.enquiryMasterLocationId,
      enquiryMasterBusineesTypeId: CustEnquiry.enquiryMasterBusineesTypeId,
      enquiryMasterContactName: CustEnquiry.enquiryMasterContactName,
      enquiryMasterContactId: CustEnquiry.enquiryMasterContactId,
      enquiryMasterSalesManId: CustEnquiry.enquiryMasterSalesManId,
      enquiryMasterCurrencyId: CustEnquiry.enquiryMasterCurrencyId,
      enquiryMasterRemarks: CustEnquiry.enquiryMasterRemarks,
      enquiryMasterCustomerReference:
        CustEnquiry.enquiryMasterCustomerReference,
      enquiryMasterEnquiryStatusId: CustEnquiry.enquiryMasterEnquiryStatusId,
    });
    const gridData: GridData[] = CustEnquiry.customerEnquiryDetails.map((k) => {

      const unitId: string =
        k.enquiryDetailsEnquiryDetailsUnitId != null
          ? this.unitListt?.find(
            (l) => l.value == k.enquiryDetailsEnquiryDetailsUnitId
          )?.label
          : null;

      return {
        itemId: k.enquiryDetailsEnquiryDetailsItemId, //String(k.enquiryDetailsEnquiryDetailsItemId),
        itemname: k.enquiryDetailsEnquiryDetailsMaterialDescription,
        unit: unitId, //String(k.enquiryDetailsEnquiryDetailsUnitId),
        qty: k.enquiryDetailsEnquiryDetailsQty,
        description: k.enquiryDetailsEnquiryDetailsDescription,
        id: k.enquiryDetailsEnquiryDetailsId,
      };
    });
    this.customerEnquiryentry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.customerEnquiryFormGroup.disable();

    this.customerEnquiryFormGroup.updateValueAndValidity();
  }


  GetSavedCustomerEnquiryDetails(id: string) {
    this.index = 0;
    this.salesapi.GetSavedCustEnquiryDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.updateFormGrid(data.result);
          this.savedCustomerEnquiry = data.result;
          this.customerEnquiryFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Customer Enquiry not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.customerEnquiryFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.salesapi
          .DeleteCustomerEnquiry(this.savedCustomerEnquiry)
          .subscribe(
            (data) => {
              this.userTrackingLog('Delete');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Customer Enquiry) Deleted Succesfully',
              });
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
    this.GetSavedCustomerEnquiryDetails(
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryId
    );
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.enquiryMasterEnquiryId.clearValidators();
    this.customerEnquiryFormGroup.enable();
    this.utilityService.reapplyLocationLock(
      this.customerEnquiryFormGroup,
      'enquiryMasterLocationId',
      this.locationLocked
    );
    this.customerEnquiryFormGroup.controls.enquiryMasterEnquiryId.disable();
    this.customerEnquiryFormGroup.updateValueAndValidity();
  }

  EditItem(name, id) {
    const ref = this.dialogService.open(ItemModifyComponent, {
      header: 'Edit Item',
      width: '50%',
      contentStyle: { height: '50%', overflow: 'auto' },
      data: {
        itemName: name,
        itemId: id,
      },
    });

    ref.onClose.subscribe((res) => {
      if (res && !res.isSave) {
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 2, res.Itemname);
      } else if (res && res.isSave) {
        this.masterapi.GetAllItemMasterById(res.ItemId).subscribe((data) => {
          if (data.result != null) {
            this.Obj = {
              itemMasterAccountNo: data.result.itemMasterAccountNo,
              itemMasterItemId: 0,
              itemMasterMaterialCode: data.result.itemMasterMaterialCode,
              itemMasterItemName: res.Itemname,
              itemMasterStockType: data.result.itemMasterStockType,
              itemMasterItemType: data.result.itemMasterItemType,
              itemMasterSupplierId: data.result.itemMasterSupplierId,
              itemMasterVenderId: data.result.itemMasterVenderId,
              itemMasterSupplierCode: data.result.itemMasterSupplierCode,
              itemMasterPartNo: data.result.itemMasterPartNo,
              itemMasterReOrderLevel: data.result.itemMasterReOrderLevel,
              itemMasterItemSize: data.result.itemMasterItemSize,
              itemMasterColor: data.result.itemMasterColor,
              itemMasterShape: data.result.itemMasterShape,
              itemMasterPacking: data.result.itemMasterPacking,
              itemMasterRef2: data.result.itemMasterRef2,
              itemMasterRef1: data.result.itemMasterRef1,
              itemMasterUserId: data.result.itemMasterUserId,
              itemMasterLandingCost: data.result.itemMasterLandingCost,
              itemMasterVat: data.result.itemMasterVat,
              unitDetails: data.result.unitDetails.map((u) => ({
                unitDetailsBarcode: u.unitDetailsBarcode,
                unitDetailsConversionType: u.unitDetailsConversionType,
                unitDetailsDefUnit: u.unitDetailsDefUnit,
                unitDetailsDefWunit: u.unitDetailsDefWunit,
                unitDetailsDelStatus: u.unitDetailsDelStatus,
                unitDetailsDescrption: u.unitDetailsDescrption,
                unitDetailsHeight: u.unitDetailsHeight,
                unitDetailsId: 0,
                unitDetailsItemId: 0,
                unitDetailsOverhdPer: u.unitDetailsOverhdPer,
                unitDetailsPacking: u.unitDetailsPacking,
                unitDetailsProfitPer: u.unitDetailsProfitPer,
                unitDetailsRate: u.unitDetailsRate,
                unitDetailsReorder: u.unitDetailsReorder,
                unitDetailsUnitCost: u.unitDetailsUnitCost,
                unitDetailsUnitId: u.unitDetailsUnitId,
                unitDetailsUnitPrice: u.unitDetailsUnitPrice,
                unitDetailsWidth: u.unitDetailsWidth,
                unitDetailsWrate: u.unitDetailsWrate,
              })),
            };
          }
          if (this.Obj != null) {
            this.masterapi.NewItem(this.Obj).subscribe((result) => {
              if (result.valid) {
                this.UpdateItem = result.result;
                this.funitid = this.UpdateItem?.unitDetails[0]?.unitDetailsUnitId;
                const Unit: string = this.unitListt?.find(
                  (l) => l.value == this.funitid
                )?.label;

                this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 0, this.UpdateItem?.itemMasterMaterialCode);
                this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 1, this.UpdateItem?.itemMasterPartNo);
                this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 2, this.UpdateItem?.itemMasterItemName);
                this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 3, Unit);

                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: result.message,
                });
              }
            });
          }
        });
      }
    });
  }

  public get IsValidGrid(): boolean {
    if (this.customerEnquiryentry.data.length > 0) {
      // this.paymentvoucherentry.data.forEach((value: GridData, index, arry) => {
      return Object.values(this.customerEnquiryentry.data).some(
        (k: GridData) => k.itemId != null && k.qty != null
      );
      // });
    }
    return false;
  }

  pagedRequest: PagedRequest;
  onSearch(term: string) {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi.LoadFilteredItemMaster(this.pagedRequest).subscribe((m) => {
      this.itemArray = m.resultSet.itemMaster;
      this.itemList = m.resultSet.itemMaster?.map((kl) => ({
        sales: kl?.itemMasterItemName,
        salesId: kl?.itemMasterItemId,
      }));
      this.dataList = this.itemSetLookup;
    });
  }

  selectsales(evt) {
    let trimmedSales = evt.sales?.trim();
    const includesPcs = this.units.some((unit) =>
      unit.unitMasterUnitShortName?.trim().includes(trimmedSales)
    );
    if (includesPcs && this.unitArray.length != 0) {
      const UnitId: string = this.unitArray?.find(
        (l) => l.unitMasterUnitId == evt.salesId
      )?.unitMasterUnitShortName;
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 3, UnitId);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.salesId);
      // this.masterapi.GetItemMasterById(evt.salesId).subscribe((k) => {
      this.masterapi
        .GetItemMasterById({
          id: evt.salesId,
          customerId:
            this.customerEnquiryFormGroup.value.enquiryMasterContactId,
        })
        .subscribe((k) => {
          this.ItemMasterArrayByName = k.resultSet?.itemMaster;
          this.conversion_Type =
            this.ItemMasterArrayByName.unitDetails?.unitDetailsConversionType;

          const hotInstance = this.hotRegisterer.getInstance(this.hotid);
          hotInstance.setDataAtCell(this.activeRow.row, 0, evt.salesId);

          hotInstance.setDataAtCell(
            this.activeRow.row,
            1,
            this.ItemMasterArrayByName.itemMasterPartNo
          );

          // // Setting MaterialName
          hotInstance.setDataAtCell(
            this.activeRow.row,
            2,
            this.ItemMasterArrayByName.itemMasterItemName
          );

          if (this.ItemMasterArrayByName.unitDetails) {
            const unitId =
              this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
            const UnitId: string =
              unitId != null
                ? this.unitListt?.find((l) => l.value == unitId)?.label
                : null;
            hotInstance.setDataAtCell(this.activeRow.row, 3, UnitId);
            // hotInstance.setDataAtCell(
            //   this.activeRow.row,
            //   4,
            //   this.ItemMasterArrayByName.unitDetails?.unitDetailsRate
            // );
          }
        });
    }
    this.showSalesLookUp = false;
  }
  getUnitByItemId(id) {
    this.unitArray = [];
    this.masterapi.GetUnitDetails(id).subscribe((res) => {
      this.unitArray = res.result;
      this.dataList = this.unitSetLookup;
      this.unitArry = res.result.map((ar) =>
        ar.unitMasterUnitShortName?.trim()
      );
      this.showSalesLookUp = true;
    });
  }

  rptFilter: ReportFilterModel;
  getReport(report: string) {
    const query = report == 'Enquiry' ?
      `select * from vw_enquiry  where Enquiry_Master_Enquiry_ID ='${this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryId
      }'` : `select * from vw_Rpt_EnquirySummary where EnquiryId  ='${this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryId}'`;
    this.rptFilter = {
      ReportName: report == 'Enquiry' ? 'Enquiry' : 'rpt_enquirysummary',
      SelectionFormula: '',
      Parameters: [],
      Queries: [query],
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

  exit(evt) {
    this.showSalesLookUp = false;
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
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }

  selectControl(evt) {
    this.control.setValue(evt.salesId);
    this.elementReference.nativeElement.value = evt.sales;
    this.formControlLookUp = false;
  }

  hide(evt: boolean) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }

  userTrackingLog(type) {
    let req = {
      page: 'Customer Enquiry',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.customerEnquiryFormGroup.get('enquiryMasterEnquiryId').value,
      vpType: 'Customer Enquiry',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      console.log('Response:', res);
    });
  }

  attachmentsToUploaded: any[] = [];
  fileAttachmentDialogVisibility: boolean = false;
  onNodeSelect(event: any): void {
    const fileUrl = event.node.data;
    if (fileUrl && event.node.key !== 0 && event.node.key !== '0') {
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        fileUrl + '#navpanes=0&scrollbar=0'
      );
    }
  }
  isChildNode(node: TreeNode): boolean {
    return this.files.some((parent) =>
      parent.children?.some((child) => child === node)
    );
  }

  customUploadHandler(event: any): void {
    const id = this.savedCustomerEnquiry?.enquiryMasterEnquiryId ? this.savedCustomerEnquiry.enquiryMasterEnquiryId
      : this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryId;
    if (!id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing ID',
        detail: 'ID is required.',
      });
      return;
    }

    const formData = new FormData();

    for (const file of event.files) {
      formData.append('files', file); // Matches .NET controller's List<IFormFile> parameter
    }

    this.api.uploadDOCs(formData, id, 'CE').subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Document saved successfully.',
        });
        this.fetchDocumentTree(id);
        this.fileAttachmentDialogVisibility = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: 'An error occurred while uploading.',
        });
      },
    });
  }

  handleChange(e) {
    this.index = e.index;
    if (e.index == 0) {
      requestAnimationFrame(() => {
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);

        if (hotInstance) {
          hotInstance.render();
        }
      });
    } else if (e.index == 1 && this.btnFlag.edit) {
      this.fetchDocumentTree(
        this.savedCustomerEnquiry?.enquiryMasterEnquiryId
      );
    }
  }
  files: TreeNode[] = [];
  selectedFile: TreeNode | null = null;
  previewUrl: SafeResourceUrl | null = null;

  fetchDocumentTree(jobId: any): void {
    this.previewUrl = '';
    this.masterapi.GetDocumentTree(jobId, 'CE').subscribe((res) => {
      if (res?.valid && res?.result) {
        this.files = [];
        const ports = environment.apiRootURL?.replace('api', 'pdfs');
        const documentNodes: TreeNode[] = res?.result?.map(
          (doc: any, index: number) => {
            return {
              key: `0-${doc.fileId}`,
              label: doc.fileName,
              data: `${ports}${doc.filePath}`,
              icon: 'pi pi-file-pdf',
            };
          }
        );

        this.files = [
          {
            key: '0',
            label: 'Documents',
            data: 'Documents Folder',
            icon: 'pi pi-fw pi-folder',
            children: documentNodes,
          },
        ];
      }
    });
  }
  showFileAttachmentDialog() {
    this.fileAttachmentDialogVisibility = true;
  }

  onUpload(event: UploadEvent) {
    for (let file of event.files) {
      this.attachmentsToUploaded.push(file);
    }
    this.messageService.add({
      severity: 'info',
      summary: 'File Uploaded',
      detail: '',
    });
  }
  onDeleteNode(node: TreeNode) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to Delete existing Document?',
      accept: () => {
        const id: number = Number(node.key?.split('-')[1]);
        this.api.DeleteDocument(id).subscribe(
          (data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Deleted Succesfully',
            });
            this.fetchDocumentTree(
              this.savedCustomerEnquiry.enquiryMasterEnquiryId
            );
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: ' Failed',
            });
          }
        );
      },
    });
  }

  downloadAllDocuments() {
    const jobId = this.savedCustomerEnquiry.enquiryMasterEnquiryId ? this.savedCustomerEnquiry.enquiryMasterEnquiryId
      : this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryId;
    this.api
      .downloadAllFilesAsOnePdf(jobId, 'CE', {
        responseType: 'blob',
        observe: 'response' as 'body',
      })
      .subscribe((response: any) => {
        const blob = new Blob([response.body], { type: response.body.type });

        // Extract filename from content-disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${this.customerEnquiryFormGroup.value.enquiryMasterEnquiryNo || 'CustomerEnquiry'}_Documents.pdf`;

        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
            contentDisposition
          );
          if (matches && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

interface GridData {
  itemId?: any;
  partno?: any;
  itemname?: string;
  unit?: string;
  qty?: number;
  description?: string;
  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}
export const columnDetailList = (component: CustomerenquiryComponent) => [
  {
    data: 'itemId',
    type: 'numeric',
    label: 'Item Code',
    toolTip: 'Item Id',
    source: component.itemArry,
  },
  {
    data: 'partno',
    type: 'text',
    label: 'Part No',
    toolTip: 'Part Number',
  },
  {
    data: 'itemname',
    type: 'text',
    label: 'Item Name',
    toolTip: 'Item Name',
  },
  {
    data: 'unit',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit Name',
    source: component.unitArry,
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Quantity',
    toolTip: 'Quantity',
    readOnly: false,
  },
  {
    data: 'description',
    type: 'text',
    label: 'Description',
    toolTip: 'Description',
    readOnly: false,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'Id',
    toolTip: 'Id',
    readOnly: true,
  }
];
