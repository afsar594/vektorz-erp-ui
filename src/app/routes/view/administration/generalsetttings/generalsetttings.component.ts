import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, SelectItem } from 'primeng';
import { CurrencyMaster } from 'src/app/routes/domain';
import { TaxMaster } from 'src/app/routes/domain/Masters/TaxMaster';
import { GeneralSettings } from 'src/app/routes/domain/Settings/general';
import { optionsettings } from 'src/app/routes/domain/Settings/optionsettings';
import {
  MasterTable,
  OptionSettingTable,
} from 'src/app/routes/Enums/settings-type';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SettingService } from 'src/app/routes/service/Administrations/setting.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { UtilityService } from 'src/app/routes/service/common/utility.service';

@Component({
  selector: 'app-generalsetttings',
  templateUrl: './generalsetttings.component.html',
  styleUrls: ['./generalsetttings.component.scss'],
})
export class GeneralsetttingsComponent implements OnInit {
  @Input() listmode: boolean = true;
  title: string = 'General Settings';
  list: GeneralSettings[];
  list2: GeneralSettings[];
  list3: GeneralSettings[];
  currencyList: CurrencyMaster[];

  taxMasterArray: TaxMaster[] = [];
  taxMasterArry: string[] = [];
  taxMasterList: SelectItem[];

  search: string = '';
  index: number = 0;
  tabIndex: number = 0;
  optionsetting: optionsettings[] = [];
  cols: { field: string; header: string }[];
  colsOp: any;

  constructor(
    private masterAPI: MasterApiService,
    private accountsAPI: AccountApiService,
    private messageService: MessageService,
    private router: Router,
    private settingServer: SettingService,
    private utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    this.intialize();
    this.cols = [
      { field: 'generalSettingsDescription', header: 'Description' },
      { field: 'generalSettingsTextValue', header: 'value' },
    ];
    this.colsOp = [
      { field: 'optionsMasterDescription', header: 'Description' },
      { field: 'optionsMasterType', header: 'value' },
    ];
  }
  getCurrencyMaster() {}

  intialize(): void {
    this.list = [];
    this.masterAPI.GetGeneralSettings().subscribe((k) => {
      this.list = k
        ?.filter((j) => j.generalSettingsCategory.toLowerCase() === 'general')
        .map((m) => {
          if (m.generalSettingsTextValue) {
            const splitText = m.generalSettingsTextValue.split('::');
            if (splitText[0]) {
              m.generalSettingsTextValue = splitText[0].trim();
            }
            if (splitText[1]) {
              m.generalSettingsTextValue += '::' + splitText[1].trim();
            }
          }

          if (m.generalSettingsTableName === MasterTable.CODE_MASTER) {
          } else if (
            m.generalSettingsTableName === MasterTable.CURRENCY_MASTER
          ) {
            this.masterAPI
              .GetAllCurrency()
              .toPromise()
              .then((k) => {
                m.options = k.map((l) => {
                  return {
                    keyText:
                      l.currencyMasterCurrencyName +
                      '::' +
                      l.currencyMasterCurrencyId,
                    keyValue:
                      l.currencyMasterCurrencyName +
                      '::' +
                      l.currencyMasterCurrencyId,
                  };
                });
              });
            m.generalSettingsTextValue = {
              keyText: m.generalSettingsTextValue,
              keyValue: m.generalSettingsTextValue,
            };
          } else if (m.generalSettingsTableName === MasterTable.LANGUAGE) {
          } else if (
            m.generalSettingsTableName === MasterTable.LOCATION_MASTER
          ) {
            this.masterAPI
              .GetAllLocation()
              .toPromise()
              .then((k) => {
                m.options = k.map((l) => {
                  return {
                    keyText:
                      l.locationMasterLocationName +
                      '::' +
                      l.locationMasterLocationId,
                    keyValue:
                      l.locationMasterLocationName +
                      '::' +
                      l.locationMasterLocationId,
                  };
                });
              });
            m.generalSettingsTextValue = {
              keyText: m.generalSettingsTextValue,
              keyValue: m.generalSettingsTextValue,
            };
          } else if (
            m.generalSettingsTableName === MasterTable.MASTER_ACCOUNTS_TABLE
          ) {
            this.accountsAPI
              .GetAllAcounts()
              .toPromise()
              .then((k) => {
                m.options = k.result.map((l) => {
                  return {
                    keyText: l.maAccName + '::' + l.maAccNo,
                    keyValue: l.maAccName + '::' + l.maAccNo,
                  };
                });
              });

            m.generalSettingsTextValue = {
              keyText: m.generalSettingsTextValue,
              keyValue: m.generalSettingsTextValue,
            };
          } else if (m.generalSettingsTableName === MasterTable.COST_CENTER) {
            this.masterAPI
              .GetAllCostCenter()
              .toPromise()
              .then((k) => {
                m.options = k.map((l) => {
                  return {
                    keyText:
                      l.costCenterMasterCostCenterName +
                      '::' +
                      l.costCenterMasterCostCenterId,
                    keyValue:
                      l.costCenterMasterCostCenterName +
                      '::' +
                      l.costCenterMasterCostCenterId,
                  };
                });
              });
            m.generalSettingsTextValue = {
              keyText: m.generalSettingsTextValue,
              keyValue: m.generalSettingsTextValue,
            };
          }

          return m;
        });

      this.list2 = k
        ?.filter((j) => j.generalSettingsCategory.toLowerCase() === 'inventory')
        .map((m) => {
          return m;
        });

      this.list3 = k
        ?.filter(
          (j) => j.generalSettingsCategory.toLowerCase() === 'accounting'
        )
        .map((m) => {
          if (m.generalSettingsTextValue) {
            const splitText = m.generalSettingsTextValue.split('::');
            if (splitText[0]) {
              m.generalSettingsTextValue = splitText[0].trim();
            }
            if (splitText[1]) {
              m.generalSettingsTextValue += '::' + splitText[1].trim();
            }
          }

          if (
            m.generalSettingsTableName === MasterTable.MASTER_ACCOUNTS_TABLE
          ) {
            if (m.generalSettingsTextValue) {
              const splitText = m.generalSettingsTextValue.split('::');
              if (splitText[0]) {
                m.generalSettingsTextValue = splitText[0].trim();
              }
              if (splitText[1]) {
                m.generalSettingsTextValue += '::' + splitText[1].trim();
              }
            }
          }

          return m;
        });
    });
  }
  handleData($event) {}

