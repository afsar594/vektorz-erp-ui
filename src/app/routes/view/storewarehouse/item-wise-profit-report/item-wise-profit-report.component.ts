import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api/menuitem';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HotTableRegisterer } from '@handsontable/angular';
import { defaults } from 'src/app/shared/service/settings';
import Handsontable from 'handsontable';
import * as XLSX from 'xlsx';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, SelectItem } from 'primeng/api';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { DatePipe } from '@angular/common';
import { ItemMaster } from 'src/app/routes/domain';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { StorewarehousesApiService } from 'src/app/routes/service/storewarehouse.api.services';
@Component({
  selector: 'app-item-wise-profit-report',
  templateUrl: './item-wise-profit-report.component.html',
  styleUrls: ['./item-wise-profit-report.component.scss'],
})
export class ItemWiseProfitReportComponent implements OnInit {
  clear() {
    throw new Error('Method not implemented.');
  }
  title: string;
  subtitle: string;
  ScreenId: number;
  Permission: any;
  dateFrom: string | Date = null;
  dateTo: string | Date = null;
  type: string = 'Details';
  enableDate: boolean;
  pdfSource: string;

  customerArray: CustomerMaster[] = [];
  customerArry: string[] = [];
  customerList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[];
  locationArry: string[] = [];

  ItemMasterGroupArray: ItemMaster[] = [];
  ItemMasterGroupArry: string[] = [];
  ItemMasterGroupList: SelectItem[];

  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  MainItemMasterList: any[];
  ItemMasterArray: ItemMaster[] = [];
  customer: any;
  rptItem: any;
  itemGroup: any;

  constructor(
    private activatedroute: ActivatedRoute,
    private permission: PermissionsService,
    private crystalReportService: CrystalReportService,
    private formatDateService: ReportDateFormatService,
    private datePipe: DatePipe,
    private StorewarehousesApiService: StorewarehousesApiService,

    private accountapi: AccountApiService
  ) {}

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
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.subtitle;
    });
    this.StorewarehousesApiService.StockLedger_LoadDropdown().subscribe((m) => {
      // itemgroup
      this.ItemMasterGroupArray = m.resultSet.itemMasterGroup;
      this.ItemMasterGroupList = m.resultSet.itemMasterGroup.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterGroupList.unshift({
        label: '--Select Item Group--',
        value: -1,
      });
      // item
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl.itemMasterItemId,
        partNo: kl.itemMasterPartNo,
        //stock: kl.itemMasterStockType,
        //barcode: kl.itemMasterBarcode,
        AccNo: kl.itemMasterAccountNo,
      }));
      this.MainItemMasterList = this.ItemMasterList;

      // location
      this.locationArray = m.resultSet.locationMaster;
      this.locationList = m.resultSet.locationMaster
        ?.filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select--', value: -1 });
    });

    this.accountapi.LoadCustomerDropdown().subscribe((m) => {
      this.customerArray = m.resultSet.customerMasters;

      this.customerList = m.resultSet.customerMasters?.map((kl) => ({
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

  toggleDate() {
    this.enableDate = !this.enableDate;
    if (!this.enableDate) {
      this.dateFrom = null;
      this.dateTo = null;
    } else {
      this.dateFrom = new Date();
      this.dateTo = new Date();
    }
  }

  rptFilter: ReportFilterModel;
  showPrint() {
    let isDate = this.enableDate;

    // let supplier = this.supplier;

    let fromDateControl = this.formatDateService.mmddyyyy(this.dateFrom);
    let toDateControl = this.formatDateService.mmddyyyy(this.dateTo);
    const fromDate = this.datePipe.transform(fromDateControl, 'dd/MM/yyyy');
    const toDate = this.datePipe.transform(toDateControl, 'dd/MM/yyyy');
    let query = 'SELECT * FROM vw_purchase WHERE 1 = 1';

    if (this.customer) {
      query += ` AND customer = ${this.customer}`;
    }
    if (isDate && fromDateControl && toDateControl) {
      query += ` AND date BETWEEN '${fromDateControl} ' AND '${toDateControl} '`;
    }
    this.rptFilter = {
      ReportName: 'SuppliersalesDetailsMaterialWise',
      SelectionFormula: '',
      Parameters: [
        {
          Key: 'Period',
          Value: isDate ? `for the period from  ${fromDate} to ${toDate}` : '',
        },
      ],
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
}
