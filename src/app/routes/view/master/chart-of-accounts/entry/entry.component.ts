import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  SimpleChanges,
  OnChanges,
  Inject,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  UrlTree,
  UrlSegmentGroup,
  PRIMARY_OUTLET,
  UrlSegment,
} from '@angular/router';
import {
  MessageService,
  ConfirmationService,
  MenuItem,
  SelectItem,
} from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { defaults } from 'src/app/shared/service/settings';
import { ItemStockType } from 'src/app/routes/domain/ItemStockType';
import { VendorMaster } from 'src/app/routes/domain/Masters/VendorMaster';
import { ItemSupplierDetails } from 'src/app/routes/domain/ItemSupplierDetails';
import { Subject } from 'rxjs';
import {
  SupplierMaster,
  ItemMaster,
  ChartofAccounts,
} from 'src/app/routes/domain';
import { debounceTime } from 'rxjs/operators';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
})
export class EntryComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() ItemData: ItemMaster;
  @Input() groupData: any;
  @Input() listmode: boolean = true;
  title: string;
  url: any;
  btnFlag: ButtonFlag;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  date1: string;

  hotidPriceTbl: string;
  hotidUnitTbl: string;
  supplierList: ItemSupplierDetails[] = [];

  ItemStockTypeArry: ItemStockType[] = [];
  brandArry: VendorMaster[] = [];
  newaccountForm: FormGroup;

  ItemStockList: SelectItem[] = [];
  brandList: SelectItem[] = [];
  supplierMasterListArry: SupplierMaster[] = [];
  supplierMasterList: SelectItem[] = [];

  accountGroup: SelectItem[] = [];
  accountGroupSub: any[] = [];
  savedAccountMaster: ChartofAccounts = null;
  button = true;
  private itemId: any;
  accountTableData: Subject<ChartofAccounts[]> = new Subject<
    ChartofAccounts[]
  >();
  private searchfilter: Subject<string> = new Subject();
  pageType: string = 'add';
  maAccNo: number;
  ScreenId: number;
  Permission: any;
  issaved: boolean = false;
  confirmdialog: boolean = false;
  itemMasterAccountName: any;
  changeG: boolean = false;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private permission: PermissionsService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
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
    this.searchfilter.pipe(debounceTime(500)).subscribe((searchTextValue) => {
      this.getAccountByname(searchTextValue);
    });
    this.newaccountForm = this.fb.group({
      maSno: [''],
      maAccNo: [''],
      maAccName: [''],
      maAccType: [''],
      maRelativeNo: [''],
      maManualCode: [''],
      itemMasterAccountName: [''],
      maDateCreated: [new Date()],
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    if (this.config && this.config.data) {
      this.pageType = this.config.data.pageType;
      this.maAccNo = this.config.data.maAccNo;
      this.itemMasterAccountName = this.config.data.itemMasterAccountName;
      this.button = this.config.data.button;
      this.changeG = this.config.data.changeG;
    }
    if (this.pageType == 'add') {
      this.new();
    } else if (this.pageType == 'edit') {
      this.edit();
    }
    this.getAllAccount();
    this.date1 = new Date().toLocaleDateString();
  }

  get f() {
    return this.newaccountForm.controls;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ItemData?.currentValue != null) {
      this.bindingValues({ result: changes.ItemData?.currentValue });
    }
  }

  ngAfterViewInit() {
    this.routeCheck();
  }

  routeCheck() {
    if (this.checkUrlSegment('edit') || this.pageType == 'edit') {
      this.btnFlag = {
        edit: true,
        cancel: false,
        save: false,
        update: false,
        delete: true,
      };
      this.updateForms();
    }
  }

  checkUrlSegment(str: string): boolean {
    const tree: UrlTree = this.router.parseUrl(this.router.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g.segments;
    return s.some((k) => k.path === str);
  }

  edit() {
    this.newaccountForm.enable();
    this.newaccountForm.updateValueAndValidity();
    this.btnFlag = {
      edit: false,
      cancel: true,
      save: false,
      update: true,
      delete: true,
    };
  }

  bindingValues({ result }: { result: ChartofAccounts }): void {
    if (!result) return;

    this.savedAccountMaster = result;

    const matchedAccount = this.accountGroupSub?.find(
      (a) => a.value === result.maRelativeNo
    );

    const {
      maSno = 0,
      maAccNo = '',
      maAccName = '',
      maRelativeNo = null,
      maDateCreated,
      maManualCode,
      maAccType = '',
    } = result;

    this.newaccountForm.patchValue(
      {
        maSno,
        maAccNo,
        maAccName,
        maRelativeNo,
        maDateCreated: maDateCreated ? new Date(maDateCreated) : null,
        maManualCode,
        maAccType,
        itemMasterAccountName: matchedAccount?.label ?? '',
      },
      { emitEvent: false }
    );
  }

  updateForms(): void {
    this.itemId = this.maAccNo;
    this.masterapi.GetAllAccountMasterById(this.itemId).subscribe((data) => {
      if (data.valid) {
        this.bindingValues({ result: data.result });
      }
    });
  }

  onKeyUp(searchTextValue: string) {
    this.searchfilter.next(searchTextValue);
  }

  onSelectFile($event) {
    if ($event.target.files && $event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL($event.target.files[0]);
      reader.onload = (event) => {
        this.url = event.target.result;
        this.newaccountForm.controls.itemMasterImageBase64.setValue(
          event.target.result
        );
      };
    }
  }

  getAllItems() {
    this.masterapi.getAccountParentTreeNode().subscribe((data) => {
      this.accountGroup = data.result.map((k) => ({
        label: k.maAccName,
        value: k.maAccNo,
      }));
      this.accountGroup.unshift({ label: 'Account Master', value: null });
      if (this.pageType == 'add') {
        this.activatedroute.paramMap.subscribe((params) => {
          this.itemId = this.maAccNo;
          this.newaccountForm.controls.maRelativeNo.setValue(this.itemId);
        });
      }
    });
  }

  getAllAccount() {
    this.accountapi.GetAllAcounts().subscribe((k) => {
      this.accountGroupSub = k.result;
      this.accountGroupSub = k.result.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountGroupSub.unshift({ label: 'Account Mater', value: '0' });
      if (this.pageType == 'add') {
        this.activatedroute.paramMap.subscribe((params) => {
          this.itemId = this.maAccNo;
          this.newaccountForm.controls.maRelativeNo.setValue(this.itemId);
          this.newaccountForm.controls.itemMasterAccountName.setValue(
            this.itemMasterAccountName
          );
        });
      }
    });
  }

  getStockType() {
    this.masterapi.GetAllItemStock().subscribe((data) => {
      this.ItemStockTypeArry = data.result;
      this.ItemStockList = this.ItemStockTypeArry.map((k) => {
        return { label: k.itemStockTypeDescription, value: k.itemStockTypeId };
      });
      this.ItemStockList.unshift({ label: '--Select--', value: '-1' });
    });
  }

  search(event) {
    if (event.query.trim() !== '') {
      this.brandList = this.brandArry
        ?.filter((k) =>
          k.vendorMasterVendorName
            .toLowerCase()
            .match(event.query.toLowerCase())
        )
        .map((x) => ({
          label: x.vendorMasterVendorName,
          value: x.vendorMasterVendorId,
        }));
    } else {
      this.brandList = this.brandArry.map((x) => ({
        label: x.vendorMasterVendorName,
        value: x.vendorMasterVendorId,
      }));
    }
  }

  getAccountByname(event) {
    this.masterapi
      .GetAllAccountByName(event as string)
      .pipe(debounceTime(4000))
      .subscribe((data) => {
        this.accountTableData.next(data.result);
      });
  }

  saveItem() {
    this.issaved = true;
    this.changeG = false;

    const formValue = this.newaccountForm.value;
    const accountData: ChartofAccounts = {
      ...formValue,
      maSno: formValue.maSno ?? 0,
      maDateCreated: formValue.maDateCreated
        ? new Date(formValue.maDateCreated)
        : new Date(),
    };

    const message = this.btnFlag.save
      ? this.translate.instant('Do you want to save Account?')
      : this.translate.instant('Do you want to Update Account?');

    this.confirmation.confirm({
      key: 'confirm-key',
      message,
      accept: () => {
        this.masterapi.NewAccount(accountData).subscribe((data) => {
          if (data.valid) {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: data.message,
            });
            this.ref.close(true);
            this.issaved = false;
            if (data.result) {
              this.bindingValues({ result: data.result });
            }
          }
        });
      },
    });
  }

  new() {
    this.newaccountForm.reset();

    this.newaccountForm.get('maSno')?.setValue(null);
    this.newaccountForm.get('itemMasterStockType')?.setValue(null);
    this.newaccountForm.get('maDateCreated')?.setValue(new Date());
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.newaccountForm.enable();
    this.newaccountForm.updateValueAndValidity();
  }

  cancel() {
    this.bindingValues({ result: this.savedAccountMaster });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: true,
    };
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',

      message: 'Do you want to Delete Account?',
      accept: () => {
        this.masterapi
          .DeleteNewAccount(this.savedAccountMaster)
          .subscribe((data) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: data.message,
            });
          });

        this.new();
        this.ref.close();
      },
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
