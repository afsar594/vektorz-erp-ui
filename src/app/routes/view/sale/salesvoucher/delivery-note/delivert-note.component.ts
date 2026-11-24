import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem, DynamicDialogRef, DynamicDialogConfig } from 'primeng';
import { ItemMaster } from 'src/app/routes/domain';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';

@Component({
  selector: 'app-delivert-note',
  templateUrl: './delivert-note.component.html',
  styleUrls: ['./delivert-note.component.scss'],
})
export class DelivertNoteComponent implements OnInit {
  selectedCustomers = [];
  loading = false;
  receivedData: any;

  customerArray: CustomerMaster[] = [];
  customerArry: string[] = [];
  customerList: SelectItem[];
  title: string;
  subtitle: string;
  dataset: any;
  index: number = 0;
  foundcustomer: any;
  foundLocation: any;
  cols: any;
  cars: any;
  customers: any;
  checkedCustomers: any;
  defaultValue: any;
  filterArray: any;
  handleChange(e) {
    this.index = e.index;
  }
  deliveryform: FormGroup;
  deliveryList: any;

  constructor(
    private activatedroute: ActivatedRoute,
    private masterapi: MasterApiService,
    private salesapi: SalesApiService,

    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.receivedData = this.config.data;
    this.deliveryform = new FormGroup({
      Customercode: new FormControl(''),

      toDate: new FormControl(new Date()),
      fromDate: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear() - 5))
      ),
      ischeck: new FormControl(false),
    });

    if (this.receivedData) {
      this.deliveryform.controls.Customercode.setValue(
        this.receivedData.selectedCustomer
      );
    }
    this.getAllCustomer();
    this.show();
  }

  show() {
    this.salesapi
      .DeliveryNoteByFilter(this.deliveryform.value)
      .subscribe((response: any) => {
        this.deliveryList = response.result;
        this.filterArray = response.result;
      });
  }

  getAllCustomer() {
    this.masterapi.GetAllCustomer().subscribe((k) => {
      this.customerArray = k;
      this.customerList = k.map((kl) => ({
        label: kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.customerList.unshift({ label: '--Select--', value: '' });
      this.customerArry = k.map((ar) => ar.customerMasterCustomerName.trim());
    });
  }

  clearAllSelections() {
    this.selectedCustomers = [];
  }

  public getcustomerName(id: number): string {
    return this.customerList?.find((j) => j?.value === id)?.label;
  }

  toggleSelection(id: any) {
    const index = this.selectedCustomers.indexOf(id);
    if (index === -1) {
      this.selectedCustomers.push(id);
    } else {
      this.selectedCustomers.splice(index, 1);
    }
  }

  isSelected(customer: any): boolean {
    return this.selectedCustomers.includes(customer);
  }

  export() {
    this.ref.close(this.selectedCustomers);
  }

  close() {
    this.ref.close();
  }

  clearfilter() {
    this.deliveryform.get('Customer').setValue('');

    this.deliveryform.get('DateFrom').setValue(new Date());
    this.deliveryform.get('DateTO').setValue(new Date());
    this.deliveryform.get('isDate').setValue(false);
  }
}
