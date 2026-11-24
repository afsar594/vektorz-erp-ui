import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { PermissionsService } from '../../service/permissions.service';
import { PreviousRouteService } from 'src/app/routes/service/common/previous-route.service';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})
export class TemplateComponent implements OnInit {


  ScreenId: number;
  Permission: any;
  title: string;
  breadcumbmodel: MenuItem[];
  @Input() item;
  @Input() item1;
  @Input() from
  index: number = 0;
  template: any[] = [];
  templateForm: FormGroup
  templatList: { label: string; value: string; }[];
  selectedTemplate: number;
  showButton: boolean = false;
  confirmDropDatabaseDialogVisible: boolean = false;
  seltectedType: any;
  showconfirm: any;
  handleChange(e) {
    this.index = e.index;
  }
  constructor(private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private masterapi: MasterApiService,
    private permission: PermissionsService,
    private router: Router,
    private previousRouteService: PreviousRouteService,
    public translate: TranslateService) { }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId); 
      this.showconfirm = this.from ? this.from : false;
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'QTemplates') {
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
    if (this.item) {
      this.templatList = [
        { label: 'Header', value: 'header' },
        { label: 'Delivery', value: 'delivery' },
        { label: 'Notes', value: 'notes' },
        { label: 'Footer', value: 'footer' },
        { label: 'Payment Trems', value: 'paymentTrems' },
        { label: 'Subject', value: 'subject' },
        { label: 'Content', value: 'content' },
        { label: 'Remarks 1', value: 'remarks1' },
        { label: 'Remarks 2', value: 'remarks2' },
        { label: 'Remarks 3', value: 'remarks3' }
      ];
    }
    else {
      this.templatList = [
        { label: 'Header', value: 'header' },
        { label: 'Notes', value: 'notes' },
        { label: 'Footer', value: 'footer' },
        { label: 'Payment Trems', value: 'paymentTrems' },
        { label: 'Subject', value: 'subject' },
        { label: 'Warrenty', value: 'warranty' },
        { label: 'Training', value: 'training' },
        { label: 'Technical Details', value: 'technicalDetails' }
      ];
    }

    this.templateForm = this.fb.group({

      qtemplatesDescription: [{ value: '', disabled: false }, Validators.required],
      qtemplatesType: [{ value: '', disabled: false }, Validators.required],
      // qtemplatesDelStatus:  [{ value: '', disabled: true }];
    });
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;

    });
  }

  new() {

  }

  selectedTemplateValue(item) {

    this.selectedTemplate = item.qtemplatesId,
      // this.masterapi.GetTemplateById(id).subscribe((res: any) => {
      this.seltectedType = item.qtemplatesType;
    // }),
    this.templateForm.controls.qtemplatesDescription.setValue(item.qtemplatesDescription)
    this.showButton = true
  }

  savetemplate() {
    if (this.templateForm.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save Template?',
        accept: () => {

          this.masterapi.InsterTemplate(this.templateForm.value).subscribe((res: any) => {


            this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Template Saved Sucessfully' });

            this.masterapi.GetTemplateBytype(this.templateForm.controls.qtemplatesType.value).subscribe((res: any) => {
              this.template = res.result;
            })

          })
        }
      })
    } else {
      this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Please fill mandatory fields' });
      this.templateForm.markAllAsTouched();
      this.templateForm.markAsDirty();
    }
  }
  navigateBack(): void {
    const previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl) {
      this.router.navigateByUrl(previousUrl);
    } else {
      // If there's no previous URL, navigate to a default route
      this.router.navigate(['/dashboard']);
    }
  }


  updatetemplate() {

    if (this.templateForm.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update Template?',
        accept: () => {
          let req = {
            qtemplatesId: this.selectedTemplate,
            qtemplatesDescription: this.templateForm.controls.qtemplatesDescription.value,
            qtemplatesType: this.templateForm.controls.qtemplatesType.value,
            qtemplatesDelStatus: true
          }
          this.masterapi.UpdateTemplate(req).subscribe((res: any) => {


            this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Template Updated Sucessfully' });

            this.masterapi.GetTemplateBytype(this.seltectedType).subscribe((res: any) => {
              this.template = res.result;
            })

          })
        }
      })
    } else {
      this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Please fill mandatory fields' });
      this.templateForm.markAllAsTouched();
      this.templateForm.markAsDirty();
    }
  }

  getTemplateBytype(event) {

    this.masterapi.GetTemplateBytype(event.value).subscribe((res: any) => {
      this.template = res.result;
    })
  }

  deletetemplate() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to Delete Template?',
      accept: () => {

        this.masterapi.DeleteTemplate(this.selectedTemplate).subscribe((res: any) => {
          this.messageService.add({
            severity: 'success', summary: 'Alert',
            detail: res
          });
          this.masterapi.GetTemplateBytype(this.seltectedType).subscribe((res: any) => {
            this.template = res.result.result;
          })

        })
      }
    })

  }


}
