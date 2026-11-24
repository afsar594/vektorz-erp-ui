import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef, SelectItem } from 'primeng';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { PurchaseRequisition } from 'src/app/routes/domain/Procurements/PurchaseRequisition';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';

@Component({
  selector: 'app-purchase-requisition-status',
  templateUrl: './purchase-requisition-status.component.html',
  styleUrls: ['./purchase-requisition-status.component.scss'],
})
export class PurchaseRequisitionStatusComponent implements OnInit {
  selectedCustomers = []; // Array to hold selected customers
  loading = false;

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  unitAry: any;
  unitListt: any;
  units: any;
  unitArry: string[] = [];
  receivedData: any;
  locationArray: LocationMaster[] = [];
  locationList: SelectItem[];
  locationArry: string[] = [];

  title: string;

  index: number = 0;

  defaultValue: any;
  purchaseRequisitionarry: PurchaseRequisition[];
  jobid: any;
  selectedReq: any = [];
  purchaseRequisatonStatus: FormGroup;
  filterArray: any;
  LocationId = 0;
  handleChange(e) {
    this.index = e.index;
  }
  cols;

  showloc: boolean = false;
  constructor(
    private activatedroute: ActivatedRoute,
    private masterapi: MasterApiService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private stockApi: StockApiService
  ) {
    this.cols = [
      { field: '', header: 'Mark' },
      // { field: 'part_No', header: 'Part NO' },
      { field: 'srNo', header: 'SR NO' },
      { field: 'date', header: 'Date' },
      { field: 'SupplierName', header: 'Supplier' },
      { field: 'item_Name', header: 'Material' },
      { field: 'jobname', header: 'Job' },
      { field: 'unit', header: 'Unit' },
      { field: 'srq', header: 'PR_Qty' },
      { field: 'delQty', header: 'Del Qty' },
      { field: 'balQty', header: 'Balance' },
      { field: 'stock', header: 'Stock' },
      { field: 'customerQuotationDetailsRemarks', header: 'Close' },
    ];
  }

  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.purchaseRequisatonStatus = new FormGroup({
      jobId: new FormControl(''),
      DateTO: new FormControl(new Date()),
      DateFrom: new FormControl(new Date()),
      isDate: new FormControl(false),
      locationId: new FormControl(-1),
    });
    this.selectedCustomers = [];
    this.selectedReq = [];
    this.jobid = this.config.data.selectedJob;
    this.LocationId = this.config.data.location;
    this.showloc = this.config.data.location ? true : false;
    this.selectedReq = this.config.data.selectedReq;

