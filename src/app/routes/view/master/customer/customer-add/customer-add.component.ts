import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { ChartofAccounts } from 'src/app/routes/domain/Masters/ChartofAccounts';
// import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
// import { OpeningVoucherMaster } from 'src/app/routes/domain/Accounts/OpeningVoucherMaster';
// import { OpeningVoucherDetails } from 'src/app/routes/domain/Accounts/OpeningVoucherDetails';
import {
  CityMaster,
  CountryMaster,
  DepartmentMaster,
} from 'src/app/routes/domain';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { PriceLevelMaster } from 'src/app/routes/domain/Masters/PriceLevelMaster';
import { CustomerTypeMaster } from 'src/app/routes/domain/Masters/CustomerTypeMaster';
import { NewCustomerContact } from 'src/app/routes/domain/Masters/NewCustomerContact';
import { NewCustomerDepartment } from 'src/app/routes/domain/Masters/NewCustomerDepartment';
import { NewCustomerMaster } from 'src/app/routes/domain/Masters/NewCustomerMaster';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import Swal from 'sweetalert2';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { log } from 'console';

@Component({
  selector: 'app-customer-add',
  templateUrl: './customer-add.component.html',
  styleUrls: ['./customer-add.component.scss'],
})
export class CustomerAddComponent implements OnInit {
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string = '';
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;

  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];

  countryArray: CountryMaster[] = [];
  countryList: SelectItem[];
  countryArry: string[] = [];

  custGroupArray: CustomerTypeMaster[] = [];
  custGroupList: SelectItem[];
  custGroupArry: string[] = [];

  cityArray: CityMaster[] = [];
  citylistNew: SelectItem[] = [];
  cityList: CityMaster[];
  cityarry: string[] = [];

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[];
  customerTypeList: SelectItem[];
  customerTypearry: string[] = [];
  locationarry: string[] = [];

  pricelevelArray: PriceLevelMaster[] = [];
  pricelevelList: SelectItem[];
  pricelevelArry: string[] = [];

  CustTypeList: SelectItem[];
  isButtonDisabled: boolean = false;
  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];
  departmentList: any;

  customerContactList: NewCustomerContact[] = [];
  customerDepartmentList: NewCustomerDepartment[] = [];
  isCustomerCreated = false;
  value2: string;
  customerMasterArry: NewCustomerMaster[] = [];
  // savedPaymentVoucherGridData: GridData[] = [];

  // CustomerMasterArray: CustomerMaster[] = [];
  // CustomerMasterArry: string[] = [];
  // CustomerMasterList: SelectItem[];

  savedNewCustomer: NewCustomerMaster;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'customercontactentry';
  customercontactentry: Handsontable.GridSettings;
  customercontactentry_dataset = [];

  private DephotRegisterer = new HotTableRegisterer();
  hotdepid = 'customerdepartmententry';
  customerdepartmententry: Handsontable.GridSettings;
  customerdepartmententry_dataset = [];
  state: {
    Dir: string;
    Field: any;
    Skip: any;
    Take: any;
    Search: string;
    Filter: any;
  };
  filter: string = '';
  timer: any;
  ModelFormGroup: FormGroup;
  DefCurrency: string;
  DefCurCheck: string;
  DefLocationCheck: string;
  DefLocation: string;
  defType: string;
  detTypeCheck: string;
  ScreenId: number;
  Permission: any;
  user: any;
  DefAccCheck: any;
  DefAccount: any;
  showCustomerGroup: boolean = false;
  departArry: any;
  departArray: DepartmentMaster[];
  getDebtorMasterAccount: any;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private masterapi: MasterApiService,
    private confirmationService: ConfirmationService,
    private utilityService: UtilityService,
    private permission: PermissionsService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  // openingBalanceVouchrEntry: Handsontable.GridSettings ;

  customeraddFormGroup: FormGroup;
  // accountTransactionDataset = [];
  yellowRenderer;
  cols;
  ngOnInit(): void {
    console.log("this is customer master");
    
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.user = this.permission.getUser();
      // console.log("rights", rights)
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Customer') {
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
    this.cols = [
      { field: 'customerMasterCustomerNo', header: 'Customer No' },
      { field: 'customerMasterCustomerName', header: 'Customer Name' },
      {
        field: 'customerMasterCustomerContactPerson',
        header: 'Contact Person',
      },
      { field: 'openingVoucherMasterCurrencyId', header: 'Currency' },
      { field: 'customerMasterCustomerCountryId', header: 'Country' },
      { field: 'customerMasterCustomerLocation', header: 'Location' },
      { field: 'customerMasterCustomerAddress', header: 'Address' },
      { field: 'customerMasterCustomerVatNo', header: 'Vat No.' },
      { field: 'Action', header: 'Action' },
    ];

    // this.CustTypeList = [
    //   { label: '  -- Select --', value: null },
    //   { label: ' Whole Sale', value: 1 },
    //   { label: ' Retail', value: 2 }];

    this.isButtonDisabled = true;

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.initializeControls();
    this.customeraddFormGroup = this.fb.group({
      customerMasterCustomerNo: [null],
      customerMasterCustomerStatusValue: [null],
      customerMasterCustomerCustType: [-1],
      customerMasterCustomerReffAcNo: [null],
      customerMasterCustomerName: [
        { value: null, disabled: false },
        [Validators.required,
          Validators.maxLength(250)
        ],
      ],
      customerMasterCustomerCtTypeId: [-1],
      customerMasterCustomerContactPerson: [{ value: null, disabled: false },
  [Validators.maxLength(100)],],
      customerMasterCustomerCountryId: [-1],
      customerMasterCustomerCityId: [-1],
      customerMasterCustomerLocation: [-1],
      customerMasterCustomerPoBox: [null],
      customerMasterCustomerEmail: [{ value: null, disabled: false },
  [Validators.email]],
      customerMasterCustomerTel1: [null],
      customerMasterCustomerTel2: [null],
      customerMasterCustomerWhatsAppNo: [null],
      customerMasterCustomerMobile: [null],
      customerMasterCustomerFax: [null],
      customerMasterCustomerAddress: [{ value: null, disabled: false },
  [Validators.maxLength(500)]],
      customerMasterCustomerJoinDate: [null],
      customerMasterCustomerBlackList: [false],
      customerMasterCustomerWebSite: [null],
      // customerMasterCustomerGroupAccNo: [-1],
      customerMasterCustomerGroupAccNo: [-1],
      customerMasterCustomerCurrencyId: [-1],
      customerMasterCustomerPriceLevelId: [-1],
      customerMasterCustomerRemarks: [null],
      customerMasterCustomerCreditLimit: [null],
      customerMasterCustomerCreditDays: [null],
      isCreateAccount: [false],
      customerMasterCustomerVatNo: [null],
      customerMasterCustomerArabicName: [null],
    });
    this.customeraddFormGroup.disable();
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      ?.map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.ModelFormGroup = this.fb.group({
      customerTypeId: new FormControl(0),
      customerTypeName: new FormControl(null, Validators.required),
      CustomerTypeUserId: new FormControl(this.user.userId),
    });
    this.Hide_Customer_Department();
    this.Hide_Price_Level_Customer();
  }

  HIDEDEPARTMENT: boolean = false;
  Hide_Customer_Department() {
    this.masterapi
      .GetGeneralSettingbyKey('Hide_Customer_Department')
      .subscribe((res) => {
        const value = res.result[0].generalSettingsBoolValue;

        this.HIDEDEPARTMENT = value;
      });
  }

  HIDEPrice_Level: boolean = true;
  Hide_Price_Level_Customer() {
    this.masterapi
      .GetGeneralSettingbyKey('Hide_Price_Level_Customer ')
      .subscribe((res) => {
        const value = res.result[0].generalSettingsBoolValue;

        this.HIDEPrice_Level = value;
      });
  }
  public getCurrency(id): string {
    return this.currencyList?.find((k) => k.value === id)?.label;
  }
  public getCustType(id): string {
    return this.custGroupList?.find((k) => k.value === id)?.label;
  }

  public getLocationName(id): string {
    return this.locationList?.find((k) => k.value == id)?.label;
  }

  public getCountry(id): string {
    return this.countryList?.find((k) => k.value === id)?.label;
  }

  get f() {
    return this.customeraddFormGroup.controls;
  }
  get f2() {
    return this.ModelFormGroup.controls;
  }

  initializeControls() {
    this.masterapi.GetCustomerDropdown().subscribe((m) => {
      //account
      this.accountArray = m.resultSet.masterAccountsTables;
      this.accountList = m.resultSet.masterAccountsTables.map((kl) => ({
        label: kl.maAccName?.trim() + '|' + kl.maAccNo,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select--', value: -1 });
      this.acctArry = m.resultSet.masterAccountsTables.map(
        (ar) => ar.maAccName?.trim() + '|' + ar.maAccNo
      );
      //customer type
      this.custGroupList = m.resultSet.customerType?.map((kl) => ({
        label: kl.customerTypeName,
        value: kl.customerTypeId,
      }));
      this.custGroupList.unshift({ label: '--Select--', value: -1 });
      this.custGroupArry = m.resultSet.customerType?.map((ar) =>
        ar.customerTypeName.trim()
      );
      //currency
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select--', value: -1 });
      this.currArry = m.resultSet.currencyMasters?.map((ar) =>
        ar.currencyMasterCurrencyName.trim()
      );

      //location
      this.locationList = m.resultSet.locationMaster?.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationList.unshift({ label: '--Select--', value: -1 });
      this.locationarry = m.resultSet.locationMaster?.map((ar) =>
        ar.locationMasterLocationName.trim()
      );

      //country
      this.countryList = m.resultSet.countryMasters?.map((kl) => ({
        label: kl.countryMasterCountryName,
        value: kl.countryMasterCountryId,
      }));
      this.countryList.unshift({ label: '--Select--', value: -1 });
      this.countryArry = m.resultSet.countryMasters?.map((ar) =>
        ar.countryMasterCountryName.trim()
      );

      //customerType
      this.CustTypeList = m.resultSet.customerType?.map((kl) => ({
        label: kl.customerTypeName,
        value: kl.customerTypeId,
      }));
      this.CustTypeList.unshift({ label: '--Select--', value: -1 });
      this.customerTypearry = m.resultSet.CustomerTypeMaster?.map((ar) =>
        ar.customerTypeName.trim()
      );

      //city

      this.cityList = m.resultSet.cityMasters;
      this.citylistNew = m.resultSet.cityMasters?.map((item) => ({
        label: item.cityMasterCityName,
        value: item.cityMasterCityId,
      }));
      this.citylistNew.unshift({ label: '--Select--', value: -1 });
      //price level
      this.pricelevelList = m.resultSet.priceLevelMasters?.map((kl) => ({
        label: kl.priceLevelMasterPriceLevelName,
        value: kl.priceLevelMasterPriceLevelId,
      }));
      this.pricelevelList.unshift({ label: '--Select--', value: -1 });
      this.pricelevelArry = m.resultSet.priceLevelMasters?.map((ar) =>
        ar.priceLevelMasterPriceLevelName.trim()
      );
    });

    this.yellowRenderer = (
      instance,
      td,
      row,
      col,
      prop,
      value,
      cellProperties
    ) => {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      td.style.backgroundColor = 'yellow';
    };

    this.customercontactentry = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 3,
      width: '100%',
      height: 150,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      hiddenColumns: {
        columns: [4, 8],
        indicators: false,
      },
      columns: [
        {
          data: 'person',
          type: 'text',
        },
        {
          data: 'mobile',
          type: 'text',
        },

        {
          data: 'officeno',
          type: 'text',
        },
        {
          data: 'email',
          type: 'text',
          // renderer: this.yellowRenderer(),
        },
        {
          data: 'department',
          type: 'autocomplete',
          source: (query, callback) => {
            callback(this.departArry);
          },
          allowInvalid: false,
          strict: false,
        },
        {
          data: 'departments',
          type: 'text',
        },
        {
          data: 'Designation',
          type: 'text',
        },
        {
          data: 'active',
          type: 'checkbox',
          width: 80,
        },
        {
          data: 'id',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Person Name'),
        this.translate.instant('Mobile No'),
        this.translate.instant('Office No'),
        this.translate.instant('Email '),
        this.translate.instant('Department'),
        this.translate.instant('Department'),
        this.translate.instant('Designation'),
        this.translate.instant('Active'),
        this.translate.instant('Id'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };

    //--------------------------------------------------------------------------------------------------

    this.customerdepartmententry = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 3,
      width: '100%',
      height: 150,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      hiddenColumns: {
        columns: [1],
        indicators: false,
      },
      // rowHeaders: true,
      columns: [
        {
          data: 'department',
          type: 'autocomplete',
          source: (query, callback) => {
            callback(this.departArry);
          },
          allowInvalid: false,
          strict: false,
        },
        {
          data: 'id',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Department'),
        this.translate.instant('Id'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
    //==================================================================================================
    // this.customercontactentry.beforeChangeRender = (change, source) => {

    //   if (change[0][1] === 'department') {
    //     const hotinstance = this.hotRegisterer.getInstance(this.hotid);
    //     //     if( change != null) {

    //     var data = hotinstance.getDataAtRow(change[0][0]);

    //     if (data[1] != null) {

    //       var Vl = 0;

    //       this.hotRegisterer.getInstance(this.hotid).setDataAtCell(change[0][0], 3, Vl);
    //       this.hotRegisterer.getInstance(this.hotid).setDataAtCell(change[0][0], 4, Vl);
    //     }
    //     if (data[0] != null) {
    //       var Vl = 0;
    //       this.hotRegisterer.getInstance(this.hotid).setDataAtCell(change[0][0], 3, Vl);
    //       this.hotRegisterer.getInstance(this.hotid).setDataAtCell(change[0][0], 4, Vl);
    //     }

    //   }

    // };
    this.customercontactentry.afterRemoveRow = (
      index: number,
      amount: number
    ) => { };

    this.customercontactentry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
    this.getDepartmentList();
  }
  public getDepartmentList() {
    this.masterapi.GetAllDepartment().subscribe((m) => {
      this.departArray = m;
      this.departmentList = m.map((kl) => ({
        label: kl.departmentMasterDepartmentName?.trim(),
        value: kl.departmentMasterDepartmentId,
      }));
      this.departmentList.unshift({ label: '--Select--', value: -1 });
      this.departArry = m.map((ar) =>
        ar.departmentMasterDepartmentName?.trim()
      );
    });
  }
  saveCustomer() {
    const isCreateAccount =
      this.customeraddFormGroup.getRawValue().isCreateAccount;

    if (this.customeraddFormGroup.getRawValue().customerMasterCustomerName) {
    }

    const savedData: any = this.customercontactentry?.data?.filter((k) =>
      k.hasOwnProperty('person')
    );
    const savedDepData: any = this.customerdepartmententry?.data?.filter((m) =>
      m.hasOwnProperty('department')
    );
    // const OBVoucher: OpeningVoucherMaster = this.customeraddFormGroup.value as  OpeningVoucherMaster;
    const Cust: NewCustomerMaster = this.customeraddFormGroup
      .value as NewCustomerMaster;
    // OBVoucher.openingVoucherMasterId = this.openingBalanceVoucherFormGroup.getRawValue().opneingVoucherMasterId;
    Cust.customerMasterCustomerNo = Number(
      this.customeraddFormGroup.controls.customerMasterCustomerNo.value
    );
    Cust.customerMasterCustomerStatusValue =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerStatusValue;
    Cust.customerMasterCustomerCustType = String(
      this.customeraddFormGroup.getRawValue().customerMasterCustomerCustType
    );
    //console.log("CustomerTypeID", Cust.customerMasterCustomerCustType)
    Cust.customerMasterCustomerReffAcNo =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerReffAcNo;
    Cust.customerMasterCustomerName =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerName;
    Cust.customerMasterCustomerCtTypeId = Number(
      this.customeraddFormGroup.getRawValue().customerMasterCustomerCustType
    );
    Cust.customerMasterCustomerContactPerson =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerContactPerson;
    Cust.customerMasterCustomerCountryId =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerCountryId;
    Cust.customerMasterCustomerCityId =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerCityId;
    Cust.customerMasterCustomerLocation = String(
      this.customeraddFormGroup.getRawValue().customerMasterCustomerLocation
    );
    Cust.customerMasterCustomerPoBox =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerPoBox;
    Cust.customerMasterCustomerEmail =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerEmail;
    Cust.customerMasterCustomerTel1 =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerTel1;
    Cust.customerMasterCustomerTel2 =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerTel2;
    Cust.customerMasterCustomerMobile =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerMobile;
    Cust.customerMasterCustomerFax =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerFax;
    Cust.customerMasterCustomerJoinDate =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerJoinDate;
    Cust.customerMasterCustomerBlackList =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerBlackList;
    Cust.customerMasterCustomerWebSite =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerWebSite;
    Cust.customerMasterCustomerGroupAccNo =
      isCreateAccount && !this.isCustomerCreated
        ? this.getDebtorMasterAccount
        : null;
    Cust.customerMasterCustomerAddress =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerAddress;
    Cust.customerMasterCustomerWhatsAppNo =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerWhatsAppNo;
    // Cust.customerMasterCustomerGroupAccNo = Number(this.customeraddFormGroup.getRawValue().customerMasterCustomerGroupAccNo);
    Cust.customerMasterCustomerCurrencyId =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerCurrencyId;
    Cust.customerMasterCustomerPriceLevelId =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerPriceLevelId;
    Cust.customerMasterCustomerRemarks =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerRemarks;
    Cust.customerMasterCustomerCreditLimit =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerCreditLimit;
    Cust.customerMasterCustomerCreditDays =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerCreditDays;
    Cust.isCreateAccount = !this.isCustomerCreated ? isCreateAccount : false; // === undefined ? false :this.customeraddFormGroup.getRawValue().isCreateAccount === null ? false : this.customeraddFormGroup.getRawValue().isCreateAccount  ;
    Cust.customerMasterCustomerVatNo =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerVatNo;
    Cust.customerMasterCustomerArabicName =
      this.customeraddFormGroup.getRawValue().customerMasterCustomerArabicName;
    Cust.customerContacts = savedData
      ?.filter((k) => k.person != null)
      ?.map((k: GridData) => {
        return {
          customerContactsId: k.id != null ? k.id : 0,
          customerContactsName: k.person,
          customerContactsMobile: k.mobile,
          // openingVoucherDetailsVDate:new Date(
          //   +k.voucherdate.toString().split('/')[2],
          //   +k.voucherdate.toString().split('/')[1] - 1,
          //   +k.voucherdate.toString().split('/')[0]),
          customerContactsOffice: k.officeno,
          customerContactsDepartmentId: this.departmentList?.find(
            (res) => res.label?.trim() == k.department?.trim()
          )?.value,
          customerContactsCustomerId:
            this.customeraddFormGroup.getRawValue().customerMasterCustomerNo,
          customerContactsActive: false, // k.action,
          customerContactsEmail: k.email,
          customer_Contacts_Designation: k.Designation,
          Customer_Contacts_Department: k.departments,
          customerContactsDelStatus: false,
        };
      });

    Cust.customerDepartment = savedDepData
      ?.filter((m) => m.department != null)
      ?.map((m: GridDataDep) => {
        let dep = this.departmentList?.find(
          (res) => res.label == m.department
        )?.value;
        return {
          customerDepartmentsId: m.id != null ? m.id : 0,
          customerDepartmentsDepartmentId: dep,
          customerDepartmentsCustomerId:
            this.customeraddFormGroup.getRawValue().customerMasterCustomerNo,
          customerDepartmentsActive: false,
        };
      });

    if (this.btnFlag.save) {
      this.saveCustomers(Cust);
    } else {
      this.updateCustomer(Cust);
    }
  }

 saveCustomers(Cust: NewCustomerMaster) {
  if (this.customeraddFormGroup.valid) {
    this.confirmationService.confirm({
      key: 'confirm-key',
      message: 'Do you want to save?',
      accept: () => {
        this.masterapi.InsertCustomer(Cust).subscribe(
          (data: any) => {
            
            // Intercept the logical error from the backend
            if (data.valid === false || data.error === true) {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: data.message, // This will display the duplicate name message
              });
              return; 
            }

            // Standard success logic
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
            };
            this.utilityService.LoadCustomerDropdown(true).subscribe((res) => { });
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'New Customer Saved Succesfully',
            });
            this.updateFormGrid(data.result);
            this.savedNewCustomer = data.result;
            this.userTrackingLog('Insert');
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'New Customer Save Failed',
            });
          }
        );
      },
    });
  } else {
    this.customeraddFormGroup.markAllAsTouched();
    this.messageService.add({
      severity: 'error',
      summary: 'Alert',
      detail: 'Please fill mandatory fields',
    });
  }
}
  delete() {
    this.confirmationService.confirm({
      key: 'confirm-key',
      icon: 'pi pi-exclamation-triangle',
      message: 'Do you want to Delete Voucher?',
      accept: () => {
        this.masterapi.DeleteNewCustomer(this.savedNewCustomer).subscribe(
          (data) => {
            this.utilityService
              .LoadCustomerDropdown(true)
              .subscribe((res) => { });
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Customer Deleted Succesfully',
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

  updateCustomer(Cust: NewCustomerMaster) {
    // this.customeraddFormGroup.markAllAsTouched();
    if (this.customeraddFormGroup.valid)
      this.confirmationService.confirm({
        message: 'Do you want to update the existing customer?',
        key: 'confirm-key',
        // icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.masterapi.UpdateNewCustomer(Cust).subscribe(
            (data) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Customer Updated Successfully',
              });
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              this.utilityService
                .LoadCustomerDropdown(true)
                .subscribe((res) => { });
              this.updateFormGrid(data.result);
              this.savedNewCustomer = data.result;
              this.userTrackingLog('Update');
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Customer Update Failed',
              });
            }
          );
        },
      });
  }

  SearchData(event: any) {
    let that = this;
    clearTimeout(this.timer);
    var ms = 500; // milliseconds
    var val = event.target.value;
    this.timer = setTimeout(function () {
      that.search = val;
      that.getAllCustomers(null);
    }, ms);
  }

  getAllCustomers(event: any) {
    this.state = {
      Dir: event != null ? (event.sortOrder == -1 ? 'asc' : 'desc') : 'desc',
      Field:
        event != null
          ? event.sortField != null && event.sortField != ''
            ? event.sortField
            : 'AccountsTransactions_TransSno'
          : 'AccountsTransactions_TransSno',
      Skip: event != null ? (event.first != null ? event.first : 0) : 0,
      Take: event != null ? (event.rows != null ? event.rows : 0) : 10000,
      Search: this.search,
      Filter: this.filter,
    };
    this.masterapi.GetCustomers().subscribe((data: any) => {
      this.customerMasterArry = data;
      // this.updateFormGrid(data)
    });
  }
  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo.trim() === acctnumber.trim()
    ).maAccName;
  }

  new() {
    //this.getAllAccount();
    this.customeraddFormGroup.reset();
    this.customeraddFormGroup.controls.isCreateAccount.setValue(true);
    this.customercontactentry.data = [];
    this.customercontactentry.readOnly = false;
    this.customerdepartmententry.data = [];
    this.customerdepartmententry.readOnly = false;

    this.isButtonDisabled = false;
    this.f.customerMasterCustomerJoinDate.setValue(new Date());
    this.customerdepartmententry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      ?.updateSettings(this.customercontactentry);
    this.DephotRegisterer.getInstance(this.hotdepid)?.updateSettings(
      this.customerdepartmententry
    );
    this.customerContactList = [];
    this.customerDepartmentList = [];
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.GetDefaultSettings();
    this.customeraddFormGroup.enable();
    this.customeraddFormGroup.updateValueAndValidity();
    this.getDebtorValue();
  }
  getDebtorValue() {
    this.masterapi.GetAllAccountsbyKey('DEBTORS_AC_NO').subscribe((res) => {
      const value = res.result[0].accountSettingsAccountTextValue.split('::');

      this.getDebtorMasterAccount = value[1]?.trim();
    });
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
        if (this.DefCurCheck) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
          this.f.customerMasterCustomerCurrencyId.setValue(
            Number(this.DefCurrency)
          );
        }
      }
      //location
      var DEFAULT_LOCATION = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      );

      if (DEFAULT_LOCATION != null) {
        this.DefLocationCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
        if (this.DefLocationCheck) {
          const splitText = this.DefLocationCheck.split('::');
          this.DefLocation = splitText[1]?.trim();
          this.f.customerMasterCustomerLocation.setValue(
            Number(this.DefLocation)
          );
        }
      }

      //type
      var data = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_Type'
      );
      this.detTypeCheck = data[0]?.generalSettingsTextValue;
      if (this.detTypeCheck) {
        const splitText = this.DefCurCheck?.split('::');
        this.defType = splitText[1]?.trim();
        this.f.customerMasterCustomerCustType.setValue(Number(this.defType));
      }
      var data1 = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTINTIALACCOUNT'
      );
      this.DefAccCheck = data1[0]?.generalSettingsTextValue;
      if (this.DefAccCheck) {
        const splitText = this.DefAccCheck?.split('::');
        this.DefAccount = splitText[1]?.trim();
        this.f.customerMasterCustomerGroupAccNo.setValue(this.DefAccount);
      }
    });
  }

  showMaximizableDialog() {
    this.getAllCustomers(null);
    this.displayMaximizable = true;
  }

  updateFormGrid(CustDet: NewCustomerMaster) {
    this.search = null;
    this.customeraddFormGroup.patchValue({
      customerMasterCustomerNo: CustDet?.customerMasterCustomerNo,
      customerMasterCustomerStatusValue:
        CustDet?.customerMasterCustomerStatusValue,
      customerMasterCustomerCustType: CustDet?.customerMasterCustomerCtTypeId,
      customerMasterCustomerReffAcNo: CustDet?.customerMasterCustomerReffAcNo,
      customerMasterCustomerName: CustDet?.customerMasterCustomerName,
      customerMasterCustomerCtTypeId: CustDet?.customerMasterCustomerCtTypeId,
      customerMasterCustomerContactPerson:
        CustDet?.customerMasterCustomerContactPerson,
      customerMasterCustomerCountryId: CustDet?.customerMasterCustomerCountryId,
      customerMasterCustomerCityId: CustDet?.customerMasterCustomerCityId,
      customerMasterCustomerLocation:
        CustDet?.customerMasterCustomerLocation != null &&
        CustDet?.customerMasterCustomerLocation !== ''
          ? Number(CustDet.customerMasterCustomerLocation)
          : -1,
      customerMasterCustomerAddress: CustDet?.customerMasterCustomerAddress,
      customerMasterCustomerWhatsAppNo:
        CustDet?.customerMasterCustomerWhatsAppNo,

      customerMasterCustomerPoBox: CustDet?.customerMasterCustomerPoBox,
      customerMasterCustomerEmail: CustDet?.customerMasterCustomerEmail,
      customerMasterCustomerTel1: CustDet?.customerMasterCustomerTel1,
      customerMasterCustomerTel2: CustDet?.customerMasterCustomerTel2,
      customerMasterCustomerMobile: CustDet?.customerMasterCustomerMobile,
      customerMasterCustomerFax: CustDet?.customerMasterCustomerFax,
      customerMasterCustomerJoinDate: new Date(
        CustDet?.customerMasterCustomerJoinDate
      ),
      customerMasterCustomerBlackList: CustDet?.customerMasterCustomerBlackList,
      customerMasterCustomerWebSite: CustDet?.customerMasterCustomerWebSite,
      customerMasterCustomerGroupAccNo:
        CustDet?.customerMasterCustomerGroupAccNo,
      customerMasterCustomerCurrencyId:
        CustDet?.customerMasterCustomerCurrencyId,
      customerMasterCustomerPriceLevelId:
        CustDet?.customerMasterCustomerPriceLevelId,
      customerMasterCustomerRemarks: CustDet?.customerMasterCustomerRemarks,
      customerMasterCustomerCreditLimit:
        CustDet?.customerMasterCustomerCreditLimit,
      customerMasterCustomerCreditDays:
        CustDet?.customerMasterCustomerCreditDays,
      isCreateAccount: this.isCustomerCreated,
      customerMasterCustomerVatNo: CustDet?.customerMasterCustomerVatNo,
      customerMasterCustomerArabicName:
        CustDet?.customerMasterCustomerArabicName,
    });
    const gridData: GridData[] = CustDet?.customerContacts?.map((k) => {
      let dep = this.departmentList?.find(
        (res) => res.value == k.customerContactsDepartmentId
      )?.label;
      return {
        person: k.customerContactsName,
        mobile: k.customerContactsMobile,
        officeno: k.customerContactsOffice,
        email: k.customerContactsEmail,
        Designation: k.customer_Contacts_Designation,
        department: dep,
        departments: k.customer_Contacts_Department,

        action: k.customerContactsActive.valueOf(),
        id: k.customerContactsId,
      };
    });

    const gridDataDep: GridDataDep[] = CustDet?.customerDepartment?.map((m) => {
      let dep = this.departmentList?.find(
        (res) => res.value == m.customerDepartmentsDepartmentId
      )?.label;

      return {
        department: dep,
        id: m.customerDepartmentsId,
      };
    });
    this.customercontactentry.data = gridData;
    this.customerdepartmententry.data = gridDataDep;
    this.hotRegisterer
      .getInstance(this.hotid)
      ?.updateSettings({ data: gridData, readOnly: true });
    this.DephotRegisterer.getInstance(this.hotdepid)?.updateSettings({
      data: gridDataDep,
      readOnly: true,
    });
  }

  handleChange(e) {
    this.index = e.index;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  GetSavedCustomers(id: string) {
    this.index = 0;
    this.masterapi.GetSavedCustomers(id).subscribe(
      (data: any) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.customerContactList = data.result?.customerMasterContactDetails;
          this.customerDepartmentList = data.result?.customerMasterDepartment;
          this.isCustomerCreated =
            data.result?.customerMasterCustomerGroupAccNo != '' &&
            data.result?.customerMasterCustomerGroupAccNo != null;
          this.updateFormGrid(data.result);
          this.savedNewCustomer = data.result;
          this.customeraddFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Customer not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
      }
    );
  }
  onCountryChange(event) {
    //console.log(event);
    this.citylistNew = this.cityList
      ?.filter((k) => k.cityMasterCityCountryId == Number(event.value))
      ?.map((item) => ({
        label: item.cityMasterCityName,
        value: item.cityMasterCityId,
      }));
    this.citylistNew.unshift({ label: 'Select', value: -1 });
  }

  cancel() {
    this.GetSavedCustomers(
      this.customeraddFormGroup.getRawValue().customerMasterCustomerNo
    );
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      ?.updateSettings({ readOnly: false });
    this.hotRegisterer
      .getInstance(this.hotdepid)
      ?.updateSettings(this.customercontactentry);
    this.DephotRegisterer.getInstance(this.hotdepid)?.updateSettings(
      this.customerdepartmententry
    );
    this.customeraddFormGroup.enable();
    if (this.isCustomerCreated) {
      this.customeraddFormGroup.controls.isCreateAccount.disable();
      this.customeraddFormGroup.controls.isCreateAccount.setValue(
        this.isCustomerCreated
      );
    }
    this.isButtonDisabled = false;
    this.getDebtorValue();
  }
  handleCustomerClick() {
    this.showCustomerGroup = true;
  }
  saveModel() {
    if (this.ModelFormGroup.valid) {
      this.masterapi
        .InsertCustType(this.ModelFormGroup.value)
        .subscribe((res) => {
          if (res) {
            this.showCustomerGroup = false;
            this.GetAllCustomerType();
          }
        });
    } else {
      this.ModelFormGroup.markAllAsTouched();
    }
  }
  GetAllCustomerType() {
    this.masterapi.GetAllCustType().subscribe((res: any) => {
      this.custGroupList = res?.map((kl) => ({
        label: kl.customerTypeName,
        value: kl.customerTypeId,
      }));
      this.custGroupList.unshift({ label: '--Select--', value: -1 });
      this.custGroupArry = res?.map((ar) => ar.customerTypeName.trim());
    });
  }

  userTrackingLog(type) {
    let req = {
      page: 'Add Customer',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.customeraddFormGroup
        .get('customerMasterCustomerNo')
        .value?.toString(),
      vpType: 'Add Customer',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => { });
  }
}

interface GridData {
  person?: string;
  mobile?: string;
  officeno?: string;
  email?: string;
  department?: string;
  departments?: string;
  action?: boolean;
  Designation: string;
  id?: number;
}

interface GridDataDep {
  department?: string;
  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
