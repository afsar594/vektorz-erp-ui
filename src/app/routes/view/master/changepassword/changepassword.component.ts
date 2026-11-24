import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.scss']
})
export class ChangepasswordComponent implements OnInit {

  title: string;
  subtitle: string;
  breadcumbmodel: MenuItem[];
  ChangePasswordForm: FormGroup;
  index: number = 0;
  passwordType: string = 'password';
  matchPass: boolean = false;
  showPassword: boolean = false;
  confirmDropDatabaseDialogVisible = false;
  constructor
    (
      private activatedroute: ActivatedRoute,
      private confirmation: ConfirmationService,
      private messageService: MessageService,
      private stockApi: StockApiService,
      private translate: TranslateService,
      private router: Router,
      private permission: PermissionsService
    ) { }

  ngOnInit(): void {
    this.ChangePasswordForm = new FormGroup({
      UserName: new FormControl('', Validators.required),
      OldPassword: new FormControl('', Validators.required),
      NewPassword: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20)
      ])),
      RetypePassword: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20)
      ])),

    });
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;

    });
    let user = this.permission.getUser()
    // let user: any = JSON.parse(localStorage.getItem("Login"));
    this.ChangePasswordForm.controls["UserName"].setValue(user?.userName);
    this.ChangePasswordForm.controls["OldPassword"].setValue(user?.password);
  }
  changePassword() {
    let user: any = this.permission.getUser();
    let payload = {
      userid: user?.userId,
      newPassword: this.ChangePasswordForm.controls["NewPassword"].value,
      Password: this.ChangePasswordForm.controls["OldPassword"].value
    };
    if (this.ChangePasswordForm.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to Change Password....?',
        accept: () => {
          this.stockApi.changePassword(payload).subscribe(response => {
            this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Password changed successfully!' });
          },
            error => {
              this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Operation Failed!' });
            });
        },
        reject: () => {
          this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Operation Cancelled!' });
          return;
        }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.ChangePasswordForm.markAllAsTouched();
      this.ChangePasswordForm.markAsDirty();
    }
  }
  togglePassShow() {
    this.showPassword = !this.showPassword;
    this.passwordType = this.showPassword ? 'text' : 'password';
  }
  password() {
    if (this.ChangePasswordForm.controls['NewPassword'].value === this.ChangePasswordForm.controls['RetypePassword'].value)
      this.matchPass = false;
    else {
      this.matchPass = true;
    }
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  handleChange(e) {
    this.index = e.index;
  }
  get f() {
    return this.ChangePasswordForm.controls;
  }
}
