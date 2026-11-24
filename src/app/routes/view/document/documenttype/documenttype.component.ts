import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng';
import { TransactionService } from 'src/app/routes/service/transaction-service.service';

@Component({
  selector: 'app-documenttype',
  templateUrl: './documenttype.component.html',
  styleUrls: ['./documenttype.component.scss']
})
export class DocumenttypeComponent implements OnInit {

  btnFlag: ButtonFlag;

  title: string;
  subtitle: string;
  index: number = 0;
  Document_TypeFormGroup: FormGroup
  documentTypes: any;
  cols: any;
  SaveddocumentTypes: Object;
  handleChange(e) {
    this.index = e.index;
  }
  displayMaximizable: boolean = false;
  constructor(private activatedroute: ActivatedRoute,
    public transactionService: TransactionService,
    private confirmation: ConfirmationService,
    private messageService: MessageService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.subtitle
    });
    this.cols = [
      { field: 'documentTypeId', header: 'Docs No' },
      { field: 'documentType', header: 'Doc Type' },
      { field: 'defaultType', header: 'Default Type' },
      { field: 'appDocument', header: 'App_Docs' },
      { field: '', header: 'Action' },
    ];
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.Document_TypeFormGroup = new FormGroup({
      documentvoucherNo: new FormControl(''),
      documentTypeId: new FormControl(''),
      documentType: new FormControl('', [Validators.required]),
      defaultType: new FormControl(false),
      appDocument: new FormControl(false)
    });
    this.Document_TypeFormGroup.disable();
    this.loadDocumentTypes();
  }
  updateFormGrid(OBVpt: any) {
    this.Document_TypeFormGroup.patchValue({
      documentvoucherNo: OBVpt.documentvoucherNo,
      documentTypeId: OBVpt.documentTypeId,
      documentType: OBVpt.documentType,
      defaultType: OBVpt.defaultType,
      appDocument: OBVpt.appDocument

    });
  }

  // Create or update document type
  save(): void {
    const formData = this.Document_TypeFormGroup.value;
    formData.documentTypeId = Number(formData.documentTypeId);
    if (this.Document_TypeFormGroup.valid) {
      if (this.btnFlag.update) {
        this.confirmation.confirm({
          key: 'confirm-key',
          message: 'Do you want to Update?',
          accept: () => {
            this.transactionService.UpdateDocumentType(formData.id, formData)
              .subscribe((data: any) => {
                this.loadDocumentTypes();
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                if (data.valid) {
                  this.updateFormGrid(data.result)
                  this.SaveddocumentTypes = data.result
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: data.message,
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
                    detail: 'Document save failed',
                  });
                }
              );
          }
        });

      } else {
        this.confirmation.confirm({
          key: 'confirm-key',
          message: 'Do you want to save?',
          accept: () => {
            this.transactionService.InsertDocumentType(formData)
              .subscribe((data: any) => {
                this.loadDocumentTypes();
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                if (data.valid) {
                  this.updateFormGrid(data.result)
                  this.SaveddocumentTypes = data.result
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: data.message,
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
                    detail: 'Document save failed',
                  });
                }
              );
          }
        });

      }
    }
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to Delete?',
      accept: () => {
        this.transactionService.DeleteDocumentType(this.Document_TypeFormGroup.controls["documentTypeId"].value)
          .subscribe((data: any) => {

            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
            };
            if (data) {
              this.new()
              this.SaveddocumentTypes = data.result
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Record has been Delete',
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
                detail: 'Record has been Delete failed',
              });
            }
          );
      }
    });
  }

  edit() {
    this.Document_TypeFormGroup.enable();
    this.documentTypes = [];
  }

  new() {
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.Document_TypeFormGroup.reset();
    this.Document_TypeFormGroup.enable();
    this.Document_TypeFormGroup.get('defaultType').setValue(false);
    this.Document_TypeFormGroup.get('appDocument').setValue(false);



    this.documentTypes = [];
  }

  showList() {
    this.loadDocumentTypes();
    this.displayMaximizable = true;
  }

  GetSavedDetails(id: any) {
    this.transactionService.GetDocumentTypebyId(id).subscribe((data: any) => {
      this.btnFlag = {
        edit: true,
        cancel: true,
        save: false,
        update: true,
        delete: true,
      };
      this.SaveddocumentTypes = data;
      this.updateFormGrid(data.result)
    });
  }
  // Get all document types
  loadDocumentTypes(): void {
    this.transactionService.GetAllDocumentType().subscribe((data: any) => {
      this.documentTypes = data.result;
    });
  }


}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
