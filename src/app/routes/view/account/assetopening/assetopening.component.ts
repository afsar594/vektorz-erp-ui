import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { defaults } from 'src/app/shared/service/settings';
import { EntityResponse } from 'src/app/routes/domain/Masters/EntityResponse';
import { AssetOpeningListComponent } from './asset-opening-list/asset-opening-list.component';
import { AssetMasterListComponent } from './asset-master-list/asset-master-list.component';
import {
  ConfirmationService,
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
  MessageService,
  SelectItem,
} from 'primeng';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-assetopening',
  templateUrl: './assetopening.component.html',
  styleUrls: ['./assetopening.component.scss'],
})
export class AssetopeningComponent implements OnInit {
  displayMaximizable: boolean;
  ScreenId: number;
  Permission: any;
  user: any;
  saveAssetOpening() {
    throw new Error('Method not implemented.');
  }
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  index: number = 0;
  location: Array<string>;
  supplier: Array<string>;
  licensekey: any;
  gridHeader: string;
  assetsArray: Array<string>;
  AOForm: FormGroup;
  filter: any;
  search: any;
  state: {
    Dir: string;
    Field: any;
    Skip: any;
    Take: any;
    Search: any;
    Filter: any;
  };
  currency: any;
  handleChange(e) {
    this.index = e.index;
  }
  btnFlag: ButtonFlag;
  hotid = 'assetopening';
  private hotRegisterer = new HotTableRegisterer();
  assetopening: Handsontable.GridSettings;
  confirmDropDatabaseDialogVisible = false;
  initializeControls() {
    (this.assetopening = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 7,
      width: '100%',
      height: 200,
      rowHeights: 23,
      readOnly: true,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      beforeOnCellMouseUp: (event, coords, TD) => {
        if (coords.col.valueOf() === 0) {
          this.LoadAccountMasterList(coords);
        }
      },
      data: [],
      enterMoves: { row: 0, col: 1 },
      minSpareRows: 1,
      allowInsertRow: true,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'BatchCode',
          type: 'text',
          width: 100,
        },
        {
          data: 'AstPurchaseID',
          type: 'text',
          width: 100,
        },
        {
          data: 'AssetSize',
          type: 'text',
          width: 100,
        },
        ,
        {
          data: 'PurDate',
          type: 'text',
          renderer: this.dateRenderer.bind(this),
          readOnly: true,

          width: 100,
        },
        {
          data: 'AstPurRefNo',
          type: 'text',
          width: 100,
        },
        {
          data: 'Quantity',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 100,
        },
        {
          data: 'Rate',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 100,
        },
        {
          data: 'Amount',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 100,
          readOnly: true,
        },
        {
          data: 'AccDepAmt',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 100,
        },
        {
          data: 'BookValue',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 100,
        },
        {
          data: 'LifrInYrs',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 100,
        },
        {
          data: 'DepMode',
          type: 'dropdown',
          source: ['yellow', 'red'],
        },
      ],
      colHeaders: [
        this.translate.instant('CODE'),
        this.translate.instant('Ast Acc No'),
        this.translate.instant('Liab. Acc No'),
        this.translate.instant('Asset Name'),
        this.translate.instant('PurDate'),
        this.translate.instant('PurrRefNo'),
        this.translate.instant('Qty'),
        this.translate.instant('Rate'),
        this.translate.instant('Amount'),
        this.translate.instant('Accum DepAmt'),
        this.translate.instant('Book Value'),
        this.translate.instant('LifeInYrs'),
        this.translate.instant('DepMode'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    }),
      (this.assetopening.afterRemoveRow = (index: number, amount: number) => {
        this.GetTotal();
      });

