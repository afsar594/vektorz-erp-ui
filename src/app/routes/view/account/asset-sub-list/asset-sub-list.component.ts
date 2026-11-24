import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MessageService, ConfirmationService } from 'primeng';
import { AssetSubListHeader } from 'src/app/routes/domain/Accounts/AssetSubList';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-asset-sub-list',
  templateUrl: './asset-sub-list.component.html',
  styleUrls: ['./asset-sub-list.component.scss'],
})
export class AssetSubListComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  cols;
  index: number = 0;
  licensekey: any;
  gridHeader: string;
  btnFlag: ButtonFlag;
  ASLForm: FormGroup;
  AssetMasterList: any[] = [];
  handleChange(e) {
    this.index = e.index;
  }

  hotid = 'assetsublist';
  private hotRegisterer = new HotTableRegisterer();
  assetsublist: Handsontable.GridSettings;

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private accountApi: AccountApiService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private permission: PermissionsService,
    private utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.ASLForm = this.fb.group({
      vNo: [{ value: '', disabled: true }],
      date: [{ value: null, disabled: true }],
      refNo: [{ value: '', disabled: true }],
      isEdit: [{ value: false, disabled: true }],
      grandTotal: [{ value: false, disabled: true }],
      narration: [{ value: null, disabled: true }, [Validators.required]],
      // AssetMasterDetail: this.fb.array([])
    });

    this.initializeControls();
  }

  GetAllAssetMasterList() {
    this.accountApi.GetAllAssetMasterList().subscribe((res: any) => {
      this.AssetMasterList = res;
    });
  }
  ASLSave() {
    if (this.ASLForm.invalid) {
      return;
    }
    const savedData: any = this.assetsublist.data?.filter((k) =>
      k?.hasOwnProperty('itemname')
    );
    const AssetSubList_Save: AssetSubListHeader = this.ASLForm
      .value as AssetSubListHeader;

    AssetSubList_Save.voucherNo = this.ASLForm.getRawValue().vNo;
    AssetSubList_Save.voucherDate = this.ASLForm.getRawValue().date;
    AssetSubList_Save.refNo = this.ASLForm.getRawValue().refNo;
    AssetSubList_Save.grandTotal = this.ASLForm.getRawValue().grandTotal;
    AssetSubList_Save.description = this.ASLForm.getRawValue().narration;
    AssetSubList_Save.assetSubMasterDetails = savedData
      ?.filter((k) => k.itemId != null)
      .map((k: GridData) => {
        return {
          groupID: k.groupID,
          subAssetID: k.subAssetID,
          slNo: k.slNo,
          assetDescription: k.assetDescription,
          assetCode: k.assetCode,
          purchDate: k.purchDate,
          purchPrice: k.purchPrice,
          depPerc: k.depPerc,
          depDate: k.depDate,
          days: k.days,
          perDay: k.perDay,
          accDep: k.accDep,
          bookVaue: k.bookVaue,
          voucherNo: k.voucherNo,
          isEdit: true,
          remarks: k.remarks,
        };
      });
  }

  initializeControls() {
    this.assetsublist = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 3,
      width: '100%',
      height: 500,
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
      columns: [
        {
          data: 'Code',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'Asset Name',
          type: 'numeric',
          width: 150,
        },
        {
          data: 'SubAsset Code',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'SubAsset Name',
          type: 'numeric',
          width: 150,
        },
        {
          data: 'Purchase Date',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'Price',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'Dep Perc',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'Per Day Rate',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'Remark',
          type: 'numeric',
          width: 150,
        },
      ],
      colHeaders: [
        this.translate.instant('Code'),
        this.translate.instant('Asset Name'),
        this.translate.instant('SubAsset Code'),
        this.translate.instant('SubAsset Name'),
        this.translate.instant('Purchase Date'),
        this.translate.instant('Price'),
        this.translate.instant('Dep Perc'),
        this.translate.instant('Per Day Rate'),
        this.translate.instant('Remark'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

  new() {
    this.ASLForm.reset();
    this.assetsublist.data = [];
    this.assetsublist.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.assetsublist);
    this.ASLForm.get('isEdit').setValue(false);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.ASLForm.enable();
  }

  edit() {
    this.ASLForm.enable();
    this.assetsublist.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.ASLForm.get('true').setValue(false);
  }
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}

interface GridData {
  groupID: number;
  subAssetID: number;
  slNo: number;
  assetDescription: string;
  assetCode: string;
  purchDate: Date;
  purchPrice: number;
  depPerc: number;
  depDate: Date;
  days: number;
  perDay: number;
  accDep: number;
  bookVaue: number;
  voucherNo: string;
  isEdit: true;
  remarks: string;
}
