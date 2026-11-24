import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { WorkGroupMaster } from 'src/app/routes/domain/Masters/WorkGroupMaster';
import { PermissionSetting } from 'src/app/routes/domain/Settings/permissionSetting';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import { LocalStorageService } from 'src/app/shared/service/storage.service';

@Component({
  selector: 'app-permission-setting',
  templateUrl: './permission-setting.component.html',
  styleUrls: ['./permission-setting.component.scss'],
})
export class PermissionSettingComponent implements OnInit {
  title: string;
  subtitle: string;
  files: TreeNode[];
  licensekey: any;
  gridHeader: string;
  dataset: any = [];
  selectedFile: TreeNode;
  workGroupList: WorkGroupMaster[] = [];
  hotid = 'permission';
  private hotRegisterer = new HotTableRegisterer();
  permission: Handsontable.GridSettings;
  permissionSetting: PermissionSetting[] = [];
  cols: any[];
  btnFlag: ButtonFlag = { edit: true, cancel: false, update: false };

  confirmDropDatabaseDialogVisible: false;

  initializeControls() {
    this.permission = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [90, 30, 30, 30, 30, 30],
      minRows: 0,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 0,
      allowInsertRow: true,

      stretchH: 'all',
      manualRowResize: true,
      hiddenColumns: {
        columns: [7, 8, 9],
        indicators: false,
      },
      manualColumnResize: true,
      columns: [
        {
          data: 'workGroupPermissionsMenuName',
          type: 'text',
        },

        {
          data: 'workGroupPermissionsUallow',
          type: 'checkbox',
        },
        {
          data: 'workGroupPermissionsUadd',
          type: 'checkbox',
        },
        {
          data: 'workGroupPermissionsUedit',
          type: 'checkbox',
        },
        {
          data: 'workGroupPermissionsUdelete',
          type: 'checkbox',
        },
        {
          data: 'workGroupPermissionsUview',
          type: 'checkbox',
        },
        {
          data: 'workGroupPermissionsUprint',
          type: 'checkbox',
        },
        {
          data: 'workGroupPermissionsMenuId',
          type: 'text',
        },
        {
          data: 'workGroupPermissionsWorkGroupId',
          type: 'text',
        },
        {
          data: 'workGroupPermissionsSno',
          type: 'text',
        },


      ],
      colHeaders: [
        this.translate.instant('Description'),
        this.translate.instant('Allow'),
        this.translate.instant('Add'),
        this.translate.instant('Edit'),
        this.translate.instant('Delete'),
        this.translate.instant('View'),
        this.translate.instant('Print'),
      ],
      manualRowMove: false,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };

