import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api';
import { TermsandCondition } from 'src/app/routes/domain/Masters/TermsandCondition';


@Component({
  selector: 'app-termsandcondition',
  templateUrl: './termsandcondition.component.html',
  styleUrls: ['./termsandcondition.component.scss']
})
export class TermsandconditionComponent implements OnInit {
  constructor(private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private api: MasterApiService) {
      this.getTermsandConditionList();
     }
  title:string;

  breadcumbmodel: MenuItem[];
  TermandConditionFormGroup: FormGroup;
  btnlabel: string = 'Submit';
  operation: {insert: boolean, update: boolean, delete: boolean} = {insert: false, update: false, delete: false};
  displayedColumns: string[] = ['code', 'name',  'short_name', 'action'];
  TermsandConditionList: TermsandCondition[] = [];
   ngOnInit(): void {
     this.operation.insert = true;
     this.breadcumbmodel = this.router.url.slice(1).split('/').map((k) => ({label: k }));
     this.activatedroute.data.subscribe(data => {
       this.title = data.title;
   });
     this.TermandConditionFormGroup = this.fb.group({
      termsAndConditionTermsId: [0],
      termsAndConditionTermsConditions: [null]
      // termsAndConditionTermsDeleted:[null],
      // termsAndConditionsTermsDelStatus:[null]
    });
   }
 
    public getTermsandConditionList() {
     this.api.GetAllTerms().subscribe((data) => {
      //  console.log(data);
       this.TermsandConditionList = data;
     });
     }
 
     saveTerms() {
       this.TermandConditionFormGroup.markAsDirty();
       this.TermandConditionFormGroup.markAllAsTouched();
       if (this.TermandConditionFormGroup.valid) {
            if (this.operation.insert) {
         this.insertTerms(this.TermandConditionFormGroup.value);
       } else if (this.operation.update) {
         this.updateTerms(this.TermandConditionFormGroup.value);
       } else {
       }
       }
 
     }
      updateValues(data: TermsandCondition) {
       this.operation = {insert: false, update: true, delete: false};
       this.btnlabel = 'Update';
       this.TermandConditionFormGroup.patchValue(data);
      }
     removeBudget(data: TermsandCondition) {
       this.operation = {insert: true, update: false, delete: false};
       this.btnlabel = 'Submit';
       this.deleteTerms(data);
     }
     public get f() {
       return this.TermandConditionFormGroup.controls;
     }
     public  reset() {
       this.operation = {insert: true, update: false, delete: false};
       this.btnlabel = 'Submit';
       this.TermandConditionFormGroup.reset();
     }
 
     public insertTerms(Terms: TermsandCondition) {
       this.api.InsertTerms(Terms).subscribe((data) => {
         this.TermsandConditionList = data;
         this.reset();
       });
     }
 
 
     public updateTerms(Terms: TermsandCondition) {
       this.api.UpdateTerms(Terms).subscribe((data) => {
         this.TermsandConditionList = data;
         this.reset();
       });
     }
 
     public deleteTerms(Terms: TermsandCondition) {
       this.btnlabel = 'Submit';
       this.api.DeleteTerms(Terms).subscribe((data) => {
         this.TermsandConditionList = data;
         this.reset();
       });
     }

}
