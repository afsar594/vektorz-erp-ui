import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { PriceLevelMaster } from 'src/app/routes/domain/Masters/PriceLevelMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { HotTableRegisterer } from '@handsontable/angular';


@Component({
  selector: 'app-pricelevel',
  templateUrl: './pricelevel.component.html',
  styleUrls: ['./pricelevel.component.scss']
})
export class PricelevelComponent implements OnInit {
  ScreenId: number;
  Permission: any;
  constructor(private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private api: MasterApiService,
    private messageService: MessageService,
    private permission: PermissionsService,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
  ) {
      this.getPriceLevelList();
     }
  title:string;

  breadcumbmodel: MenuItem[];
  PriceLevelFormGroup: FormGroup;
  btnlabel: string = 'Submit';
  dataForDelete: any;
  btnFlag: ButtonFlag;
  operation: {insert: boolean, update: boolean, delete: boolean} = {insert: false, update: false, delete: false};
  displayedColumns: string[] = ['code', 'name',  'short_name', 'action'];
  priceLevelList: PriceLevelMaster[] = [];
   ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId); 
      
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Price Level Master') {
          this.Permission = {
            Allow: res?.workGroupPermissionsUallow,
            Add: res?.workGroupPermissionsUadd,
            Delete: res?.workGroupPermissionsUdelete,
            Edit: res?.workGroupPermissionsUedit,
            Print: res?.workGroupPermissionsUprint,
            View: res?.workGroupPermissionsUview
          };
        }
      }); 
    })
     this.operation.insert = true;
     this.breadcumbmodel = this.router.url.slice(1).split('/').map((k) => ({label: k }));
     this.activatedroute.data.subscribe(data => {
       this.title = data.title;
   });
     this.PriceLevelFormGroup = this.fb.group({
      priceLevelMasterPriceLevelId: [0],
      priceLevelMasterPriceLevelName: [{ value: '', disabled: true, },[Validators.required]],
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      update: false,
      delete: false,
    };
   }
 

   edit() {
    this.PriceLevelFormGroup.enable();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: false,
      update: true,
      delete: false,
    };    
  }
    public getPriceLevelList() {
     this.api.GetAllPriceLevel().subscribe((data) => {
       this.priceLevelList = data;
     });
     }
 
     savePriceLevel() {
       this.PriceLevelFormGroup.markAsDirty();
       this.PriceLevelFormGroup.markAllAsTouched();
       if (this.PriceLevelFormGroup.valid) {
            if (this.operation.insert) {
         this.insertPriceLevel(this.PriceLevelFormGroup.value);
       } else if (this.operation.update) {
         this.updatePriceLevel(this.PriceLevelFormGroup.value);
       } else {
       }
       }
       this.btnFlag = {
        edit: false,
        cancel: false,
        save: false,
        update: false,
        delete: false,
        };    
        this.PriceLevelFormGroup.reset();
 
     }

     ExitNew() {
      this.router.navigate(['/dashboard']);
    }
    new() {
      this.PriceLevelFormGroup.reset();
     
          
      //this.index = 0;
      this.PriceLevelFormGroup.enable();
      //this.f.purchaseQuotationNo.clearValidators();
      //this.f.purchaseQuotationDate.setValue(new Date());
      this.PriceLevelFormGroup.updateValueAndValidity();
      this.btnFlag = {
        edit: false,
        cancel: false,
        save: true,
        update: false,
        delete: false,
      };
    }
      updateValues(data: PriceLevelMaster) {
        this.dataForDelete=data;
       this.operation = {insert: false, update: true, delete: false};
       this.btnlabel = 'Update';
       this.PriceLevelFormGroup.patchValue(data);
       this.btnFlag = {
        edit: true,
        cancel: false,
        save: false,
        update: false,
        delete: true,
      };
      this.PriceLevelFormGroup.disable();
      }
    //  removePriceLevel(data: PriceLevelMaster) {
    //    this.operation = {insert: true, update: false, delete: false};
    //    this.btnlabel = 'Submit';
    //    this.deletePriceLevel(data);
    //  }
     public get f() {
       return this.PriceLevelFormGroup.controls;
     }
     public  reset() {
       this.operation = {insert: true, update: false, delete: false};
       this.btnlabel = 'Submit';
       this.PriceLevelFormGroup.reset();
     }
 
     public insertPriceLevel(PriceLevel: PriceLevelMaster) {
      //  this.api.InsertPriceLevel(PriceLevel).subscribe((data :any) => {
      //   this.messageService.add({
      //     severity: 'success', summary: 'Alert',
      //     detail: "Added Sucessfully"
      //   });
      //    this.priceLevelList = data;
      //    this.reset();
      //  });

      if (this.PriceLevelFormGroup.valid) {
        this.confirmation.confirm({
          key: 'confirm-key',
          message: this.translate.instant('Do you want to Save?'),
          accept: () => {
            this.api.InsertPriceLevel(PriceLevel).subscribe((data: any) => {
              this.priceLevelList = data;
              this.reset();
              this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Price Level Saved Succesfully' });
  
            }, (err) => {
              this.messageService.add({ severity: 'error', summary: 'Alert', detail: this.translate.instant('Save Operation Failed') });
            });
          }
        });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Alert', detail: this.translate.instant('Please fill mandatory fields') });
        this.PriceLevelFormGroup.markAllAsTouched();
        this.PriceLevelFormGroup.markAsDirty();
      }

     }
 
 
     public updatePriceLevel(PriceLevel: PriceLevelMaster) {

      //  this.api.UpdatePriceLevel(PriceLevel).subscribe((data :any) => {
      //   this.messageService.add({
      //     severity: 'success', summary: 'Alert',
      //     detail: "Updated Sucessfully"
      //   });
      //    this.priceLevelList = data;
      //    this.reset();
      //  });

      if (this.PriceLevelFormGroup.valid) {
        this.confirmation.confirm({
          key: 'confirm-key',
          message: this.translate.instant('Do you want to Update?'),
          accept: () => {
            this.api.UpdatePriceLevel(PriceLevel).subscribe((data: any) => {
              this.priceLevelList = data;
              this.reset();
              this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Price Level Updated Succesfully' });
  
            }, (err) => {
              this.messageService.add({ severity: 'error', summary: 'Alert', detail: this.translate.instant('Updated Failed') });
            });
          }
        });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Alert', detail: this.translate.instant('Please fill mandatory fields') });
        this.PriceLevelFormGroup.markAllAsTouched();
        this.PriceLevelFormGroup.markAsDirty();
      }


     }
 
    //  public deletePriceLevel(PriceLevel: PriceLevelMaster) {
    //    this.btnlabel = 'Submit';
    //    this.api.DeletePriceLevel(PriceLevel).subscribe((data : any) => {
    //     this.messageService.add({
    //       severity: 'success', summary: 'Alert',
    //       detail: "Deleted Sucessfully"
    //     });
    //      this.priceLevelList = data;
    //      this.reset();
    //    });
    //  }
     
    delete() {
      this.confirmation.confirm({
        key: 'confirm-key',
        //message: 'Do you want to delete Location?',
        message: this.translate.instant('Do you want to Delete?'),
        accept: () => {
          this.api
            .DeletePriceLevel(this.dataForDelete)
            .subscribe(
              (data) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Location Deleted Succesfully',
                  
                });
                
                this.priceLevelList = data;
                this.PriceLevelFormGroup.disable();
              },
              (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Failed',
                });
              }
            );
        },
      });
      this.btnFlag = {
        edit: false,
        cancel: false,
        save: false,
        update: false,
        delete: false,
      };
    }
    

}
interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?:boolean;
}