  handleChange2(e) {
    if (e.index == 3) {
      this.tabIndex = e.index;
      this.getOptionsetting();
    }
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  globalUpdateSetting() {
    if (this.tabIndex == 3) {
      this.optionUpdateSetting();
    } else {
      this.generalUpdateSettings();
    }
  }
  optionUpdateSetting() {
    const dataArry: optionsettings[] = [...this.optionsetting];
    console.log(dataArry);

    dataArry.forEach((k) => {
      if (k.optionsMasterValueType === 'FILE') {
        if (k.optionsMasterType.hasOwnProperty('keyValue')) {
          k.optionsMasterType = (k.optionsMasterType as any).keyValue;
        }
      }
      // if (k.hasOwnProperty('options')) {
      //   delete k.options;
      // }
    });
    this.masterAPI.UpdateOptionsSettings(dataArry).subscribe((k) => {
      if (k.valid) {
        this.messageService.add({
          severity: 'success',
          summary: 'Alert',
          detail: 'Setting updation Successfull',
        });
        this.getOptionsetting();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Setting Updation Failed',
        });
      }
    });
  }
  generalUpdateSettings() {
    const dataArry = [...this.list, ...this.list2, ...this.list3];
    dataArry.forEach((k) => {
      if (k.generalSettingsValueType === 'FILE') {
        if (k.generalSettingsTextValue.hasOwnProperty('keyValue')) {
          k.generalSettingsTextValue = (
            k.generalSettingsTextValue as any
          ).keyValue;
        }
      }
    });

    this.masterAPI.UpdateGeneralSettings(dataArry).subscribe((k) => {
      if (k.valid) {
        this.utilityService.initializeAllStorage();
        this.messageService.add({
          severity: 'success',
          summary: 'Alert',
          detail: 'Setting updation Successfull',
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Setting Updation Failed',
        });
      }
      this.list = k.result
        ?.filter((j) => j.generalSettingsCategory === 'General')
        .map((m) => {
          if (m.generalSettingsTextValue) {
            const splitText = m.generalSettingsTextValue.split('::');
            if (splitText[0]) {
              m.generalSettingsTextValue = splitText[0].trim();
            }
            if (splitText[1]) {
              m.generalSettingsTextValue += '::' + splitText[1].trim();
            }
          }

          if (m.generalSettingsTableName === MasterTable.CODE_MASTER) {
          } else if (
            m.generalSettingsTableName === MasterTable.CURRENCY_MASTER
          ) {
            this.masterAPI
              .GetAllCurrency()
              .toPromise()
              .then((k) => {
                m.options = k.map((l) => {
                  return {
                    keyText:
                      l.currencyMasterCurrencyName +
                      ` ` +
                      '::' +
                      ` ` +
                      l.currencyMasterCurrencyId,
                    keyValue:
                      l.currencyMasterCurrencyName +
                      ` ` +
                      '::' +
                      ` ` +
                      l.currencyMasterCurrencyId,
                  };
                });
              });
            m.generalSettingsTextValue = {
              keyText: m.generalSettingsTextValue,
              keyValue: m.generalSettingsTextValue,
            };
            console.log(m);
          } else if (m.generalSettingsTableName === MasterTable.LANGUAGE) {
          } else if (
            m.generalSettingsTableName === MasterTable.LOCATION_MASTER
          ) {
            this.masterAPI
              .GetAllLocation()
              .toPromise()
              .then((k) => {
                m.options = k.map((l) => {
                  return {
                    keyText:
                      l.locationMasterLocationName +
                      '::' +
                      l.locationMasterLocationId,
                    keyValue:
                      l.locationMasterLocationName +
                      '::' +
                      l.locationMasterLocationId,
                  };
                });
              });
            m.generalSettingsTextValue = {
              keyText: m.generalSettingsTextValue,
              keyValue: m.generalSettingsTextValue,
            };
          } else if (
            m.generalSettingsTableName === MasterTable.MASTER_ACCOUNTS_TABLE
          ) {
            this.accountsAPI
              .GetAllAcounts()
              .toPromise()
              .then((k) => {
                m.options = k.result.map((l) => {
                  return {
                    keyText: l.maAccName + '::' + l.maAccNo,
                    keyValue: l.maAccName + '::' + l.maAccNo,
                  };
                });
              });
            m.generalSettingsTextValue = {
              keyText: m.generalSettingsTextValue,
              keyValue: m.generalSettingsTextValue,
            };
          } else if (m.generalSettingsTableName === MasterTable.COST_CENTER) {
            this.masterAPI
              .GetAllCostCenter()
              .toPromise()
              .then((k) => {
                m.options = k.map((l) => {
                  return {
                    keyText:
                      l.costCenterMasterCostCenterName +
                      '::' +
                      l.costCenterMasterCostCenterId,
                    keyValue:
                      l.costCenterMasterCostCenterName +
                      '::' +
                      l.costCenterMasterCostCenterId,
                  };
                });
              });
            m.generalSettingsTextValue = {
              keyText: m.generalSettingsTextValue,
              keyValue: m.generalSettingsTextValue,
            };
          }

          return m;
        });

      this.list2 = k.result
        ?.filter((j) => j.generalSettingsCategory === 'Inventory')
        .map((m) => {
          return m;
        });

      this.list3 = k.result
        ?.filter((j) => j.generalSettingsCategory === 'Accounting')
        .map((m) => {
          if (m.generalSettingsTextValue) {
            const splitText = m.generalSettingsTextValue.split('::');
            if (splitText[0]) {
              m.generalSettingsTextValue = splitText[0].trim();
            }
            if (splitText[1]) {
              m.generalSettingsTextValue += '::' + splitText[1].trim();
            }
          }

          if (
            m.generalSettingsTableName === MasterTable.MASTER_ACCOUNTS_TABLE
          ) {
            this.accountsAPI
              .GetAllAcounts()
              .toPromise()
              .then((k) => {
                m.options = k.result.map((l) => {
                  return {
                    keyText: l.maAccName + '::' + l.maAccNo,
                    keyValue: l.maAccName + '::' + l.maAccName,
                  };
                });
              });
          }
          return m;
        });
    });
  }

  handleChange(e) {
    this.index = e.index;
  }
  convertToBoolean(value: string): boolean {
    // alert(value)
    return value === 'YES';
  }
  handleData2($event, des) {
    this.optionsetting?.find((f) => {
      if (f.optionsMasterFullDescription == des) {
        f.optionsMasterType = $event;
      }
    });
  }
  getOptionsetting() {
    // alert(this.search)

    this.settingServer.getOptionSetting(this.search).subscribe((res: any) => {
      if (res.valid) {
        this.optionsetting = res.result;
      }
      this.optionsetting = res.result?.map((m) => {
        if (m.optionsMasterValueType == 'File') {
          const splitText = m.optionsMasterType.split('::');
          if (splitText[0]) {
            m.optionsMasterType = splitText[0].trim();
          }
          if (splitText[1]) {
            m.optionsMasterType += '::' + splitText[1].trim();
          }
        }

        if (
          m.optionsMasterDescription ===
          OptionSettingTable.ITEM_TREE_DISPLAY_FIELD
        ) {
          // } else if (m.optionsMasterDescription === OptionSettingTable.CURRENCY_DECIMAL_NAME) {
          //   this.masterAPI.GetAllCurrency().toPromise().then(k => {
          //     m.options = k.map(l => {
          //       return {
          //         keyText: l.currencyMasterCurrencyName + '::' + l.currencyMasterCurrencyId,
          //         keyValue: l.currencyMasterCurrencyName + '::' + l.currencyMasterCurrencyId
          //       };
          //     });
          //   });
          //   m.optionsMasterType = {
          //     keyText: m.optionsMasterType,
          //     keyValue: m.optionsMasterType
          //   }
        } else if (
          m.optionsMasterDescription === OptionSettingTable.DEFAULT_COUNTRY
        ) {
          this.masterAPI
            .GetAllCountry()
            .toPromise()
            .then((k) => {
              m.options = k.map((l) => {
                return {
                  keyText: l.countryMasterCountryName,
                  keyValue: l.countryMasterCountryName,
                };
              });
            });
        } else if (
          m.optionsMasterDescription === OptionSettingTable.DEFAULT_VAT
        ) {
          this.masterAPI.GetAllTax().subscribe((k) => {
            m.options = k.map((l) => {
              return {
                keyText: l.tmName + '::' + l.tmId,
                keyValue: l.tmName + '::' + l.tmId,
              };
            });
          });
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.QUANTITY_DECIMAL_PLACE
        ) {
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.CURRENCY_DECIMAL_NAME
        ) {
        } else if (
          m.optionsMasterDescription === OptionSettingTable.MDI_FORMS
        ) {
        } else if (
          m.optionsMasterDescription === OptionSettingTable.AGEING_REPORT_GROUP
        ) {
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.AGEING_REPORT_GROUP_SUPP
        ) {
        }
        //
        else if (
          m.optionsMasterDescription ===
          OptionSettingTable.INCLUDE_BANK_PAYMENT_RECEIPT
        ) {
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.STATEMENTACC_DISPLAY_JOB_OR_COSTCENTER
        ) {
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.INSERT_DESCRIPTION_FOR_ACCOUNTS_TABLE_FROM
        ) {
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.GRN_QUANTITY_DECIMAL_PLACE
        ) {
        } else if (
          m.optionsMasterDescription === OptionSettingTable.RETAINED_AC_NO
        ) {
        } else if (
          m.optionsMasterDescription === OptionSettingTable.PDC_ALERT_DAYS
        ) {
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.LOOKUP_SERCHING_START_CHARECTOR
        ) {
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.ITEM_LOOKUP_SALES_PURCHASE_RECORD_COUNT
        ) {
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.SHOW_SALES_PRICE_FROM
        ) {
        } else if (
          m.optionsMasterDescription === OptionSettingTable.CASH_SALES_PREFIX
        ) {
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.CREDIT_ACCOUNT_WHILE_DEPRECIATION
        ) {
        } else if (
          m.optionsMasterDescription === OptionSettingTable.EXPIRY_ALERT_DAYS
        ) {
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.ITEM_SEARCH_START_CHARS
        ) {
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.HR_JOB_CREATION_DATABASE
        ) {
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.SERVICE_AMOUNT_FOR_JOB_CARD
        ) {
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.PURCHASE_LANDING_PRICE_CALCULATION
        ) {
        }
        return m;
      });
    });
  }
}
