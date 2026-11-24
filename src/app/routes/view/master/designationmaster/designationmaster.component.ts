import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DesignationService } from 'src/app/routes/service/designation.service';

@Component({
  selector: 'app-designationmaster',
  templateUrl: './designationmaster.component.html',
  styleUrls: ['./designationmaster.component.scss'],
})
export class DesignationmasterComponent implements OnInit {
  submitted: boolean = false;
  title: string;
  designationForm: FormGroup;
  subtitle: string;
  displayMaximizeable: boolean = false;
  cols: Array<any> = [];
  designationList: any[] = [];
  btnFlag: ButtonFlag;
  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private DesignationService: DesignationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
    });
    this.btnFlag = {
      new: false,
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.cols = [
      { field: 'DesignationId', header: 'designationId' },
      { field: 'Designation', header: 'designation' },
      { field: 'ShortName', header: 'shortName' },
      { field: '', header: 'Actions' },
    ];
    this.displayMaximizeable = false;
    this.initForm();
    this.getAllDesignation();
  }

  Edit() {
    this.designationForm.enable();
    this.btnFlag = {
      new: true,
      edit: true,
      cancel: false,
      save: false,
      update: true,
      delete: false,
    };
  }

  new() {
    this.designationForm.reset();
    this.designationForm.enable();
    this.designationForm.controls.designationId.setValue(0);
    this.designationForm.clearValidators();
    this.btnFlag = {
      new: true,
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
  }

  initForm() {
    this.designationForm = new FormGroup({
      designationId: new FormControl(0),
      designation: new FormControl('', Validators.required),
      shortName: new FormControl('', Validators.required),
    });
    this.designationForm.disable();
  }

  getAllDesignation() {
    this.DesignationService.getAllDesignation().subscribe((response: any) => {
      this.designationList = response;
      // this.displayMaximizeable = true;
    });
  }

  insertDesignstion() {
    this.submitted = true;
    this.designationForm.markAllAsTouched();
    this.designationForm.controls['designation'].value.trim();
    this.designationForm.controls['shortName'].value.trim();
    if (this.designationForm.invalid) {
      this.messageService.add({
        severity: 'info',
        summary: 'Failed',
        detail: 'Mandatory fields are missing',
      });
      return;
    }

    if (this.designationForm.valid) {
      this.confirmationService.confirm({
        key: 'confirm-key',
        message: 'Do you want to Save this Record?',
        accept: () => {
          this.DesignationService.insertDesignstion(
            this.designationForm.value
          ).subscribe(
            (response: any) => {
              if (response.result.length > 0) {
                this.initForm();
                this.designationForm.disable();
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success!',
                  detail: 'Record Added Successflly!',
                });

                this.designationList = response.result;
                const langSaved = response.result[response.result.length - 1];
                this.selectForEdit(langSaved);
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Failed',
                  detail: '',
                });
              }
            },
            (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Api response error',
                detail: error,
              });
            }
          );
        },
        reject: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Cancelled',
            detail: '',
          });
        },
      });
    }
  }

  selectForEdit(item: any) {
    this.displayMaximizeable = false;
    this.btnFlag = {
      new: false,
      edit: true,
      cancel: false,
      save: false,
      update: true,
      delete: true,
    };
    this.designationForm.controls['designationId'].setValue(item.designationId);
    this.designationForm.controls['designation'].setValue(item.designation);
    this.designationForm.controls['shortName'].setValue(item.shortName);
  }

  updateDesignation() {
    this.submitted = true;
    this.designationForm.markAllAsTouched();
    this.designationForm.controls['designation'].value.trim();
    this.designationForm.controls['shortName'].value.trim();

    if (this.designationForm.invalid) {
      this.messageService.add({
        severity: 'info',
        summary: 'Failed',
        detail: 'Mandatory fields are missing',
      });

      return;
    }

    const id = this.designationForm.controls['designationId'].value;
    this.confirmationService.confirm({
      key: 'confirm-key',
      message: 'Do you want to Update this Record?',

      accept: () => {
        this.DesignationService.updateDesignation(
          this.designationForm.value
        ).subscribe(
          (response: any) => {
            if (response.result.length) {
              this.initForm();
              this.designationForm.disable();
              this.designationList = response.result;
              const langSaved = response.result?.find(
                (i) => i.designationId == id
              );
              this.selectForEdit(langSaved);

              this.messageService.add({
                severity: 'success',
                summary: 'Success!',
                detail: 'Record Updated Successflly!',
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Failed',
                detail: '',
              });
            }
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Api response error',
              detail: error,
            });
          }
        );
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: '',
        });
      },
    });
  }

  onDelete() {
    this.deleteDesignation();
  }

  deleteDesignation() {
    this.confirmationService.confirm({
      key: 'confirm-key',
      message: 'Do you want to Delete this Record?',
      accept: () => {
        this.DesignationService.deleteDesignation(
          this.designationForm.controls.designationId.value
        ).subscribe(
          (response: any) => {
            if (response.length > 0) {
              this.designationForm.reset();
              this.designationList = response;
              this.messageService.add({
                severity: 'success',
                summary: 'Success!',
                detail: 'Record Deleted Successflly!',
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Failed',
                detail: '',
              });
            }
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Api response error',
              detail: error,
            });
          }
        );
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: '',
        });
      },
    });
  }

  public get f() {
    return this.designationForm.controls;
  }
}

interface ButtonFlag {
  new?: boolean;
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
