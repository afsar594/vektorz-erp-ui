import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem, SelectItem } from 'primeng';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

@Component({
  selector: 'app-customer-sales-detail',
  templateUrl: './customer-sales-detail.component.html',
  styleUrls: ['./customer-sales-detail.component.scss']
})
export class CustomerSalesDetailComponent implements OnInit {
  title:string;
  subtitle:string;
   breadcumbmodel: MenuItem[];
  customersalesdetail: FormGroup;
  CustomerMasterList: SelectItem[] = [];
  index: number = 0;
  handleChange(e) {
    this.index = e.index;
  }
   
    constructor(    private activatedroute: ActivatedRoute,
      private translate: TranslateService,
      private router: Router,
  private fb:FormBuilder,
      private masterapi: MasterApiService
  
      ) { }
  
    ngOnInit(): void {
      this.customersalesdetail = new FormGroup({
        customername: new FormControl(null, Validators.required),
         fromdate: new FormControl('', Validators.required),
        todate: new FormControl('', Validators.required),
      });
      this.activatedroute.data.subscribe(data => {
        this.title = data.title;
        this.subtitle = data.title;
        
      });
      this.getAllCustomerMaster();
  
    }
    getAllCustomerMaster() {
      this.masterapi.GetAllCustomer().subscribe((k) => {
        this.CustomerMasterList = (k || []).map((kl) => ({
          label:
            kl.customerMasterCustomerReffAcNo != null
              ? kl.customerMasterCustomerName +
                ' -- ' +
                kl.customerMasterCustomerReffAcNo
              : kl.customerMasterCustomerName,
          value: kl.customerMasterCustomerNo,
        }));
        this.CustomerMasterList.unshift({
          label: '--Select Customer--',
          value: null,
        });
      });
    }
    get f() {
      return this.customersalesdetail.controls;
    }
  
  }
  
