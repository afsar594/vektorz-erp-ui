import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng';
import { MasterApiService } from 'src/app/routes/service/hrmaster.api.services copy';
import { TransactionService } from 'src/app/routes/service/transaction-service.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent implements OnInit {
  @Input('fileInput')
  fileInput: ElementRef;
  viewDocumentsData: boolean = false;
  confirmDropDatabaseDialogVisible = false;
  title: string;
  subtitle: string;
  index: number = 0;
  isEditBtndisable: boolean = true;
  submitted: boolean = false;
  first: any;
  rows: any;
  displayMaximizeable = false;
  staffdocumentForm: FormGroup;
  vehicledocumentForm: FormGroup;
  documentDetailArray: any[] = [];
  viewDetailModal: boolean = false;
  modalHeader: string = '';
  fileData: any;
  documentImagesArray: any[];
  viewDocumentImageModal: boolean = false;
  image: any;
  imageFileStaff: any;
  staffDocumentsMasterArray: any;
  DocImagesArray: any[] = [];
  vehicleDocumentsMasterArray: any;
  docStatusList = [
    { label: 'Document Status 1', value: 1 },
    { label: 'Document Status 2', value: 2 },
    { label: 'Document Status 3', value: 3 },
  ];
  companiesArray: any;
  companiesList: any;
  btnFlag: ButtonFlag;
  payload: any;
  imageSrc: string | ArrayBuffer | null = null;
  displayMaximizable: boolean = false;
  cols;

  url: string | ArrayBuffer;
  DocumentSaved: any;
  documentTypeList: any;
  documentTypeArray: any;
  documentStatusList: any;
  documentStatusArray: any;
  constructor(
    public masterApiService: MasterApiService,
    private fb: FormBuilder,
    public transactionService: TransactionService,
    public sanitizer: DomSanitizer,
    private activatedroute: ActivatedRoute,
    private confirmation: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.subtitle;
    });
    this.initForm();
    this.GetAllCompanies();
    this.GetAlldocumentTypeList();
    this.GetAlldocumentStatusList();
  }

  initForm() {
    this.staffdocumentForm = this.fb.group({
      documentId: [0],
      documentTypeId: [null, Validators.required],
      docStatusId: [null],
      // staffId: [null, Validators.required],
      companyId: [null, Validators.required],
      vehicleId: [null],
      otherId: [null],
      masterType: [null],
      docName: [null],
      docNo: [null],
      remarks: [null],
      issueDate: [new Date()],
      expDate: [new Date()],
      docImage: [null],
      status: [null],
    });
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.cols = [
      { field: 'documentvoucherNo', header: 'Document No' },
      { field: 'docStatusId', header: 'Document Status' },
      { field: 'documentTypeId', header: 'Document Type' },
      { field: 'companyId', header: 'Company' },
      { field: 'remarks', header: 'Remarks' },
      { field: '', header: 'Action' },
    ];
    this.staffdocumentForm.disable();
  }

  handleChange(e) {
    this.index = e.index;
    console.log(this.index);
  }

  get f() {
    return this.staffdocumentForm.controls;
  }

  // get d() {
  //   return this.vehicledocumentForm.controls
  // }

  // onSave() {
  //   console.log(this.staffdocumentForm.controls.docImage.value)
  //   // return
  //   var staffFormValue = this.staffdocumentForm.value
  //   var veicleFormValue = this.vehicledocumentForm?.value
  //   this.payload = {
  //     status: this.index == 0 ? staffFormValue.status : veicleFormValue.status,
  //     vehicleId: this.index == 0 ? staffFormValue.vehicleId?.id : veicleFormValue.vehicleId?.id,
  //     companyId: this.index == 0 ? staffFormValue.companyId.value : veicleFormValue.companyId,
  //     docName: this.index == 0 ? staffFormValue.docName : veicleFormValue.docName,
  //     docImage: "",
  //     docNo: this.index == 0 ? staffFormValue.docNo : veicleFormValue.docNo,
  //     expDate: this.index == 0 ? staffFormValue.expDate : veicleFormValue.expDate,
  //     issueDate: this.index == 0 ? staffFormValue.issueDate : veicleFormValue.issueDate,
  //     masterType: this.index == 0 ? "Document" : "Vehicle",
  //     otherId: this.index == 0 ? staffFormValue.otherId : veicleFormValue.otherId,
  //     remarks: this.index == 0 ? staffFormValue.remarks : veicleFormValue.remarks,
  //     docStatusId: this.index == 0 ? staffFormValue.docStatusId?.value : veicleFormValue.docStatusId?.docStatusId,
  //     documentTypeId: this.index == 0 ? staffFormValue.documentTypeId?.value : veicleFormValue.documentTypeId?.documentTypeId,
  //     staffId: this.index == 0 ? staffFormValue.staffId?.staffId : veicleFormValue.staffId?.staffId
  //   }
  // this.submitted = true
  // if (this.index == 0) {// staff
  //   if (this.staffdocumentForm.invalid) {
  //     return
  //   }
  //   this.transactionService.InsertHrDocumentMaster(payload).subscribe((res: any[]) => {

  //     var documentObj = res[res.length - 1]
  //     var DocumentContent = null
  //     let fileReader = new FileReader();
  //     fileReader.onload = () => {
  //       DocumentContent = fileReader.result.toString();
  //       var dataObj = {
  //         DocImageId: 0,
  //         DocumentId: +documentObj.documentId,
  //         DocImage: DocumentContent,
  //         Extension: this.imageFileStaff.target.files[0].type,
  //         DocName: this.imageFileStaff.target.files[0].name,
  //       }
  //       this.transactionService.InsertHrDocumentImage(dataObj).subscribe(res => {
  //         // this.transactionService.GetAllHrDocumentImages()
  //         // this.viewDocumentsData = false
  //       }, error => {
  //       })
  //     }
  //     fileReader.readAsDataURL(this.imageFileStaff.target.files[0]);
  //     this.submitted = false
  //     this.transactionService.StaffDocumentMasterArray = res as any[]
  //     // this.transactionService.GetAllStaffDocumentMaster()
  //     this.initForm()
  //   }, error => {

  //   })
  // }
  // else {
  //   if (this.vehicledocumentForm.invalid) {
  //     return
  //   }
  //   this.transactionService.InsertHrDocumentMaster(payload).subscribe(res => {
  //     this.initForm()
  //     this.submitted = false
  //     this.transactionService.StaffDocumentMasterArray = res as any[]
  //     // this.transactionService.GetAllVehicleDocumentMaster()
  //   }, error => {

  //   })
  // }
  //}
  //   if (this.staffdocumentForm.invalid) {
  //        return
  //        }
  // DocumentSave(){

  //   this.confirmation.confirm({
  //     key: 'confirm-key',
  //     message: 'Do you want to save ?',
  //     accept: () => {
  //         this.transactionService.InsertHrDocumentMaster(this.payload).subscribe((data:any) => {
  //           this.btnFlag = {
  //             edit: true,
  //             cancel: false,
  //             save: false,
  //             update: true,
  //             delete: true,
  //           };
  //           // this.savedPurchaseOrder = data.result;
  //           // this.updateFormGrid(data.result);
  //           if (data.valid) {
  //             this.messageService.add({
  //               severity: 'success',
  //               summary: 'Alert',
  //               detail: data.message,
  //             });
  //           } else if (data.error) {
  //             this.messageService.add({
  //               severity: 'error',
  //               summary: 'Alert',
  //               detail:
  //                 data.message != null && data.message?.trim() !== ''
  //                   ? data.message
  //                   : data.exception,
  //             });
  //           }
  //         },
  //           (err) => {
  //             this.messageService.add({
  //               severity: 'error',
  //               summary: 'Alert',
  //               detail: 'Purchase Order Save Failed',
  //             });
  //           }
  //         );
  //     },
  //   });

  // }

  onSave() {
    const staffFormValue = this.staffdocumentForm.value;
    this.payload = {
      status: staffFormValue.status ?? false, // Default to false if null or undefined
      vehicleId: staffFormValue.vehicleId?.id || null,
      companyId: staffFormValue.companyId || null,
      docName: staffFormValue.docName || null,
      docImage:
        this.staffdocumentForm.controls.docImage.value?.split(',')[1] || null, // Base64 string (after the comma)
      documentId: staffFormValue.documentId ?? 0, // Default to 0 if null or undefined
      docNo: staffFormValue.docNo || null,
      documentvoucherNo: staffFormValue.docNo || null, // Can be the same as docNo
      expDate: staffFormValue.expDate || null,
      issueDate: staffFormValue.issueDate || null,
      masterType: 'Document', // Constant value
      otherId: staffFormValue.otherId || null,
      remarks: staffFormValue.remarks ?? '', // Default to empty string if null
      docStatusId: staffFormValue.docStatusId || null,
      documentTypeId: staffFormValue.documentTypeId || null,
      staffId: staffFormValue.staffId?.staffId || null,
    };
    if (this.btnFlag.save) {
      this.DocumentSave();
    } else {
      this.DocumentUpdate();
    }
  }

  onSelectFile($event) {
    if ($event.target.files && $event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL($event.target.files[0]); // read file as data url
      reader.onload = (event) => {
        this.url = event.target.result;
        this.staffdocumentForm.controls.docImage.setValue(event.target.result);
      };
    }
  }

  DocumentSave() {
    if (this.staffdocumentForm.valid) {
      // Confirmation dialog
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save?',
        accept: () => {
          // Call to service to save the document
          this.transactionService
            .InsertHrDocumentMaster(this.payload)
            .subscribe(
              (data: any) => {
                if (data?.valid) {
                  // Update form and button flags on successful save
                  this.staffdocumentForm.disable();
                  this.DocumentSaved = data.result;
                  this.updateFormGrid(data.result);
                  this.btnFlag = {
                    edit: true,
                    cancel: false,
                    save: false,
                    update: true,
                    delete: true,
                  };
                  // Display success message
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: data.message,
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
                  detail: 'Document save failed',
                });
              }
            );
        },
      });
    } else {
      // If form is invalid, mark all fields as touched and dirty
      this.staffdocumentForm.markAllAsTouched();
      this.staffdocumentForm.markAsDirty();

      // Display error message to the user
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
    }
  }

  DocumentUpdate() {
    if (this.staffdocumentForm.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to Update?',
        accept: () => {
          this.transactionService
            .UpdateHrDocumentMaster(this.payload)
            .subscribe(
              (data: any) => {
                if (data?.valid) {
                  this.staffdocumentForm.disable();
                  this.DocumentSaved = data.result;
                  this.updateFormGrid(data.result);
                  this.btnFlag = {
                    edit: true,
                    cancel: false,
                    save: false,
                    update: true,
                    delete: true,
                  };
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
                  detail: 'Document Update failed',
                });
              }
            );
        },
      });
    } else {
      // If form is invalid, mark all fields as touched and dirty
      this.staffdocumentForm.markAllAsTouched();
      this.staffdocumentForm.markAsDirty();

      // Display error message to the user
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
    }
  }

  getStaffName(staffId: number) {
    return this.masterApiService.staffMasterArrayDuplicate?.find(
      (o) => o.staffId == staffId
    )?.fullName;
  }

  getVehicleName(vehiceId: number) {
    return this.masterApiService.AllHrVehicleMasterArray?.find(
      (o) => o.id == vehiceId
    )?.vehicleNo;
  }

  getDocumentType(documentTypeId: number) {
    return this.masterApiService.HrDocumentTypesArray?.find(
      (o) => o.documentTypeId == documentTypeId
    )?.documentType;
  }

  getDocumentStatus(docStatusId: number) {
    return this.masterApiService.HrDocumentStatusArray?.find(
      (o) => o.docStatusId == docStatusId
    )?.docStatus;
  }

  viewStaffDocumentData(staffId: number) {
    this.modalHeader = this.getStaffName(staffId);
    this.transactionService.GetDocumentMasterByStaffID(staffId).subscribe(
      (res) => {
        this.documentDetailArray = res as any[];
        this.viewDetailModal = true;
      },
      (error) => {}
    );
  }

  viewVehicleDocumentData(vehicleId: number) {
    this.modalHeader = this.getVehicleName(vehicleId);
    this.transactionService.GetDocumentMasterByVehicleID(vehicleId).subscribe(
      (res) => {
        this.documentDetailArray = res as any[];
        this.viewDetailModal = true;
      },
      (error) => {}
    );
  }

  ViewDocumentIMagesByMasterID(documentID: number) {
    this.documentImagesArray =
      this.transactionService.DocumentIMagesArray.filter(
        (o) => o.documentId == documentID
      );
    this.viewDocumentImageModal = true;
  }

  selectFile(event: any) {
    this.imageFileStaff = event;
  }

  selectFileAdd(event: any, documentId: any) {
    if (confirm('Are you sure. You want to upload this document ?')) {
      var DocumentContent = null;
      let fileReader = new FileReader();
      fileReader.onload = () => {
        DocumentContent = fileReader.result.toString();
        var dataObj = {
          DocImageId: 0,
          DocumentId: +documentId,
          DocImage: DocumentContent,
          Extension: event.target.files[0].type,
          DocName: event.target.files[0].name,
        };
        this.transactionService.InsertHrDocumentImage(dataObj).subscribe(
          (res) => {
            this.transactionService.GetAllHrDocumentImages();
            this.viewDocumentsData = false;
          },
          (error) => {}
        );
      };
      fileReader.readAsDataURL(event.target.files[0]);
    }
  }

  public b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    let sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  getImage(data, extension, docName) {
    var blob = this.b64toBlob(data, extension);
    let a = document.createElement('a');
    document.body.appendChild(a);
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = String(docName);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  openDocument(data, extension, docName) {
    this.getImage(data, extension, docName);
  }

  viewDetails(item: any) {
    this.staffDocumentsMasterArray = item.masterList;
  }

  viewDetailsVehicle(item: any) {
    this.vehicleDocumentsMasterArray = item.masterList;
  }

  getDocType(Id: any) {
    return this.masterApiService.HrDocumentTypesArray?.find(
      (o) => o.documentTypeId == Id
    )?.documentType;
  }

  getDocStatus(Id: any) {
    return this.masterApiService.HrDocumentStatusArray?.find(
      (o) => o.docStatusId == Id
    )?.docStatus;
  }

  ViewDocImages(Id: any) {
    this.transactionService.getDocumentImagesByMasterId(Id).subscribe(
      (res: any[]) => {
        this.DocImagesArray = res as any[];
        this.viewDocumentImageModal = true;
      },
      (error: any) => {}
    );
  }
  GetAllCompanies() {
    this.transactionService.GetAllCompanies().subscribe((res) => {
      this.companiesArray = res;
      this.companiesList = this.companiesArray.map((kl) => ({
        label: kl.customermasterName,
        value: kl.customermasterNo,
      }));
      this.companiesList.unshift({ label: '--Select Company--', value: -1 });
    });
  }
  GetAlldocumentTypeList() {
    this.transactionService.GetAlldocumentTypeList().subscribe((res) => {
      this.documentTypeArray = res;
      this.documentTypeList = this.documentTypeArray?.map((kl) => ({
        label: kl.documentType,
        value: kl.documentTypeId,
      }));
      this.documentTypeList.unshift({
        label: '--Select DocumentType--',
        value: -1,
      });
    });
  }
  GetAlldocumentStatusList() {
    this.documentStatusList = this.docStatusList?.map((kl) => ({
      label: kl.label,
      value: kl.value,
    }));
    this.documentStatusList.unshift({
      label: '--Select DocumentStatus--',
      value: -1,
    });
  }
  onImageSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageSrc = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  GetAllHrDocumentMasters() {
    this.transactionService.GetAllHrDocumentMasters().subscribe((res: any) => {
      this.DocumentSaved = res.result;
    });
  }
  showList() {
    this.GetAllHrDocumentMasters();
    this.displayMaximizable = true;
  }
  GetSavedDetails(id: any) {
    this.transactionService.GetDocumentMasterByID(id).subscribe((data: any) => {
      this.DocumentSaved = data.result;
      this.updateFormGrid(data.result);
      this.btnFlag = {
        edit: true,
        cancel: false,
        save: false,
        update: true,
        delete: true,
      };
    });
  }
  updateFormGrid(Document_update: any) {
    this.staffdocumentForm = this.fb.group({
      documentId: Document_update?.documentId,
      documentTypeId: Document_update?.documentTypeId,
      docStatusId: Document_update?.docStatusId,
      companyId: Document_update?.companyId,
      // vehicleId: Document_update,,
      // otherId: Document_update,,
      masterType: Document_update?.masterType,
      docName: Document_update?.docName,
      docNo: Document_update?.documentvoucherNo,
      remarks: Document_update?.remarks,
      issueDate: new Date(Document_update?.issueDate),
      expDate: new Date(Document_update?.expDate),
      docImage: 'data:image/png;base64,' + Document_update?.docImage,
      status: Document_update.status,
    });
  }

  DeleteDocument() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete Document?',
      accept: () => {
        this.transactionService
          .DeleteHrDocumentMaster(this.DocumentSaved.documentId)
          .subscribe(
            (data: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Document Deleted Succesfully',
              });
              this.New();
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
    this.staffdocumentForm.reset();
    this.staffdocumentForm.enable();
    this.staffdocumentForm.controls.docNo.disable();
    this.staffdocumentForm.controls.issueDate.setValue(new Date());
    this.staffdocumentForm.controls.expDate.setValue(new Date());
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
  }
  Edit() {
    this.staffdocumentForm.enable();
    // this.staffdocumentForm.controls.docNo.disable();
  }
  getStatusName(id) {
    return this.docStatusList?.find((res) => res.value === id)?.label;
  }
  getTypeName(id) {
    return this.documentTypeList?.find((res) => res.value === id)?.label;
  }
  getCompanyName(id) {
    return this.companiesList?.find((res) => res.value === id)?.label;
  }
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
