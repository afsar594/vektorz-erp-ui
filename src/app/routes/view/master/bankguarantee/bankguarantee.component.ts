import { BankGuaranteeMaster } from './../../../domain/Masters/BankGuaranteeMaster';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-bankGuarantee',
  templateUrl: './bankGuarantee.component.html',
  styleUrls: ['./bankGuarantee.component.scss']
})
export class BankGuaranteeComponent implements OnInit {

  constructor(private activatedroute: ActivatedRoute,
              private fb: FormBuilder,
              private router: Router,
              private api: MasterApiService) {
                this.getAllBankGuarantee();
               }
 title: string;
 breadcumbmodel: MenuItem[];
 BankGuaranteeMasterFormGroup: FormGroup;
 btnlabel: string = 'Submit';
 operation: {insert: boolean, update: boolean, delete: boolean} = {insert: false, update: false, delete: false};
 displayedColumns: string[] = ['code', 'name',  'satus', 'action'];
 bankguaranteeList: BankGuaranteeMaster[] = [];
  ngOnInit(): void {
    this.operation.insert = true;
    this.breadcumbmodel = this.router.url.slice(1).split('/').map((k) => ({label: k }));
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
  });
    this.BankGuaranteeMasterFormGroup = this.fb.group({

      bankGuaranteeMasterBgid: [0],
      bankGuaranteeMasterBgname: [null, [Validators.required]],
      bankGuaranteeMasterStatus: [false]
    });
  }

   public getAllBankGuarantee() {
    this.api.GetAllBankGuarantee().subscribe((data) => {
      this.bankguaranteeList = data;
    });
    }

    saveBankGuarantee() {
      this.BankGuaranteeMasterFormGroup.markAsDirty();
      this.BankGuaranteeMasterFormGroup.markAllAsTouched();
      if (this.BankGuaranteeMasterFormGroup.valid) {
           if (this.operation.insert) {
             this.insertBankGuarantee
             this.insertBankGuarantee(this.BankGuaranteeMasterFormGroup.value);
      } else if (this.operation.update) {
        this.updateBankGuarantee(this.BankGuaranteeMasterFormGroup.value);
      } else {
      }
      }

    }
     updateValues(data: BankGuaranteeMaster) {
      this.operation = {insert: false, update: true, delete: false};
      this.btnlabel = 'Update';
      this.BankGuaranteeMasterFormGroup.patchValue(data);
     }
     removeBankGuarantee(data: BankGuaranteeMaster) {
      this.operation = {insert: true, update: false, delete: false};
      this.btnlabel = 'Submit';
      this.deleteBankGuarantee(data);
    }
    public get f() {
      return this.BankGuaranteeMasterFormGroup.controls;
    }
    public  reset() {
      this.operation = {insert: true, update: false, delete: false};
      this.btnlabel = 'Submit';
      this.BankGuaranteeMasterFormGroup.reset();
    }

    public insertBankGuarantee(bankGuarantee: BankGuaranteeMaster ) {
      this.api.InsertBankGuarantee(bankGuarantee).subscribe((data) => {
        this.bankguaranteeList = data;
        this.reset();
      });
    }


    public updateBankGuarantee(bankGuarantee: BankGuaranteeMaster ) {
      this.api.UpdateBankGuarantee(bankGuarantee).subscribe((data) => {
        this.bankguaranteeList = data;
        this.reset();
      });
    }

    public deleteBankGuarantee(bankGuarantee: BankGuaranteeMaster ) {
      this.btnlabel = 'Submit';
      this.api.DeleteBankGuarantee(bankGuarantee).subscribe((data) => {
        this.bankguaranteeList  = data;
        this.reset();
      });
    }

}
