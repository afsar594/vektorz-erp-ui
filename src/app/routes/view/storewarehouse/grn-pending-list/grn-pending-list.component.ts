import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng';
import { SupplierMaster } from 'src/app/routes/domain';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';

@Component({
  selector: 'app-grn-pending-list',
  templateUrl: './grn-pending-list.component.html',
  styleUrls: ['./grn-pending-list.component.scss'],
})
export class GrnPendingListComponent implements OnInit {
  displaySupplierList: boolean = false;
  title: string;
  selectedSupplierId: any = 0;
  PODataList: any;

  supplierCols: Array<any> = [];
  SelectedSupplier: any;
  SupplierMasterArray: SupplierMaster[];
  cols;
  breadcumbmodel: MenuItem[];

  constructor(
    private masterapi: MasterApiService,
    private stockApi: StockApiService,
    private translate: TranslateService,
    private activatedroute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.supplierCols = [
      { field: 'suppliersMasterSupplierId', header: 'Supplier Code' },
      { field: 'suppliersMasterSupplierName', header: 'Supplier Name' },
    ];
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.cols = [
      { field: 'PONo', header: 'PO No' },

      { field: 'podId', header: 'PO dId' },
      { field: 'supplierName', header: 'Supplier' },
      { field: 'date', header: 'Date' },
      { field: 'materialName', header: 'Material Name' },
      { field: 'unitName', header: 'Unit' },
      { field: 'poQty', header: 'PO Qty' },
      { field: 'bQty', header: 'Delivered Qty' },
      { field: 'dQty', header: 'Balance Qty' },
    ];
    this.getSupplierMaster();
    this.search();
  }
  search() {
    this.stockApi.GetGRMPOs(this.selectedSupplierId).subscribe((res: any) => {
      var PODataArray = res.result;
      this.PODataList = [];
      PODataArray.forEach((element: any) => {
        this.PODataList.push({
          supplierName: element?.supplierName,
          PONo: element?.poNo,
          materialName: element.itemName,
          itemId: element.itemId,
          poQty: element.quantity,
          unitName: element.unitName,
          isSelect: false,
          price: element.rate,
          poId: element.poId,
          date: element.poDate,
          podId: element.podId,
          bQty: element.balanceQuantity,
          dQty: element.deliveredQuantity,
        });
      });
    });
  }

  getAllSupplierMaster() {
    this.displaySupplierList = true;
  }
  Clear() {
    this.selectedSupplierId = 0;
    this.SelectedSupplier = null;
    this.PODataList = [];
  }
  selectSupplier(supplier: any) {
    this.PODataList = [];
    this.SelectedSupplier = supplier.suppliersMasterSupplierName;
    this.displaySupplierList = false;
    this.selectedSupplierId = supplier.suppliersMasterSupplierId ?? 0;
    this.search();
  }
  getSupplierMaster() {
    this.masterapi.GetAllSupplier().subscribe((k) => {
      this.SupplierMasterArray = k;
    });
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
}