    this.getAllJobs();
    this.getAllLOC();
  }

  getAllJobs() {
    this.masterapi.GetJobMaster().subscribe((k) => {
      this.jobArray = k.result;
      this.jobList = k.result.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));

      this.jobArry = k.result.map((ar) => ar.jobMasterJobName?.trim());

      this.purchaseRequisatonStatus.get('jobId').setValue(this.jobid);
      this.show();
    });
  }

  getAllLOC() {
    this.masterapi.GetAllLocation().subscribe((k: any) => {
      this.locationArray = k;
      this.locationList = k.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationList.unshift({ label: '--Select --', value: 0 });
      this.locationArry = k;
      this.purchaseRequisatonStatus.get('locationId').setValue(this.LocationId);
    });
  }

  public getjobName(id: number): string {
    return this.jobList?.find((j) => j?.value == id)?.label;
  }

  show() {
    if (this.purchaseRequisatonStatus.get('isDate').value === true) {
      this.defaultValue = {
        isDateChecked: true,
        jobId: this.purchaseRequisatonStatus.value.jobId
          ? this.purchaseRequisatonStatus.value.jobId
          : 0,
        fromDate:
          this.purchaseRequisatonStatus.get('isDate').value === true
            ? this.purchaseRequisatonStatus.value.DateFrom
            : null,
        toDate:
          this.purchaseRequisatonStatus.get('isDate').value === true
            ? this.purchaseRequisatonStatus.value.DateTO
            : null,
        locationId: this.purchaseRequisatonStatus.get('locationId').value
          ? this.purchaseRequisatonStatus.get('locationId').value
          : -1,
      };
    } else {
      this.defaultValue = {
        isDateChecked: false,
        jobId: this.purchaseRequisatonStatus.value.jobId
          ? this.purchaseRequisatonStatus.value.jobId
          : 0,
        fromDate:
          this.purchaseRequisatonStatus.get('isDate').value === true
            ? this.purchaseRequisatonStatus.value.DateFrom
            : null,
        toDate:
          this.purchaseRequisatonStatus.get('isDate').value === true
            ? this.purchaseRequisatonStatus.value.DateTO
            : null,
        locationId: this.purchaseRequisatonStatus.get('locationId').value
          ? this.purchaseRequisatonStatus.get('locationId').value
          : -1,
      };
    }

    this.stockApi
      .GetPurchaseReqJobId(this.defaultValue)
      .subscribe((response: any) => {
        let selectRes = response.result.map((b) => {
          b.jobname = this.getjobName(b.jobid);
          return b;
        });

        // Hide PR lines already imported in this PO session (no page refresh needed).
        // Flatten: older callers push each browse batch as a nested array.
        const flatSelected: any[] = Array.isArray(this.selectedReq)
          ? (this.selectedReq as any[]).reduce((acc: any[], x: any) => acc.concat(Array.isArray(x) ? x : [x]), [])
          : [];
        const selectedSrdIds = flatSelected
          .map((e: any) => e?.srdid ?? e?.SRDID ?? e?.srdId)
          .filter((id: any) => id !== null && id !== undefined);
        if (selectedSrdIds.length > 0) {
          selectRes = selectRes?.filter(
            (res: any) => !selectedSrdIds.includes(res.srdid ?? res.SRDID ?? res.srdId)
          );
        }

        this.purchaseRequisitionarry = selectRes;
        this.filterArray = selectRes;
        this.selectedCustomers = [];
      });
  }

  onSelectionChanges(event: any) {
    this.selectedCustomers = [];
    if (event != null && event != undefined) {
      this.defaultValue = {
        jobId: event,
      };
      this.show();
    }
  }

  public getUnitName(unit: number): string {
    return this.units?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }

  getAllUnit() {
    this.masterapi.GetAllUnit().subscribe((k) => {
      this.units = k;
      this.unitListt = k.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = k.map((ar) => ar?.unitMasterUnitShortName?.trim());
    });
  }

  getAllLocation() {
    this.masterapi.GetAllLocation().subscribe((k) => {
      this.locationArray = k;
      this.locationList = k.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationList.unshift({ label: '--Select--', value: '' });
      this.locationArry = k.map((ar) => ar.locationMasterLocationName.trim());
    });
  }

  clearAllSelections() {
    this.selectedCustomers = [];
  }

  toggleSelection(customer: any) {
    const index = this.selectedCustomers.indexOf(customer);
    if (index === -1) {
      this.selectedCustomers.push(customer);
    } else {
      this.selectedCustomers.splice(index, 1);
    }
  }

  isSelected(customer: any): boolean {
    return this.selectedCustomers.includes(customer);
  }

  export() {
    if (this.showloc) {
      const locationId = this.purchaseRequisatonStatus.get('locationId').value;

      const dataToClose = {
        selectedCustomers: this.selectedCustomers,
        location: locationId,
      };

      this.ref.close(dataToClose);
    } else {
      this.ref.close(this.selectedCustomers);
    }
  }

  close() {
    this.ref.close();
  }

  clearfilter() {
    this.purchaseRequisatonStatus.reset();
    this.purchaseRequisitionarry = [];
    // this.show()
  }

  filter() {
    let filteredArray = this.filterArray;
    if (
      this.purchaseRequisatonStatus.value.jobId != -1 &&
      this.purchaseRequisatonStatus.value.jobId != ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) => res.jobid === this.purchaseRequisatonStatus.value.jobId
      );
    }
    if (this.purchaseRequisatonStatus.value.isDate) {
      const fromDateStr = this.purchaseRequisatonStatus.value.DateFrom;
      const toDateStr = this.purchaseRequisatonStatus.value.DateTO;

      const fromDate = new Date(fromDateStr).toISOString().split('T')[0];
      const toDate = new Date(toDateStr).toISOString().split('T')[0];

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.date).toISOString().split('T')[0];

        return voucherDate >= fromDate && voucherDate <= toDate;
      });

      this.purchaseRequisitionarry = filteredArray;
    }

    this.purchaseRequisitionarry = filteredArray;
  }
}
