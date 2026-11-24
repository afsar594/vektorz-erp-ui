import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  TreeNode,
  MenuItem,
  SelectItem,
  DynamicDialogRef,
  MessageService,
  ConfirmationService,
  DialogService,
} from 'primeng';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { DatashareService } from 'src/app/datashare.service';
import { ItemMasterStatus } from 'src/app/routes/Enums/ItemMaster';
import { ItemMaster, ChartofAccounts } from 'src/app/routes/domain';
import { ItemFilter } from 'src/app/routes/domain/Masters/ItemFilter';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  elementReference: ElementRef;
  @ViewChild('accountCtrl', { static: false }) accountCtrl: ElementRef;
  @ViewChild('creditCtrl', { static: false }) creditCtrl: ElementRef;
  @ViewChild('debitCtrl', { static: false }) debitCtrl: ElementRef;

  files: TreeNode[] = [];
  selectedFile: TreeNode;
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;
  lookupColumns = [];
  selectItem: any;
  showFormControlLookUp: boolean = false;
  showControlLookUp: boolean = false;
  control: AbstractControl;
  dataList: Array<any> = [];

  itemData: ItemMaster;
  displayBasic: boolean;
  title: string;
  search: ItemFilter = new ItemFilter();

  items: any[] = [
    {
      label: 'New Item Group',
      icon: 'pi pi-align-left',
      group: 'Root',
      command: (event) => {
        // event doesn't contain anything useful,
        // and only has the clicked menu item specific information.
        this.itemMasterGrpFormGroup.reset();

        let data: ItemMaster =
          this.selectedFile.data != null
            ? (this.selectedFile.data as ItemMaster)
            : { itemMasterItemId: null };
        if (data.itemMasterItemId) {
          this.itemMasterGrpFormGroup.patchValue({
            itemMasterAccountNo: data.itemMasterItemId,
          });
          this.accountCtrl.nativeElement.value = this.parentGroup?.find(
            (k) => k.value == data.itemMasterItemId
          )?.label;
        } else {
          this.itemMasterGrpFormGroup.patchValue({
            itemMasterAccountNo: 0,
            itemMasterGroupDebitAcc: null,
            itemMasterGroupCreditAcc: null,
            itemMasterItemName: null,
            itemMasterItemId: null,
          });
          this.accountCtrl.nativeElement.value = this.parentGroup?.find(
            (k) =>
              k.value == this.itemMasterGrpFormGroup.value.itemMasterAccountNo
          )?.label;
        }
        this.showBasicDialog();
      },
      disabled: false,
    },

    {
      label: 'Edit Item Group',
      icon: 'pi pi-user-edit',
      group: 'G',
      command: (event) => {
        // event doesn't contain anything useful,
        // and only has the clicked menu item specific information.
        this.itemMasterGrpFormGroup.patchValue({
          itemMasterGroupDebitAcc:
            this.selectedFile.data.itemMasterGroupDebitAcc,
          itemMasterGroupCreditAcc:
            this.selectedFile.data.itemMasterGroupCreditAcc,
          itemMasterItemName: this.selectedFile.data.itemMasterItemName,
          itemMasterItemId: this.selectedFile.data.itemMasterItemId,
          itemMasterAccountNo: this.selectedFile.data.itemMasterAccountNo,
        });

        this.accountCtrl.nativeElement.value = this.parentGroup?.find(
          (k) => k.value == this.selectedFile.data.itemMasterAccountNo
        )?.label;

        this.debitCtrl.nativeElement.value = this.accountList?.find(
          (k) => k.value == this.selectedFile.data.itemMasterGroupDebitAcc
        )?.label;

        this.creditCtrl.nativeElement.value = this.accountList?.find(
          (k) => k.value == this.selectedFile.data.itemMasterGroupCreditAcc
        )?.label;

        this.showBasicDialog();
      },
      disabled: false,
    },
    {
      label: 'Delete item Group',
      icon: 'pi pi-trash',
      group: 'G',
      command: (event) => {
        // event doesn't contain anything useful,
        // and only has the clicked menu item specific information.
        this.delete();
      },
      disabled: false,
    },
    {
      label: 'New Item',
      icon: 'pi pi-plus',
      group: 'G',
      command: (event) => {
        // event doesn't contain anything useful,
        // and only has the clicked menu item specific information.
        //this.router.navigate(['/master/item/entry/' + this.selectedFile.data.itemMasterItemId]);
        this.router.navigate(
          ['/master/item/entry', this.selectedFile.data.itemMasterItemId],
          {
            queryParams: {
              id: this.selectedFile.data.itemMasterItemId,
              menu: 11,
            },
          }
        );
      },
      disabled: false,
    },
    {
      label: 'Edit Item',
      icon: 'pi pi-user-edit',
      group: 'I',
      command: (event) => {
        // event doesn't contain anything useful,
        // and only has the clicked menu item specific information.
        //this.router.navigate(['/master/item/edit/' + this.selectedFile.data.itemMasterItemId]);
        this.router.navigate(
          ['/master/item/edit', this.selectedFile.data.itemMasterItemId],
          {
            queryParams: {
              id: this.selectedFile.data.itemMasterItemId,
              menu: 11,
            },
          }
        );
      },
      disabled: false,
    },
    {
      label: 'Delete Item',
      icon: 'pi pi-trash',
      group: 'I',
      command: (event) => {
        // event doesn't contain anything useful,
        // and only has the clicked menu item specific information.
        this.delete();
      },
      disabled: false,
    },
  ];

  url: any;
  btnFlag: ButtonFlag;
  breadcumbmodel: MenuItem[];
  parentGroup: SelectItem[] = [];
  itemGroup: SelectItem[] = [];
  accountArray: ChartofAccounts[] = [];
  accountList: SelectItem[] = [];
  itemMasterGrpFormGroup: FormGroup;
  confirmDropDatabaseDialogVisible = false;
  id: any;
  ref: DynamicDialogRef | undefined;
  ItemMasterArray: ItemMaster[];
  ItemMasterList: { label: string; value: number }[];
  ItemMasterArry: string[];

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private accountapi: AccountApiService,
    private masterapi: MasterApiService,
    private datashare: DatashareService,
    public dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.id = window.sessionStorage.getItem('id');
    window.sessionStorage.removeItem('id');

    // this.itemMasterGrpFormGroup =  this.fb.group({
    //   itemMasterGroupDebitAcc: [{value : null}],
    //   itemMasterGroupCreditAcc: [{value : null}],
    //   itemMasterItemName: [{value : ''}],
    //   itemMasterItemId: [{value : null}],
    //   itemMasterAccountNo: [{value : null}],
    // });
    this.itemMasterGrpFormGroup = this.fb.group({
      itemMasterGroupDebitAcc: [null],
      itemMasterGroupCreditAcc: [null],
      itemMasterItemName: [null],
      itemMasterItemId: [null],
      itemMasterAccountNo: [null],
    });

    this.getAllAccount();
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    // this.getAllItemMaster();
    this.getAllItems();
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(400), // Wait 400ms after user stops typing
        distinctUntilChanged() // Only trigger if the value is different from last time
      )
      .subscribe((term) => {
        this.performSearch(term);
      });
  }

  get parentLookup() {
    return this.parentGroup.map((kl) => ({
      account: kl.label,
      accountId: kl.value,
    }));
  }

  get creditLookup() {
    return this.accountList.map((kl) => ({
      account: kl.label,
      accountId: kl.value,
    }));
  }
  get itemLookup() {
    return this.ItemMasterList.map((res) => ({
      account: res.label,
      accountId: res.value,
    }));
  }
  // 3. This is called by (ngModelChange)
  onModelChange(term: string): void {

    this.searchSubject.next(term);
  }

  performSearch(term: string): void {
    // If the user clears the input, you might want to hide the lookup
    if (!term) {
      this.ItemMasterArray = [];
      this.showControlLookUp = false;
      return;
    }

    let req = {
      pageNumber: 1,
      pageSize: 50,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name,Item_Master_Item_ID,',
      sortDirection: 'asc',
    };

    this.accountapi.LoadFilteredItemMaster(req).subscribe((m: any) => {
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterArry = m.resultSet.itemMaster?.map(
        (ar) => ar.itemMasterItemName?.trim() + '|' + ar.itemMasterItemId
      );
      this.dataList = this.itemLookup;
      this.showControlLookUp = true;
    });
  }

  ngOnDestroy() {
    // 4. Clean up to prevent memory leaks
    this.searchSubscription?.unsubscribe();
  }
  openAccount() {
    this.control = this.itemMasterGrpFormGroup.controls.itemMasterAccountNo;
    this.elementReference = this.accountCtrl;
    this.lookupColumns = ['Account', 'Account ID'];
    this.showFormControlLookUp = true;
    this.selectItem = {
      account: this.accountCtrl.nativeElement.value,
      accountId: this.itemMasterGrpFormGroup.controls.itemMasterAccountNo.value,
    };
    this.dataList = this.parentLookup;
  }

  openCreditAccount() {
    this.control =
      this.itemMasterGrpFormGroup.controls.itemMasterGroupCreditAcc;
    this.elementReference = this.creditCtrl;
    this.lookupColumns = ['Account', 'Account ID'];
    this.showFormControlLookUp = true;
    this.selectItem = {
      account: this.creditCtrl.nativeElement.value,
      accountId:
        this.itemMasterGrpFormGroup.controls.itemMasterGroupCreditAcc.value,
    };
    this.dataList = this.creditLookup;
  }

  openDebitAccount() {
    this.control = this.itemMasterGrpFormGroup.controls.itemMasterGroupDebitAcc;
    this.elementReference = this.debitCtrl;
    this.lookupColumns = ['Account', 'Account ID'];
    this.showFormControlLookUp = true;
    this.selectItem = {
      account: this.debitCtrl.nativeElement.value,
      accountId:
        this.itemMasterGrpFormGroup.controls.itemMasterGroupDebitAcc.value,
    };
    this.dataList = this.creditLookup;
  }

  exit(evt) {
    this.showFormControlLookUp = false;
    this.showControlLookUp = false;
  }

  clear(evt) {
    if (evt.elementRef != null) {
      (evt.elementRef as ElementRef).nativeElement.value = '';
      evt.formControl.setValue(null);
    }
    this.showFormControlLookUp = false;
    this.showControlLookUp = false;
  }

  selectControl(evt) {
    this.control.setValue(evt.accountId);
    this.elementReference.nativeElement.value = evt.account;
    this.showFormControlLookUp = false;
  }
  selectedtItem(evt) {
    this.search.itemName = evt.account;
    this.showControlLookUp = false;
    this.router.navigate(['/master/item/edit', evt?.accountId], {
      queryParams: { menu: 11 },
    });
  }

  hide(evt: boolean) {
    this.showFormControlLookUp = false;
    this.showControlLookUp = false;
  }

  getAllItems() {
    this.masterapi.getItemsParentTreeNode().subscribe((data) => {
      this.files = [
        {
          label: 'Item Master',
          key: 'Item Master',
          data: null,
          expandedIcon: 'fa fa-folder-open',
          styleClass: 'folder',
          expanded: true,
          collapsedIcon: 'fa fa-folder',
          children: data.result.map((k) => {
            return {
              label: k.itemMasterItemName,
              key: k.itemMasterItemId.toString(),
              data: k,
              expandedIcon: 'fa fa-folder-open',
              collapsedIcon: 'fa fa-folder',
              styleClass: 'folder',
              children: [],
              leaf: false,
            };
          }),
          leaf: false,
        },
      ];
      this.parentGroup = data.result.map((k) => ({
        label: k.itemMasterItemName,
        value: k.itemMasterItemId,
      }));
      this.parentGroup.unshift({ label: 'Item Master', value: 0 });
      if (this.id) {
        const foundObject = this.parentGroup?.find((k) => k.value == this.id);

        this.search.itemName = foundObject?.label;
        this.SearchFilter({ itemName: foundObject?.label });
      }
    });
  }
  getAllItemMaster() {
    this.masterapi.GetAllItemNotGroup().subscribe((k) => {
      this.ItemMasterArray = k.result;
      this.ItemMasterList = k.result.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      this.ItemMasterArry = k.result?.map(
        (ar) => ar.itemMasterItemName?.trim() + '|' + ar.itemMasterItemId
      );
      this.dataList = this.itemLookup;

      this.showControlLookUp = true;
    });
  }
  contextMenuSelection($event, cm) {
    if ($event.key.trim() == 'Item Master') {
      Object.assign(
        cm.model,
        this.items?.filter((k) => {
          if (k.group.trim() != 'Root') {
            k.disabled = true;
          } else {
            k.disabled = false;
          }
          return k;
        })
      );
    } else {
      if ($event.leaf) {
        Object.assign(
          cm.model,
          this.items?.filter((k) => {
            if (k.group.trim() == 'G' || k.group.trim() == 'Root') {
              k.disabled = true;
            } else {
              k.disabled = false;
            }
            return k;
          })
        );
      } else {
        Object.assign(
          cm.model,
          this.items?.filter((k) => {
            if (k.group.trim() != 'G' && k.group.trim() != 'Root') {
              k.disabled = true;
            } else {
              k.disabled = false;
            }
            return k;
          })
        );
      }
    }
  }

  loadNode(event) {
    if (event.node) {
      // this.nodeService.getLazyFiles().then(nodes => event.node.children = nodes);
      this.masterapi
        .getItemsChildrenByParentTreeNode(event.node.data.itemMasterItemId)
        .subscribe((data) => {
          event.node.children = [];
          for (const item of data.result) {
            const isGroup = item.itemMasterItemType === ItemMasterStatus.Group;
            event.node.children.push({
              label: item.itemMasterItemName,
              key: item.itemMasterItemId.toString(),
              data: item,
              expandedIcon: isGroup ? 'fa fa-folder-open' : undefined,
              collapsedIcon: isGroup ? 'fa fa-folder' : undefined,
              icon: isGroup ? undefined : 'fa fa-file-o',
              styleClass: isGroup ? 'folder' : 'file',
              leaf: !isGroup,
            });
          }
        });
    }
  }

  getItemData($event) {
    const itemmasterData = this.selectedFile.data as ItemMaster;
    this.search.itemName = itemmasterData?.itemMasterItemName;
    this.itemData = itemmasterData;
    this.masterapi.sendData(this.selectedFile.data.itemMasterItemId);
  }

  getAllAccount() {
    this.accountapi.GetAllAcounts().subscribe((k) => {
      this.accountArray = k.result;
      this.accountList = k.result.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      // this.accountList.unshift({label : '--Select--', value: -1});
    });
  }

  showBasicDialog() {
    this.accountapi.GetDefaultCreditDebitAccounts().subscribe((data) => {
      if (data.result.credit != null && data.result.debit != null) {
        this.itemMasterGrpFormGroup.patchValue({
          itemMasterGroupDebitAcc: data.result.debit.maAccNo,
          itemMasterGroupCreditAcc: data.result.credit.maAccNo,
        });
        this.debitCtrl.nativeElement.value = this.accountList?.find(
          (k) => k.value == data.result.debit.maAccNo
        )?.label;
        this.creditCtrl.nativeElement.value = this.accountList?.find(
          (k) => k.value == data.result.credit.maAccNo
        )?.label;
      }
      this.displayBasic = true;
    });
  }

  new() {
    this.itemMasterGrpFormGroup.reset();
    this.showBasicDialog();
  }

  saveGroup() {
    const itemData: ItemMaster = this.itemMasterGrpFormGroup
      .value as ItemMaster;
    // itemData.itemMasterItemId = null;
    itemData.itemMasterAccountNo =
      itemData.itemMasterAccountNo == null ? 0 : itemData.itemMasterAccountNo;
    itemData.itemMasterItemType = ItemMasterStatus.Group;
    this.masterapi.InsertItem(itemData).subscribe((data) => {
      this.files = [
        {
          label: 'Item Master',
          key: 'Item Master',
          data: null,
          expandedIcon: 'pi pi-folder-open',
          expanded: true,
          collapsedIcon: 'pi pi-folder',
          children: data.result.map((k) => {
            return {
              label: k.itemMasterItemName,
              key: k.itemMasterItemId.toString(),
              data: k,
              expandedIcon: 'pi pi-folder-open',
              collapsedIcon: 'pi pi-folder',
              children: [],
              leaf: false,
            };
          }),
          leaf: false,
        },
      ];
      setTimeout(() => {
        this.selectedFile.data = data.result?.find(
          (k) => k.itemMasterItemId === this.selectedFile.data.itemMasterItemId
        );
      }, 0);
      this.messageService.add({
        severity: 'success',
        summary: 'Alert',
        detail: 'Item Group is added',
      });
    });

    //   const firstNode = tree.treeModel.getFirstRoot();
    // if(firstNode != undefined) {
    // firstNode.expand();
  }

  delete() {
    const itemData: ItemMaster = this.selectedFile.data as ItemMaster;

    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Delete Item?'),
      accept: () => {
        this.masterapi.DeleteItem(itemData).subscribe((data) => {
          this.files = [
            {
              label: 'Item Master',
              key: 'Item Master',
              data: null,
              expandedIcon: 'pi pi-folder-open',
              expanded: true,
              collapsedIcon: 'pi pi-folder',
              children: data.result.map((k) => {
                return {
                  label: k.itemMasterItemName,
                  key: k.itemMasterItemId.toString(),
                  data: k,
                  expandedIcon: 'pi pi-folder-open',
                  collapsedIcon: 'pi pi-folder',
                  children: [],
                  leaf: false,
                };
              }),
              leaf: false,
            },
          ];
          this.messageService.add({
            severity: 'success',
            summary: 'Alert',
            detail: data.message,
          });
        });
      },
    });

    //   const firstNode = tree.treeModel.getFirstRoot();
    // if(firstNode != undefined) {
    // firstNode.expand();
  }
  SearchFilter(tag: ItemFilter) {
    this.itemData = null;
    this.masterapi.GetAllItemSearchFilter(tag).subscribe((data) => {
      if (data.result.length > 0) {
        this.itemData = data.result[0];
        this.router.navigate(
          ['/master/item/edit', this.itemData.itemMasterItemId],
          { queryParams: { menu: 11 } }
        );
      } else {
        this.itemData = null;
      }
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
