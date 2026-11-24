import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import {
  MenuItem,
  TreeNode,
  MessageService,
  SelectItem,
  ConfirmationService,
} from 'primeng/api';
import { ChartofAccounts } from 'src/app/routes/domain';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { AccountMasterStatus } from 'src/app/routes/Enums/ChartofAccount';
import { DialogService, DynamicDialogRef } from 'primeng';
import { EntryComponent } from '../entry/entry.component';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, OnDestroy {
  @ViewChild('treeContainer') treeContainer: ElementRef;
  accountData: ChartofAccounts;
  displayBasic: boolean;
  title: string;
  G: boolean = false;
  // S: boolean = false;
  A: boolean = true;
  items: any[] = [
    {
      label: 'New  Account Group',
      icon: 'pi pi-align-left',
      command: (event) => {
        this.AccountMasterGrpFormGroup.reset();

        let data: ChartofAccounts =
          this.selectedFile.data != null
            ? (this.selectedFile.data as ChartofAccounts)
            : { maAccNo: null };
        this.AccountMasterGrpFormGroup.controls.itemMasterAccountNo.setValue(
          data.maAccNo
        );
        this.AccountMasterGrpFormGroup.controls.itemMasterAccountName.setValue(
          data.maAccName
        );
        this.gChange = false;
        this.showBasicDialog('add');
      },

      disabled: false,
    },
    {
      label: 'Edit Account Group',
      icon: 'pi pi-user-edit',
      command: (event) => {
        this.AccountMasterGrpFormGroup.reset();

        this.AccountMasterGrpFormGroup.patchValue({
          maAccNo: this.selectedFile.data.maAccNo,
          maAccName: this.selectedFile.data.maAccName,
          itemMasterAccountNo: this.selectedFile.data.maRelativeNo,
          maManualCode: this.selectedFile.data.maManualCode,
          itemMasterAccountName:
            this.selectedFile.data.maRelativeNo == '0'
              ? 'Account Master'
              : this.accountList?.find(
                (i) => i.value == this.selectedFile.data.maRelativeNo
              )?.label,
        });
        this.gChange = false;
        this.showBasicDialog('edit');
      },
      disabled: false,
    },

    {
      label: 'New Account',
      icon: 'pi pi-plus',
      command: (event) => {
        this.ref = this.dialogService.open(EntryComponent, {
          data: {
            button: false,
            pageType: 'add',
            maAccNo: this.selectedFile.data.maAccNo,
            allGroup: this.allGroups,
            itemMasterAccountName:
              this.selectedFile.data.maRelativeNo == '0'
                ? 'Account Master'
                : this.accountList?.find(
                  (i) => i.value == this.selectedFile.data.maRelativeNo
                )?.label,
          },
          header: 'New Account',
          width: '50%',
          baseZIndex: 1,
        });
        this.ref.onClose.subscribe((item: any) => {
          if (item) {
            this.getAllAccounts();
            this.getAllAccount();
          }
        });
      },

      disabled: false,
    },

    {
      label: 'Edit Account',
      icon: 'pi pi-user-edit',
      command: (event) => {
        this.selectedFile.data;
        this.ref = this.dialogService.open(EntryComponent, {
          data: {
            button: false,
            pageType: 'edit',
            maAccNo: this.selectedFile.data.maAccNo,
            itemMasterAccountNo: this.selectedFile.data.maRelativeNo,
            itemMasterAccountName:
              this.selectedFile.data.maRelativeNo == '0'
                ? 'Account Master'
                : this.accountList?.find(
                  (i) => i.value == this.selectedFile.data.maRelativeNo
                )?.label,

            allGroup: this.allGroups,
          },
          header: 'Edit Account',
          width: '50%',
          baseZIndex: 1,
        });
        this.ref.onClose.subscribe((item: any) => {
          if (item) {
            this.getAllAccounts();
            this.getAllAccount();
          }
        });
      },
      disabled: false,
    },
    {
      label: 'Change Parent Group',
      icon: 'pi pi-user-edit',
      command: (event) => {
        this.AccountMasterGrpFormGroup.patchValue({
          maAccNo: this.selectedFile.data.maAccNo,
          maAccName: this.selectedFile.data.maAccName,
          itemMasterAccountNo: this.selectedFile.data.maRelativeNo,
          itemMasterAccountName:
            this.selectedFile.data.maRelativeNo == '0'
              ? 'Account Master'
              : this.accountList?.find(
                (i) => i.value == this.selectedFile.data.maRelativeNo
              )?.label,
        });
        this.gChange = true;
        this.showBasicDialog('edit');
      },
      disabled: false,
      visible: () =>
        this.selectedFile.data.maAccType == 'G' &&
        this.selectedFile.data.maAccType == 'S',
    },
    {
      label: 'Change Account Group',
      icon: 'pi pi-user-edit',
      command: (event) => {
        this.ref = this.dialogService.open(EntryComponent, {
          data: {
            button: false,
            pageType: 'edit',
            maAccNo: this.selectedFile.data.maAccNo,
            itemMasterAccountNo: this.selectedFile.data.maRelativeNo,
            itemMasterAccountName:
              this.selectedFile.data.maRelativeNo == '0'
                ? 'Account Master'
                : this.accountList?.find(
                  (i) => i.value == this.selectedFile.data.maRelativeNo
                )?.label,

            allGroup: this.allGroups,
            changeG: true,
          },
          header: 'Change Account Group',
          width: '50%',
          baseZIndex: 1,
        });
        this.ref.onClose.subscribe((item: any) => {
          if (item) {
            this.getAllGroups();
            this.getAllAccount();
          }
        });
      },
      visible: () =>
        this.selectedFile.data.maAccType !== 'G' &&
        this.selectedFile.data.maAccType !== 'S',

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
  AccountMasterGrpFormGroup: FormGroup;
  AccountMasterGrpForm: FormGroup;
  accountGroupSub: SelectItem[] = [];
  ParentAccountList: any[] = [];
  AllAccountList: any[] = [];
  MainAllAccountList: any[] = [];
  allGroups: any;
  gChange: boolean = false;
  ref: DynamicDialogRef | undefined;
  showControlLookUp: boolean = false;
  elementReference: ElementRef;
  control: AbstractControl;
  selectItem: any;
  dataList: any;
  lookupColumns: any;
  private searchSubject = new Subject<string>();

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private confirmation: ConfirmationService,
    private accountapi: AccountApiService,
    private masterapi: MasterApiService,
    public dialogService: DialogService
  ) { }
  files: TreeNode[];
  selectedFile: TreeNode;
  findItem: string;
  findGroup: string;

  treeSearchTerm = '';
  isTreeSearchActive = false;
  matchedNodes: TreeNode[] = [];
  activeMatchIndex = -1;
  matchedLabelParts = new Map<TreeNode, TreeLabelPart[]>();
  private preSearchExpandedKeys: Set<string> | null = null;
  private isFullTreeLoaded = false;
  private scrollTimer: any;

  ngOnInit(): void {
    this.AccountMasterGrpFormGroup = this.fb.group({
      maAccNo: [null],
      maAccName: [null],
      itemMasterAccountNo: [null],
      itemMasterAccountName: [null],
      maManualCode: [null],
    });

    this.getAllAccount();
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.getAllAccounts();
    this.getAllGroups();
  }

  ngOnDestroy(): void {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }
  }

  getAllAccounts() {
    this.masterapi.getAccountParentTreeNode().subscribe((data) => {
      this.ParentAccountList = data.result;
      if (this.isFullTreeLoaded && this.MainAllAccountList?.length) {
        return;
      }
      this.files = [
        {
          label: 'Account Master',
          key: 'Account Master',
          data: null,
          expandedIcon: 'fa fa-folder-open',
          expanded: true,
          collapsedIcon: 'fa fa-folder',
          styleClass: 'folder',
          children: data.result.map((k) => {
            return {
              label: k.maAccName,
              key: k.maAccNo,
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
      if ((this.treeSearchTerm || '').trim().length >= 2) {
        this.applyTreeSearch(this.treeSearchTerm);
      }
    });
  }

  getAllGroups() {
    this.masterapi.getAllGroup().subscribe((data) => {
      this.allGroups = data.result;
      this.accountGroupSub = data.result.map((k) => ({
        label: k.maAccName,
        value: k.maAccNo,
      }));
      this.accountGroupSub.unshift({ label: 'Account Master', value: null });
    });
  }

  onRightClick($event: any, cm: any) {
    const selectedNode = $event.node.data;
    cm.model.forEach((item, index) => {
      if (selectedNode.maAccType === 'G' || selectedNode.maAccType === 'S') {
        switch (index) {
          case 0:
          case 1:
          case 2:
            item.disabled = false;
            break;
          case 3:
            item.disabled = true;
            break;
          default:
            break;
        }
      } else {
        switch (index) {
          case 0:
          case 1:
          case 2:
            item.disabled = true;
            break;
          case 3:
            item.disabled = false;
            break;
          default:
            break;
        }
      }
      if (selectedNode.maAccType === 'G' || selectedNode.maAccType === 'S') {
        switch (index) {
          case 0:
          case 1:
          case 2:
          case 3:
          case 4:
            item.visible = true;
            break;
          case 5:
            item.visible = false;
          default:
            break;
        }
      } else {
        switch (index) {
          case 0:
          case 1:
          case 2:
          case 3:
            break;
          case 4:
            item.visible = false;
            break;
          case 5:
            item.visible = true;
          default:
            break;
        }
      }
    });
  }

  loadNode(event) {
    if (!event?.node?.data?.maAccNo) {
      return;
    }
    if (
      this.isFullTreeLoaded ||
      (event.node.children && event.node.children.length > 0)
    ) {
      return;
    }
    this.masterapi
      .getAccountChildrenByParentTreeNode(event.node.data.maAccNo)
      .subscribe((data) => {
        event.node.children = [];
        for (const item of data.result) {
          const isGroup = item.maAccType === AccountMasterStatus.SubGroup;
          event.node.children.push({
            label: item.maAccName,
            key: item.maAccNo,
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

  getItemData($event) {
    const itemmasterData = this.selectedFile?.data as ChartofAccounts;
    if (!itemmasterData) {
      return;
    }

    this.accountData = itemmasterData;
    this.G =
      this.accountData.maAccType == 'G'
        ? true
        : this.accountData.maAccType == 'S'
          ? true
          : false;
    this.A = this.accountData.maAccType == 'A' ? true : false;
  }

  findAccount() {
    if (this?.findGroup) {
      this.AllAccountList = this.MainAllAccountList?.filter(
        (a) => a.maAccName.includes(this?.findGroup) && a.maAccType != 'A'
      );
      if (this?.findItem) {
        this.AllAccountList = this.AllAccountList?.filter(
          (a) => a.maAccName.includes(this?.findItem) && a.maAccType == 'A'
        );
        //  this.files = this.AllAccountList;
      } else {
        this.AllAccountList = this.AllAccountList;
        // this.files = this.AllAccountList;
      }
    } else if (this?.findItem) {
      this.AllAccountList = this.MainAllAccountList?.filter(
        (a) => a.maAccName.includes(this?.findItem) && a.maAccType == 'A'
      );
      //  this.files = this.AllAccountList;
    } else {
      // this.files = this.ParentAccountList;
    }
  }

  getAllAccount() {
    this.accountapi.GetAllAcounts().subscribe((k) => {
      this.accountArray = k.result;
      this.MainAllAccountList = k.result;
      this.accountList = k.result.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select--', value: -1 });

      this.isFullTreeLoaded = true;
      this.buildFullTree(k.result);
    });
  }

  showBasicDialog(type) {
    if (type == 'add') {
      this.btnFlag = { save: true };
    } else {
      this.btnFlag = { save: false };
    }
    this.displayBasic = true;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  get itemLookup() {
    return this.accountList.map((res) => ({
      account: res.label,
      accountId: res.value,
    }));
  }

  show() {
    this.GetAccountMastersByName(this.findItem);
    this.showControlLookUp = true;
  }

  GetAccountMastersByName(value: string) {
    // setTimeout(() => {
    this.masterapi.GetAccountMastersByName(value).subscribe((k) => {
      this.accountArray = k.result;
      this.accountList = k.result.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.dataList = this.itemLookup;

      this.accountList.unshift({ label: '--Select--', value: -1 });
    });
    // }, 3000);
  }
  onModelChange(term: string): void {

    this.GetAccountMastersByName(term);
  }
  exit(evt) {
    this.showControlLookUp = false;
  }

  clear(evt) {
    if (evt.elementRef != null) {
      (evt.elementRef as ElementRef).nativeElement.value = '';
      evt.formControl.setValue(null);
    }
    this.showControlLookUp = false;
  }


  selectedtItem(evt) {

    const selectedAccount = this.accountArray.find(
      (account) => account.maAccNo === evt.accountId
    );
    this.showControlLookUp = false;
    this.ref = this.dialogService.open(EntryComponent, {
      data: {
        button: false,
        pageType: 'edit',
        maAccNo: selectedAccount.maAccNo,
        itemMasterAccountNo: selectedAccount.maRelativeNo,
        itemMasterAccountName:
          selectedAccount.maRelativeNo == '0'
            ? 'Account Master'
            : this.accountList?.find(
              (i) => i.value == selectedAccount.maRelativeNo
            )?.label,

        allGroup: this.allGroups,
      },
      header: 'Edit Account',
      width: '50%',
      baseZIndex: 1,
    });
    this.ref.onClose.subscribe((item: any) => {
      if (item) {
        this.getAllAccounts();
        this.getAllAccount();
      }
    });
  }

  hide(evt: boolean) {
    this.showControlLookUp = false;
  }


  saveGroup() {
    const accountData: ChartofAccounts = this.AccountMasterGrpFormGroup
      .value as ChartofAccounts;
    accountData.maSno = this.selectedFile?.data?.maSno;
    accountData.maRelativeNo = this.AccountMasterGrpFormGroup.value
      .itemMasterAccountNo
      ? this.AccountMasterGrpFormGroup.value.itemMasterAccountNo
      : '0';
    accountData.maManualCode =
      this.AccountMasterGrpFormGroup.value.maManualCode ?? '';
    accountData.maAccNo = accountData.maAccNo ?? '';
    if (accountData.maRelativeNo == '0') {
      accountData.maAccType = 'G';
    } else {
      accountData.maAccType = AccountMasterStatus.SubGroup;
    }
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.btnFlag.save
        ? this.translate.instant('Do you want to save Account Group?')
        : this.translate.instant('Do you want to Update Account?'),
      accept: () => {
        this.masterapi.InsertAccount(accountData).subscribe((data) => {
          if (accountData != null) {
            this.getAllAccounts();
            this.getAllAccount();
            this.getAllGroups();
          }

          // Update selectedFile.data after successful insertion/update
          setTimeout(() => {
            if (this.selectedFile?.data) {
              const updated = data.result?.find(
                (k) => k.maAccNo === this.selectedFile.data.maAccNo
              );
              if (updated) {
                this.selectedFile.data = updated;
              }
            }
          }, 0);

          // Show success message
          this.messageService.add({
            severity: 'success',
            summary: 'Alert',
            detail: 'Item Group is added',
          });
        });
      },
      // Handle rejection or cancel if needed
    });
  }

  delete() {
    const accountData: ChartofAccounts = this.selectedFile
      .data as ChartofAccounts;

    this.masterapi.DeleteAccount(accountData).subscribe((data) => {
      this.getAllAccounts();
      this.getAllAccount();
      this.getAllGroups();
      this.messageService.add({
        severity: 'success',
        summary: 'Alert',
        detail: data.message,
      });
    });
  }

  onTreeSearchChange(term: string): void {
    const query = (term || '').trim();
    if (query.length < 2) {
      if (this.isTreeSearchActive || this.preSearchExpandedKeys) {
        this.clearTreeSearchState();
      }
      return;
    }
    this.applyTreeSearch(query);
  }

  clearTreeSearch(): void {
    this.treeSearchTerm = '';
    this.clearTreeSearchState();
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.treeSearchTerm) {
        event.preventDefault();
        this.clearTreeSearch();
      }
      return;
    }
    if (event.key === 'Enter' && this.isTreeSearchActive && this.matchedNodes.length > 0) {
      event.preventDefault();
      this.navigateMatch(event.shiftKey ? -1 : 1);
    }
  }

  navigateMatch(step: number): void {
    if (!this.matchedNodes.length) {
      return;
    }
    const count = this.matchedNodes.length;
    this.activeMatchIndex = (this.activeMatchIndex + step + count) % count;
    const activeNode = this.matchedNodes[this.activeMatchIndex];
    if (activeNode && this.files?.length) {
      this.expandAncestorsOfNode(activeNode, this.files);
    }
    this.updateActiveMatchStyle();
    this.scheduleScrollToActiveMatch();
  }

  private applyTreeSearch(rawTerm: string): void {
    const query = rawTerm.trim();
    if (query.length < 2 || !this.files?.length) {
      return;
    }

    if (!this.preSearchExpandedKeys) {
      this.preSearchExpandedKeys = new Set<string>();
      this.captureExpandedKeys(this.files, this.preSearchExpandedKeys);
    }

    this.matchedNodes = [];
    this.matchedLabelParts.clear();
    const lowerQuery = query.toLowerCase();

    for (const rootNode of this.files) {
      this.evaluateNodeForSearch(rootNode, lowerQuery);
    }

    this.isTreeSearchActive = true;
    this.activeMatchIndex = this.matchedNodes.length > 0 ? 0 : -1;
    this.updateActiveMatchStyle();
    if (this.activeMatchIndex >= 0) {
      this.scheduleScrollToActiveMatch();
    }
  }

  private evaluateNodeForSearch(node: TreeNode, lowerQuery: string): boolean {
    const isRoot = node.data == null;
    const label = node.label || '';
    const isSelfMatch = !isRoot && label.toLowerCase().includes(lowerQuery);

    if (isSelfMatch) {
      this.matchedNodes.push(node);
      this.matchedLabelParts.set(
        node,
        this.splitLabelForHighlight(label, lowerQuery)
      );
    }

    let hasMatchingDescendant = false;
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (this.evaluateNodeForSearch(child, lowerQuery)) {
          hasMatchingDescendant = true;
        }
      }
    }

    if (isRoot) {
      node.expanded = true;
    } else if (!node.leaf) {
      node.expanded = hasMatchingDescendant;
    }

    const baseClass = node.leaf ? 'file' : 'folder';
    if (isSelfMatch) {
      node.styleClass = `${baseClass} tree-search-match`;
    } else if (hasMatchingDescendant) {
      node.styleClass = `${baseClass} tree-search-ancestor`;
    } else {
      node.styleClass = baseClass;
    }

    return isSelfMatch || hasMatchingDescendant;
  }

  private clearTreeSearchState(): void {
    this.isTreeSearchActive = false;
    this.matchedNodes = [];
    this.activeMatchIndex = -1;
    this.matchedLabelParts.clear();

    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }

    if (this.files?.length) {
      this.resetNodesSearchStyle(this.files);
      if (this.preSearchExpandedKeys) {
        this.restoreExpandedKeys(this.files, this.preSearchExpandedKeys);
      }
    }
    this.preSearchExpandedKeys = null;
  }

  private resetNodesSearchStyle(nodes: TreeNode[]): void {
    for (const node of nodes) {
      node.styleClass = node.leaf ? 'file' : 'folder';
      if (node.children && node.children.length > 0) {
        this.resetNodesSearchStyle(node.children);
      }
    }
  }

  private updateActiveMatchStyle(): void {
    const activeNode =
      this.activeMatchIndex >= 0
        ? this.matchedNodes[this.activeMatchIndex]
        : null;
    for (const node of this.matchedNodes) {
      const baseClass = node.leaf ? 'file' : 'folder';
      node.styleClass =
        node === activeNode
          ? `${baseClass} tree-search-match tree-search-active-match`
          : `${baseClass} tree-search-match`;
    }
  }

  private scheduleScrollToActiveMatch(): void {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
    }
    this.scrollTimer = setTimeout(() => {
      this.scrollTimer = null;
      const container = this.treeContainer?.nativeElement as HTMLElement;
      if (!container) {
        return;
      }
      const matchEl = (container.querySelector('.tree-search-active-match > .ui-treenode-content') ||
        container.querySelector('.tree-search-match > .ui-treenode-content')) as HTMLElement;
      if (!matchEl) {
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const matchRect = matchEl.getBoundingClientRect();
      const stickyHeader = container.querySelector('.tree-search-sticky') as HTMLElement;
      const stickyHeight = stickyHeader ? stickyHeader.offsetHeight : 0;
      const visibleTop = containerRect.top + stickyHeight;
      const visibleBottom = containerRect.bottom;

      if (matchRect.top < visibleTop || matchRect.bottom > visibleBottom) {
        const offsetInsideContainer =
          matchRect.top - containerRect.top + container.scrollTop;
        const targetTop =
          offsetInsideContainer -
          stickyHeight -
          (container.clientHeight - stickyHeight) / 3;
        container.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth',
        });
      }
    }, 0);
  }

  private splitLabelForHighlight(
    label: string,
    lowerQuery: string
  ): TreeLabelPart[] {
    if (!label || !lowerQuery) {
      return [{ text: label || '', matched: false }];
    }
    const lowerLabel = label.toLowerCase();
    const queryLen = lowerQuery.length;
    const parts: TreeLabelPart[] = [];
    let startIndex = 0;
    let matchIndex = lowerLabel.indexOf(lowerQuery, startIndex);

    while (matchIndex !== -1) {
      if (matchIndex > startIndex) {
        parts.push({
          text: label.slice(startIndex, matchIndex),
          matched: false,
        });
      }
      parts.push({
        text: label.slice(matchIndex, matchIndex + queryLen),
        matched: true,
      });
      startIndex = matchIndex + queryLen;
      matchIndex = lowerLabel.indexOf(lowerQuery, startIndex);
    }

    if (startIndex < label.length) {
      parts.push({
        text: label.slice(startIndex),
        matched: false,
      });
    }

    return parts.length ? parts : [{ text: label, matched: false }];
  }

  private buildFullTree(accounts: ChartofAccounts[]): void {
    const activeAccounts = (accounts || []).filter(
      (item) =>
        !item.maDelStatus &&
        item.maAccNo != null &&
        item.maAccNo.trim() !== ''
    );

    const expandedKeys = new Set<string>(['Account Master']);
    if (this.preSearchExpandedKeys) {
      this.preSearchExpandedKeys.forEach((key) => expandedKeys.add(key));
    } else if (this.files?.length) {
      expandedKeys.clear();
      this.captureExpandedKeys(this.files, expandedKeys);
    }

    const selectedKey = this.selectedFile?.key;

    const childrenByParent = new Map<string, ChartofAccounts[]>();
    const topGroups: ChartofAccounts[] = [];

    for (const item of activeAccounts) {
      const accType = (item.maAccType || '').trim().toUpperCase();
      if (accType === AccountMasterStatus.Group) {
        topGroups.push(item);
      } else {
        const parentNo = (item.maRelativeNo || '').trim();
        if (!childrenByParent.has(parentNo)) {
          childrenByParent.set(parentNo, []);
        }
        childrenByParent.get(parentNo).push(item);
      }
    }

    const topNodes: TreeNode[] = topGroups.map((group) => {
      const groupAccNo = (group.maAccNo || '').trim();
      const visited = new Set<string>([groupAccNo]);
      return {
        label: group.maAccName,
        key: group.maAccNo,
        data: group,
        expandedIcon: 'fa fa-folder-open',
        collapsedIcon: 'fa fa-folder',
        styleClass: 'folder',
        expanded: expandedKeys.has(group.maAccNo),
        children: this.buildChildNodes(
          groupAccNo,
          childrenByParent,
          expandedKeys,
          visited
        ),
        leaf: false,
      };
    });

    this.files = [
      {
        label: 'Account Master',
        key: 'Account Master',
        data: null,
        expandedIcon: 'fa fa-folder-open',
        expanded: expandedKeys.has('Account Master'),
        collapsedIcon: 'fa fa-folder',
        styleClass: 'folder',
        children: topNodes,
        leaf: false,
      },
    ];

    if (selectedKey) {
      this.selectedFile =
        this.findNodeByKey(this.files, selectedKey) || this.selectedFile;
    }

    if ((this.treeSearchTerm || '').trim().length >= 2) {
      this.applyTreeSearch(this.treeSearchTerm);
    }
  }

  private buildChildNodes(
    parentAccNo: string,
    childrenByParent: Map<string, ChartofAccounts[]>,
    expandedKeys: Set<string>,
    visitedAccNos: Set<string>
  ): TreeNode[] {
    const children = childrenByParent.get(parentAccNo) || [];
    const nodes: TreeNode[] = [];

    for (const item of children) {
      const accNo = (item.maAccNo || '').trim();
      if (!accNo || visitedAccNos.has(accNo)) {
        continue;
      }

      const accType = (item.maAccType || '').trim().toUpperCase();
      const childRecords = childrenByParent.get(accNo);
      const isGroup =
        accType === AccountMasterStatus.SubGroup ||
        accType === AccountMasterStatus.Group ||
        (childRecords != null && childRecords.length > 0);

      visitedAccNos.add(accNo);
      const nestedChildren = isGroup
        ? this.buildChildNodes(
            accNo,
            childrenByParent,
            expandedKeys,
            visitedAccNos
          )
        : undefined;
      visitedAccNos.delete(accNo);

      nodes.push({
        label: item.maAccName,
        key: item.maAccNo,
        data: item,
        expandedIcon: isGroup ? 'fa fa-folder-open' : undefined,
        collapsedIcon: isGroup ? 'fa fa-folder' : undefined,
        icon: isGroup ? undefined : 'fa fa-file-o',
        styleClass: isGroup ? 'folder' : 'file',
        leaf: !isGroup,
        expanded: isGroup ? expandedKeys.has(item.maAccNo) : false,
        children: nestedChildren,
      });
    }

    return nodes;
  }

  private captureExpandedKeys(nodes: TreeNode[], target: Set<string>): void {
    for (const node of nodes) {
      if (node.expanded && node.key) {
        target.add(node.key);
      }
      if (node.children && node.children.length > 0) {
        this.captureExpandedKeys(node.children, target);
      }
    }
  }

  private restoreExpandedKeys(nodes: TreeNode[], keys: Set<string>): void {
    for (const node of nodes) {
      if (!node.leaf) {
        node.expanded = node.key ? keys.has(node.key) : false;
      }
      if (node.children && node.children.length > 0) {
        this.restoreExpandedKeys(node.children, keys);
      }
    }
  }

  private findNodeByKey(nodes: TreeNode[], key: string): TreeNode | null {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = this.findNodeByKey(node.children, key);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  private expandAncestorsOfNode(target: TreeNode, nodes: TreeNode[]): boolean {
    for (const node of nodes) {
      if (node === target) {
        return true;
      }
      if (node.children && node.children.length > 0) {
        if (this.expandAncestorsOfNode(target, node.children)) {
          node.expanded = true;
          return true;
        }
      }
    }
    return false;
  }
}
interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
interface TreeLabelPart {
  text: string;
  matched: boolean;
}
