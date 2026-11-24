
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  ConfirmationService,
  MenuItem,
  MessageService,
  TreeNode,
} from 'primeng';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

@Component({
  selector: 'app-asset-management',
  templateUrl: './asset-management.component.html',
  styleUrls: ['./asset-management.component.scss'],
})
export class AssetManagementComponent implements OnInit {
  pagetype: any = 'Add';

  title: string;
  subtitle: string;
  asset!: TreeNode[];
  index: number = 0;
  assetForm: FormGroup;
  assetGroupForm: FormGroup;
  assetForm1: FormGroup;
  assetMaster: any;
  items: MenuItem[];
  displayaddedit: boolean = false;
  accountGroupSub: any;
  isAddEditGroup: any;
  save: boolean = false;
  handleChange(e) {
    this.index = e.index;
  }
  selectedFile: TreeNode;
  state: {
    Dir: string;
    Field: any;
    Skip: any;
    Take: any;
    Search: any;
    Filter: any;
  };
  search: any;
  filter: any;

  accountData: any;
  G: boolean = false;
  // S: boolean = false;
  A: boolean = true;
  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private confirmation: ConfirmationService,
    private messageService: MessageService,
    private masterapi: MasterApiService,
  ) { }

  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.subtitle;
    });

    this.assetForm = new FormGroup({
      path: new FormControl(''),
      groupname: new FormControl(''),
      code: new FormControl(''),
      assetname: new FormControl(''),
      itemMasterAccountNo: new FormControl(''),
      dateCreated: new FormControl(new Date()),
      // assetType: new FormControl(''),
    });

    this.assetGroupForm = new FormGroup({
      assetId: new FormControl(''),
      parentGroupName: new FormControl(''),
      groupName: new FormControl(''),
      assetGroupId: new FormControl(''),
      parentRelativeNo: new FormControl(''),
      accountType: new FormControl(''),
      dateCreated: new FormControl(new Date()),
    });

    this.assetForm1 = new FormGroup({
      path: new FormControl(''),
      groupname: new FormControl(''),
      code: new FormControl(''),
      assetId: new FormControl(''),
      assetname: new FormControl(''),
      itemMasterAccountNo: new FormControl(''),
      dateCreated: new FormControl(new Date()),
      accountType: new FormControl(''),
    });

    this.items = [
      {
        label: 'New Asset Group',
        icon: 'pi pi-align-left',

        command: (event) => {
          this.displayaddedit = true;
          this.isAddEditGroup = true;
          this.pagetype = 'Add';
          let data: any =
            this.selectedFile.data != null
              ? (this.selectedFile.data as any)
              : { assetMasterAssetAccountNo: null };
          this.assetForm.controls.code.setValue(data.assetMasterAssetAccountNo);
          this.assetGroupForm.patchValue({
            parentGroupName:
              this.selectedFile?.label == 'Asset Master'
                ? 'Asset Master'
                : data?.assetMasterAssetName,
            assetGroupId:
              this.selectedFile?.label == 'Asset Master'
                ? '0'
                : data.assetMasterAssetId,
            dateCreated: new Date(),
          });
        },
      },
      {
        label: 'Edit Asset Group',
        icon: 'pi pi-user-edit',
        command: (event) => {
          this.isAddEditGroup = true;
          this.pagetype = 'Edit';
          this.displayaddedit = true;
          this.assetGroupForm.patchValue({
            parentGroupName: this.selectedFile.parent.label,
            // assetGroupId:
            //   this.selectedFile?.label == 'Asset Master'
            //     ? '0'
            //     : this.selectedFile.data.assetMasterAssetId,
            assetId: this.selectedFile.data.assetMasterAssetId,
            code: this.selectedFile.data.assetMasterAssetAccountNo,
            groupName: this.selectedFile.data.assetMasterAssetName,
            dateCreated: this.selectedFile.data.assetMasterAssetCreatedDate ? new Date(this.selectedFile.data.assetMasterAssetCreatedDate) : null,
          });
        },
        disabled: false,
      },
      {
        label: 'New Asset',
        icon: 'pi pi-plus',
        command: (event) => {
          this.assetForm1.reset();
          this.isAddEditGroup = false;
          this.pagetype = 'Add';
          this.displayaddedit = true;
          this.assetForm1.patchValue({
            groupname:
              this.selectedFile?.label == 'Asset Master'
                ? 'Asset Master'
                : this.selectedFile.data.assetMasterAssetName,
            itemMasterAccountNo:
              this.selectedFile?.label == 'Asset Master'
                ? '1'
                : this.selectedFile.data.assetMasterAssetId,
            dateCreated: new Date(),
          });
        },
        disabled: false,
      },
      {
        label: 'Edit Asset',
        icon: 'pi pi-user-edit',
        command: (event) => {
          this.assetForm1.reset();
          this.isAddEditGroup = false;
          this.pagetype = 'Edit';
          this.displayaddedit = true;

          this.assetForm1.patchValue({
            groupname: this.selectedFile.parent.label,
            code: this.selectedFile.data.assetMasterAssetAccountNo,
            assetId: this.selectedFile.data.assetMasterAssetId,
            assetname: this.selectedFile.data.assetMasterAssetName,
            // itemMasterAccountNo: this.selectedFile.data.maRelativeNo,
            dateCreated: this.selectedFile.data.assetMasterAssetCreatedDate ? new Date(this.selectedFile.data.assetMasterAssetCreatedDate) : null,
          });
        },
        disabled: false,
      },
    ];
    this.getAssetMaster(0);
  }

  GetRelativeAccountAssetMaster(id) {
    this.masterapi.GetRelativeAccountAssetMaster(id).subscribe((res: any) => {
      return res.result;
    });
  }

  getAssetMaster(relativeNo) {
    this.masterapi.GetFixedAssets(relativeNo).subscribe((data: any) => {
      this.asset = [
        {
          label: 'Asset Master',
          key: 'Asset Master',
          data: null,
          expandedIcon: 'pi pi-folder-open',
          expanded: true,
          collapsedIcon: 'pi pi-folder',
          children: data.result.map((k) => {
            return {
              label: k.assetMasterAssetName,
              key: k.assetMasterAssetId,
              data: k,
              expandedIcon: 'pi pi-folder-open',
              collapsedIcon: 'pi pi-folder',
              children: [],
              leaf: false,
              path: `Asset Master > ${k.assetMasterAssetName}`,
            };
          }),
          leaf: false,
        },
      ];
    });
  }

  getItemData($event) {
    const itemmasterData = this.selectedFile.data as any;
    this.accountData = itemmasterData;
    this.assetForm.patchValue({
      groupname: this.selectedFile.parent.label,
      code: this.accountData.assetMasterAssetAccountNo,
      assetname: this.accountData.assetMasterAssetName,
      itemMasterAccountNo: this.accountData.assetMasterAssetRelativeNo,
      dateCreated: this.accountData.assetMasterAssetCreatedDate,
      path: this.selectedFile,
      // assetType: this.accountData.maAccType,
    });
    this.G =
      this.accountData.assetMasterAssetType?.trim() == 'G'
        ? true
        : this.accountData.assetMasterAssetType?.trim() == 'S'
          ? true
          : false;
    this.A = this.accountData.assetMasterAssetType?.trim() == 'A' ? true : false;
  }

  onRightClick($event: any, cm: any) {

    const selectedNode = $event.node.data;
    cm.model.forEach((item, index) => {
      if ($event.node.label == 'Asset Master' && selectedNode == null) {
        switch (index) {
          case 0:
            item.disabled = false;
            break;
          case 1:
          case 2:

          case 3:
            item.disabled = true;
            break;
          default:
            break;
        }
      } else {
        if (selectedNode?.assetMasterAssetType?.trim() === 'G') {
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
      }
    });
  }

  saveItem(assetType: any) {
    if (this.isAddEditGroup) {
      if (this.pagetype == 'Add') {
        var reqG = {
          parentGroupName:
            this.assetGroupForm.controls['parentGroupName'].value,
          assetGroupId: Number(
            this.assetGroupForm.controls['assetGroupId'].value,
          ),
          groupName: this.assetGroupForm.controls['groupName'].value,
          // parentRelativeNo: this.assetGroupForm.controls['parentRelativeNo'].value,
          accountType: 'G',
          createdDate: this.assetGroupForm.controls['dateCreated'].value,
        };
      } else {
        var reqG1 = {
          assetId: Number(this.assetGroupForm.controls['assetId'].value),
          groupName: this.assetGroupForm.controls['groupName'].value,
        };
      }

      this.confirmation.confirm({
        key: 'confirm-key',

        message:
          this.pagetype == 'Add'
            ? this.translate.instant('Do you want to save Asset Group?')
            : this.translate.instant('Do you want to Update Asset Group?'),
        accept: () => {
          if (this.pagetype == 'Add') {
            this.masterapi.SaveNewAssetGroup(reqG).subscribe((res: any) => {
              if (res.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Asset Group Saved',
                });
                this.getAssetMaster(0);
                this.assetGroupForm.reset();
              }
            });
          } else {
            this.masterapi.EditAssetGroup(reqG1).subscribe((res: any) => {
              if (res.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Asset Group Updated',
                });
                this.getAssetMaster(0);
                this.assetGroupForm.reset();
              }
            });
          }
        },
      });
      this.displayaddedit = false;
    } else {
      if (this.pagetype == 'Add') {
        var req = {
          headName: this.assetForm1.controls['assetname'].value,
          assetGroupId: Number(
            this.assetForm1.controls['itemMasterAccountNo'].value,
          ),
          createdDate: new Date(),
        };
      } else {
        var req1 = {
          assetId: Number(this.assetForm1.controls['assetId'].value),
          groupName: this.assetForm1.controls['assetname'].value,
        };
      }
      this.confirmation.confirm({
        key: 'confirm-key',

        message:
          this.pagetype == 'Add'
            ? this.translate.instant('Do you want to save Asset?')
            : this.translate.instant('Do you want to Update Asset?'),
        accept: () => {
          if (this.pagetype == 'Add') {
            this.masterapi.SaveNewAssetHead(req).subscribe((res: any) => {
              if (res.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Asset Head Saved',
                });
                this.getAssetMaster(0);
                this.assetForm1.reset();
              }
            });
          } else {
            this.masterapi.EditAssetHead(req1).subscribe((res: any) => {
              if (res.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Asset Head Updated',
                });
                this.getAssetMaster(0);
                this.assetForm1.reset();
              }
            });
          }
        },
      });
      this.displayaddedit = false;
    }
  }

  delete() {
    // this.confirmation.confirm({
    //   key: 'confirm-key',
    //   message: this.translate.instant('Do you want to delete this record?'),
    //   accept: () => {
    //     this.masterapi.dele(this.accountData).subscribe((res: any) => {
    //       if (res.valid) {
    //         this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Deleted Successfully' });
    //         this.getAssetMaster(0);
    //         this.assetForm.reset()
    //       }
    //   }
    // });
  }

  loadNode(event) {
    if (event.node) {
      this.masterapi
        .GetFixedAssets(event.node.data.assetMasterAssetId)
        .subscribe((data: any) => {
          event.node.children = [];
          for (const item of data.result) {
            event.node.children.push({
              label: item.assetMasterAssetName,
              key: item.assetMasterAssetAccountNo.toString(),
              data: item,
              icon:
                item.assetMasterAssetType.trim() === 'G'
                  ? 'pi pi-folder'
                  : 'fa fa-file-o',
              leaf: item.assetMasterAssetType.trim() === 'G' ? false : true,
              // path: `Asset Master > ${item.assetMasterAssetName}`
            });
          }
        });
    }
  }

  viewFile(file: TreeNode) {
    this.messageService.add({
      severity: 'info',
      summary: 'Node Details',
      detail: file.label,
    });
  }

  unselectFile() {
    this.selectedFile = null;
  }

  get f() {
    return this.assetForm.controls;
  }
}