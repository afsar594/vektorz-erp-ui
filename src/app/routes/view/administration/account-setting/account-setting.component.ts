import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService, SelectItem } from 'primeng';
import { ChartofAccounts } from 'src/app/routes/domain';
import { accountSetting } from 'src/app/routes/domain/Settings/accountSettings';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrls: ['./account-setting.component.scss'],
})
export class AccountSettingComponent implements OnInit {
  title: string = 'Account Mapping';
  index: number = 0;
  accountSetting: any;
  option: any[] = [];
  confirmDropDatabaseDialogVisible = false;
  handleChange(e) {
    this.index = e.index;
  }
  list3: accountSetting[] = [];

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  constructor(
    private router: Router,
    private accountapi: AccountApiService,
    private masterApi: MasterApiService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private activatedroute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.getAccountSetting();
  }

  getAccountSetting() {
    this.masterApi.getAccountSetting().subscribe((res: any) => {
      this.accountapi.GetAllAcounts().subscribe((k: any) => {
        // if (k && k.result) {
        this.option = k.result.filter((m: any) => m.maDelStatus != true);
        this.list3 = res.map((m: any) => {
          m.options = this.option.map((l: any) => {
            return {
              keyText: l.maAccName + ` :: ` + l.maAccNo,
              keyValue: l.maAccName + ` :: ` + l.maAccNo,
            };
          });

          m.accountSettingsAccountTextValue = {
            keyText: m.accountSettingsAccountTextValue,
            keyValue: m.accountSettingsAccountTextValue,
          };
          m.options.unshift({
            keyText: '--Select Account--',
            keyValue: -1,
          });
          return m;
        });
        // };
      });
    });
  }
  setnumvalue(event: any) {
    event.accountSettingsAccountNumberValue =
      event.accountSettingsAccountTextValue.keyValue.split(' :: ')[1];
  }
  updateSettings() {
    const dataArry: accountSetting[] = [...this.list3];
    dataArry.forEach((k) => {
      if (k.accountSettingsAccountTextValue.hasOwnProperty('keyValue')) {
        k.accountSettingsAccountTextValue = (
          k.accountSettingsAccountTextValue as any
        ).keyValue;
      }

      if (k.hasOwnProperty('options')) {
        delete k.options;
      }
    });
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to Update?'),
      accept: () => {
        this.masterApi.updateAccountSetting(dataArry).subscribe((k) => {
          if (k.valid) {
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Account Setting Updation Successfull',
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Account Setting Updation Failed',
            });
          }
          this.getAccountSetting();
        });
      },
    });
  }
}