    this.assetopening.beforeChangeRender = (change, source) => {
      // console.log(change)
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      var data = hotinstance.getDataAtRow(change[0][0]);

      if (change != null) {
        if (data[6] != null && data[7] != null && change[0][1] != 'Amount') {
          //&& data[7] != null
          var sum1 = data[6] * data[7];

          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(change[0][0], 8, sum1);
        }
      }

      this.GetTotal();
    };
  }

  dateRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    if (value) {
      const formattedDate = this.datePipe.transform(value, 'dd/MM/yyyy');
      td.innerText = formattedDate ? formattedDate : '';
    } else {
      td.innerText = '';
    }
  }

  GetTotal() {
    var netAmt = 0;
    this.assetopening.data.forEach((elemt: any) => {
      if (elemt && elemt.Amount) {
        netAmt += elemt.Amount;
      }
    });
    this.AOForm.controls.netAmount.setValue(netAmt);
  }

  DefCurrency: string;
  DefCurCheck: string;

  currencyList: SelectItem[];
  currArry: string[] = [];

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private accService: AccountstatementService,
    private dialogService: DialogService,
    private masterapi: MasterApiService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private permission: PermissionsService,
    private utilityService: UtilityService,
    private datePipe: DatePipe
  ) {}

  getDefaultCurrency() {
    this.masterapi
      .GetGeneralSettingbyKey('DEFAULTCURRENCY')
      .subscribe((data) => {
        if (data !== null) {
          this.DefCurCheck = data.result[0].generalSettingsTextValue;
          if (this.DefCurCheck !== null) {
            const splitText = this.DefCurCheck.split('::');
            this.DefCurrency = splitText[1]?.trim();
            this.f.currencyId.setValue(Number(this.DefCurrency));
          }
        }
      });
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.user = this.permission.getUser();
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Asset Opening') {
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
    //this.invoiceType = [ {value:'type A'} ,{value:'type B'} ,{value:'type C'}];
    this.AOForm = this.fb.group({
      actualAmount: [{ value: '', disabled: true }],
      astPurDt: [{ value: null, disabled: true }],
      netAmount: [{ value: '', disabled: true }, [Validators.required]],
      astPurID: [{ value: 0, disabled: true }],
      assetPurchaseVoucherNo: [{ value: '', disabled: true }],
      drAmount: [{ value: 0, disabled: true }],
      disAmount: [{ value: 0, disabled: true }],
      description: [{ value: '', disabled: true }],
      disPer: [{ value: 0, disabled: true }],
      currencyId: [-1, [DropDownValidator]],
      assetPurchaseVoucherDetail: this.fb.array([]),
    });
    this.AOForm.disable;
    this.btnFlag = {
      new: false,
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      print: false,
    };

    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.initializeControls();
    this.getAllCurrency();
  }

  get f() {
    return this.AOForm.controls;
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.purchaseRequisitionNo.clearValidators();

    this.AOForm.enable();
    this.AOForm.updateValueAndValidity();
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
    };
  }
  cancel() {
    this.new();
  }

  getAllCurrency() {
    this.masterapi.GetAllCurrency().subscribe((k) => {
      this.currencyList = k.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = k.map((ar) => ar.currencyMasterCurrencyName?.trim());
    });
  }

  new() {
    this.AOForm.reset();
    this.assetopening.data = [];
    this.assetopening.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.assetopening);
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.AOForm.get('astPurDt').setValue(new Date());
    this.AOForm.get('astPurID').setValue(0);
    this.btnFlag = {
      edit: false,
      cancel: true,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.search = null;
    this.index = 0;
    this.AOForm.enable();
    this.AOForm.updateValueAndValidity();
    this.getDefaultCurrency();
  }

  GetGridListData(event: any) {
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
    this.accService
      .GetAssetOpeningList(this.state)
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.data.length > 0) {
          this.dataset = response.result.assetPurchaseVoucherDetail;
        }
      });
  }

  patchAODetailsValues(
    AssetSize,
    Amount,
    Quantity,
    BookValue,
    AccDepAmt,
    Rate,
    LifrInYrs,
    DepMode,
    Colour,
    AstID,
    AstPurRefNo,
    BatchCode
  ) {
    return this.fb.group({
      astPurchaseID: this.AOForm.get('astPurID').value,
      assetSize: [AssetSize],
      amount: [Amount],
      quantity: [Quantity],
      bookValue: [BookValue],
      accDepAmt: [AccDepAmt],
      rate: [Rate],
      lifrInYrs: [LifrInYrs],
      depMode: [DepMode],
      colour: [Colour],
      astID: [AstID],
      astPurRefNo: [AstPurRefNo],
      batchCode: [BatchCode],
    });
  }

  AssetOpeningFormSubmit() {
    if (this.AOForm.invalid) {
      return;
    }
    const control = <FormArray>this.AOForm.get('assetPurchaseVoucherDetail');
    const savedData: any = this.assetopening.data?.filter((k) =>
      k.hasOwnProperty('AstPurchaseID')
    );
    if (savedData.length <= 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alert',
        detail: 'No Data Found in Details',
      });
    }
    // const data = this.dataset;

    savedData?.forEach((x) => {
      control.push(
        this.patchAODetailsValues(
          x.AssetSize,
          x.Amount,
          x.Quantity,
          x.BookValue,
          x.AccDepAmt,
          x.Rate,
          x.LifrInYrs,
          x.DepMode,
          x.Colour,
          x.AstID,
          x.AstPurRefNo,
          x.BatchCode
        )
      );
    });
    let Issave = this.AOForm.get('astPurID').value == 0 ? 'Save' : 'Update';
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant(`Do you want to ${Issave}?`),
      accept: () => {
        this.accService.AddEditAssetOpening(this.AOForm.value).subscribe(
          (response: ApiResponse<any>) => {
            if (response.valid) {
              this.userTrackingLog('Insert');
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                print: true,
              };

              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: this.translate.instant(response.message),
              });
            } else if (response.error) {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail:
                  response.message != null && response.message?.trim() !== ''
                    ? response.message
                    : response.exception,
              });
            }
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Asset Opening Save Failed',
            });
          }
        );
      },
    });
  }

  LoadAccountTransaction() {
    // let query=this.GetCustomerSupplierFilter();
    // this.filter=query;
    this.GetGridListData(null);
  }

  LoadAssetOpeningList() {
    const ref = this.dialogService.open(AssetOpeningListComponent, {
      data: {
        id: '51gF3',
      },
      header: 'Asset Opening List',
      width: '75%',
    });

    ref.onClose.subscribe((res) => {
      const data = res;
      this.GetSpecificAssetOpening(data);
    });
  }

  GetSpecificAssetOpening(id) {
    this.accService
      .GetAssetOpening(id)
      .subscribe((response: EntityResponse<any>) => {
        if (response.valid) {
          this.AOForm.reset();
          this.AOForm.controls['actualAmount'].setValue(
            response.result.actualAmount
          );
          this.AOForm.controls['netAmount'].setValue(response.result.netAmount);
          this.AOForm.controls['astPurID'].setValue(response.result.astPurID);
          this.AOForm.controls['assetPurchaseVoucherNo'].setValue(
            response.result.astPurchaseID
          );
          this.AOForm.controls['drAmount'].setValue(response.result.drAmount);
          this.AOForm.controls['disAmount'].setValue(response.result.disAmount);
          this.AOForm.controls['description'].setValue(
            response.result.description
          );
          this.AOForm.controls['disPer'].setValue(response.result.disPer);
          this.AOForm.controls['currencyId'].setValue(
            response.result.currencyId
          );
          this.AOForm.controls['astPurDt'].setValue(response.result.astPurDt);
          this.dataset = response.result.voucherAllocationDetails;
        }
      });
  }

  LoadAccountMasterList(index) {
    const ref = this.dialogService.open(AssetMasterListComponent, {
      data: {
        id: '51gF3',
      },
      header: 'Account Master',
      width: '70%',
    });

    ref.onClose.subscribe((res) => {
      const hot = this.hotRegisterer.getInstance(this.hotid);
      const data = res;
      hot.setDataAtCell(index.row, 0, data[0]);
      hot.setDataAtCell(index.row, 1, data[1]);
      hot.setDataAtCell(index.row, 2, data[3]);
      hot.setDataAtCell(index.row, 3, data[2]);
      hot.setDataAtCell(index.row, 4, data[6]);
      this.hotRegisterer.getInstance(this.hotid).selectCell(index.row, 5);
    });
  }
  userTrackingLog(type) {
    let req = {
      page: 'Asset Opening',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.AOForm.get('assetPurchaseVoucherNo').value,
      vpType: 'Asset Opening',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }
}

interface ButtonFlag {
  print?: boolean;
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  new?: boolean;
  save?: boolean;
  delete?: boolean;
}
