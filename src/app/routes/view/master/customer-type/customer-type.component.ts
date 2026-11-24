import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-customer-type',
  templateUrl: './customer-type.component.html',
  styleUrls: ['./customer-type.component.scss']
})
export class CustomerTypeComponent implements OnInit {

  title: string;
  Customer_TypeFormGroup: FormGroup;
  btnFlag: ButtonFlag;
  payload: any;
  customerList: any;
  confirmDropDatabaseDialogVisible:boolean=false;
  constructor(private activatedroute: ActivatedRoute,
              private confirmation: ConfirmationService,
              private messageService: MessageService,
              private masterApi:MasterApiService,
               private permission: PermissionsService
              
  ) { }

  ngOnInit(): void {
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
    });
        this.Customer_TypeFormGroup = new FormGroup({
          customervoucherNo: new FormControl(''),
          customerTypeId: new FormControl(''),
          customerTypeName: new FormControl('', [Validators.required]),
          defaultType: new FormControl(false),
          appDocument: new FormControl(false)
        });
        this.btnFlag = {
          edit: false,
          cancel: false,
          save: true,
          update: false,
          delete: false,
          new: true
        };
        this.Customer_TypeFormGroup.disable();
        this.getAllCustomerType()
  }
  get f() {
    return this.Customer_TypeFormGroup.controls
  }
  onSave() {
    const custFormValue = this.Customer_TypeFormGroup.value;  
    this.payload = {
      customerTypeId: custFormValue.customerTypeId?custFormValue.customerTypeId:0,
      customerTypeName: custFormValue.customerTypeName || null,
      customerTypeUserId:this.permission.getUser()?.userId,
      customerTypeDeleted: false,
      customerTypeStatus: false,
      customerTypeDelStatus: false
    };  
    if (this.btnFlag.save) {
      this.CustomerSave();
    } else {
      this.CustomerUpdate();
    }
  }
  CustomerSave() {
    if (this.Customer_TypeFormGroup.valid) {
      // Confirmation dialog
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save?',
        accept: () => {
          this.masterApi.SaveCustomertype(this.payload).subscribe(
            (data: any) => {
              if (data) {
                this.Customer_TypeFormGroup.disable();
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  new: true
                };
                this.getAllCustomerType()
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Data Save Succesfully',
                });
              } else {
                // Display error message for failed save
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: data.message || data.exception,
                });
              }
            },
            (err) => {
              // Handle error from the service
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Customer_Type save failed',
              });
            }
          );
        }
      });
    } else {
      this.Customer_TypeFormGroup.markAllAsTouched();
      this.Customer_TypeFormGroup.markAsDirty();

      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
    }
  }

  CustomerUpdate() {
    if (this.Customer_TypeFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to Update?',
        accept: () => {
          this.masterApi.UpdateCustomertype(this.payload).subscribe(
            (data: any) => {
              if (data) {
                this.Customer_TypeFormGroup.disable();
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  new: true
                };
                this.getAllCustomerType()
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: "Data Update Succesfully",
                });
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: data.message || data.exception,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Customer_Type Update failed',
              });
            }
          );
        }
      });
    } else {
      this.Customer_TypeFormGroup.markAllAsTouched();
      this.Customer_TypeFormGroup.markAsDirty();

      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
    }
  }
  DeleteDocument() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete Custoerm_Type?',
      accept: () => {
        this.masterApi.DeleteCustomertype(this.Customer_TypeFormGroup.value).subscribe(
          (data: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'CustomerType Deleted Succesfully',
            });
              this.New();
              this.getAllCustomerType()
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

  }
  New() {
    this.Customer_TypeFormGroup.reset();
    this.Customer_TypeFormGroup.enable();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false
    };
  }
  Edit() {
    this.Customer_TypeFormGroup.enable();
    // this.Customer_TypeFormGroup.controls.docNo.disable();
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: false
    };
  }
  getAllCustomerType(){
this.masterApi.getAllCustomertype().subscribe((res)=>{
  this.customerList=res
})
  }
  updateValues(data){
    this.Customer_TypeFormGroup.patchValue(data);
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: true
    };
    this.Customer_TypeFormGroup.disable();
  }
}
interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}