    this.permission.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      const instance = this.hotRegisterer.getInstance(this.hotid);
      const selectedData = instance.getDataAtRow(row);
    };

    this.permission.beforeChangeRender = (change, source) => {
      // console.log(change)
      const instance = this.hotRegisterer.getInstance(this.hotid);
      const rowData = instance.getDataAtRow(change[0][0]);
    };
  }
  allowAll = false;
  addAll = false;
  editAll = false;
  deleteAll = false;
  viewAll = false;
  printAll = false;
  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private api: MasterApiService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private _local: LocalStorageService,
    private _permission: PermissionsService
  ) { }

  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.subtitle;
    });
    this.initializeControls();
    this.getWorkGroupList(), (this.licensekey = defaults.hotlicensekey);
  }

  edit() {
    this.btnFlag = { cancel: true, update: true };
  }

  public getWorkGroupList() {
    this.api.GetAllWorkGroup().subscribe((data) => {
      this.workGroupList = data;
      this.files = [
        {
          label: 'Work Group',
          key: 'Work Group',
          data: null,
          expandedIcon: 'pi pi-folder-open',
          expanded: true,
          collapsedIcon: 'pi pi-folder',
          children: data.map((k) => {
            return {
              label: k.workGroupMasterWorkGroupName,
              key: k.workGroupMasterWorkGroupId.toString(),
              data: k,
              expandedIcon: 'pi pi-folder-open',
              collapsedIcon: 'pi pi-folder',
              expanded: false,
              children: [],
              leaf: false,
            };
          }),
          leaf: false,
        },
      ];
    });
  }
  // updatePermission() {
  //
  //   const instance = this.hotRegisterer.getInstance(this.hotid);
  //   const savedData: any[] = instance.getData();
  //   console.log('All data:', savedData);

  // }

  onSelectionChange(event, type) {
    if (this.dataset.length > 0) {
      this.dataset.forEach(item => item[type] = event.checked);
      this.dataset = [...this.dataset]
    }
  }
  updatePermission() {
    const instance = this.hotRegisterer.getInstance(this.hotid);
    const data = instance.getData();
    const columnNames = [
      'workGroupPermissionsFormName',
      'workGroupPermissionsUallow',
      'workGroupPermissionsUadd',
      'workGroupPermissionsUedit',
      'workGroupPermissionsUdelete',
      'workGroupPermissionsUview',
      'workGroupPermissionsUprint',
      'workGroupPermissionsMenuId',
      'workGroupPermissionsWorkGroupId',
      'workGroupPermissionsSno'
    ];

    const savedData = data.reduce((accumulator, row) => {
      if (row[0] !== null) {
        // Assuming 'workGroupPermissionsFormName' is at index 0
        const rowData = {};
        row.forEach((cellData, index) => {
          console.log('index', cellData);
          const columnName = columnNames[index];
          rowData[columnName] = cellData;
        });
        console.log('rowData:', rowData);

        accumulator.push(rowData);
      }
      return accumulator;
    }, []);

    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Save Setting?'),
      accept: () => {
        this.api.updatePermissionSetting(savedData).subscribe((data) => {
          (this.permissionSetting = data.result), (this.dataset = data.result);

          const encryptedData = this._permission.encryptData(data.result);
          this._local.remove('List');
          this._local.set('List', encryptedData);
          if (data.valid) {
            this.messageService.add({
              severity: 'success', summary: 'Alert',
              detail: data.message
            });
          } else if (data.error) {
            this.messageService.add({
              severity: 'error', summary: 'Alert',
              detail: (data.message != null && data.message?.trim() !== '' ? data.message : data.exception)
            });
          }
        }, (err) => {
          this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Something went wrong' });
        });

      },
    });
  }

  updateList(event: boolean, value: string) {
    const instance = this.hotRegisterer.getInstance(this.hotid);
    const data = instance.getData();
    let columnIndex: number | null = null;

    switch (value) {
      case 'allow':
        columnIndex = 1;
        break;
      case 'add':
        columnIndex = 2;
        break;
      case 'edit':
        columnIndex = 3;
        break;
      case 'delete':
        columnIndex = 4;
        break;
      case 'print':
        columnIndex = 6;
        break;
      case 'view':
        columnIndex = 5;
        break;
      default:
        break;
    }

    if (columnIndex !== null) {
      data.forEach((row) => {
        for (let i = 1; i <= 6; i++) {
          if (i === columnIndex) {
            row[`workGroupPermissionsU${value}`] = true;
          } else {
            row[`workGroupPermissionsU${i}`] = false;
          }
        }
      });
    }

    instance.loadData(data);
    console.log('column change', instance.loadData(data));
  }

  getItemData($event) {
    var key: number = $event.node.key;
    this.api.PermissionSetting(key).subscribe((res) => {
      (this.permissionSetting = res.result), (this.dataset = res.result);
      this.allowAll = false;
      this.addAll = false;
      this.editAll = false;
      this.deleteAll = false;
      this.viewAll = false;
      this.printAll = false;
    });

    // const groupmasterData = this.selectedFile.data as WorkGroupMaster;
    // console.log('getItemData', groupmasterData);
    // this.groupmaster = groupmasterData;
  }
}
interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
}
