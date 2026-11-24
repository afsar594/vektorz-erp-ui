import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng';
import { DatashareService } from 'src/app/datashare.service';
import { OptionSettingTable } from 'src/app/routes/Enums/settings-type';
import { optionsettings } from 'src/app/routes/domain/Settings/optionsettings';
import { SettingService } from 'src/app/routes/service/Administrations/setting.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
@Component({
  selector: 'app-option-setting',
  templateUrl: './option-setting.component.html',
  styleUrls: ['./option-setting.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class OptionSettingComponent implements OnInit {
  @Input() listmode: boolean = true;

  title: string = 'Option Setting';
  // list: any[] = [];
  // timer: any;
  search: string = '';
  dataset: any;
  licensekey: any;
  gridHeader: string;
  items: any[] | undefined;
  selectedItem: any;
  suggestions: any[] | undefined;
  timer: any;

  keys(event: AutoCompleteCompleteEvent) {
    this.suggestions = [...Array(10).keys()].map(
      (item) => event.query + '-' + item
    );
  }

  index: number = 0;
  optionsetting: optionsettings[] = [];
  handleChange(e) {
    this.index = e.index;
  }

  constructor(
    private masterAPI: MasterApiService,
    private messageService: MessageService,
    private router: Router,
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    public translate: TranslateService,
    private settinServer: SettingService,
    private datashare: DatashareService
  ) {}

  ngOnInit(): void {
    this.getOptionsetting();
    // this.getAllOptionSettings()
  }
  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  getOptionsetting() {
    // alert(this.search)

    this.settinServer.getOptionSetting(this.search).subscribe((res: any) => {
      console.log('optionsetting', res);

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
        } else if (
          m.optionsMasterDescription ===
          OptionSettingTable.PURCHASE_LANDING_PRICE_CALCULATION
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
          m.optionsMasterType = {
            keyText: m.optionsMasterType,
            keyValue: m.optionsMasterType,
          };
        } else if (
          m.optionsMasterDescription === OptionSettingTable.DEFAULT_COUNTRY
        ) {
          this.masterAPI
            .GetAllCountry()
            .toPromise()
            .then((k) => {
              m.options = k.map((l) => {
                return {
                  keyText:
                    l.countryMasterCountryName +
                    '::' +
                    l.countryMasterCountryId,
                  keyValue:
                    l.countryMasterCountryName +
                    '::' +
                    l.countryMasterCountryName,
                };
              });
            });
        } else if (
          m.optionsMasterDescription === OptionSettingTable.PRINT_REPORT_FROM
        ) {
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
          OptionSettingTable.DEFAULT_ITEM_STOCKABLE
        ) {
          m.options = [
            {
              keyValue: -1,
              keyText: 'Select',
            },
            {
              keyValue: 1,
              keyText: 'Stockable',
            },
            {
              keyValue: 2,
              keyText: 'Servicable',
            },
            {
              keyValue: 3,
              keyText: 'Menufacture',
            },
          ];
        } else {
          m.options = [
            {
              keyValue: -1,
              keyText: 'Select',
            },
            {
              keyValue: 1,
              keyText: 'VAT 5%',
            },
            {
              keyValue: 2,
              keyText: 'VAT 8%',
            },
            {
              keyValue: 3,
              keyText: 'GST 18%',
            },
            {
              keyValue: 4,
              keyText: 'GST 5%',
            },
          ];
        }
        return m;
      });
    });
  }

  convertToBoolean(value: string): boolean {
    // alert(value)
    return value === 'YES';
  }
  onOptionSelect(data: any) {
    console.log('data', data);
    if (
      data === 'Stockable' ||
      data === 'Servicable' ||
      data === 'Manufacture'
    ) {
      this.datashare.setSelectedStockValue(data);
    } else {
      this.datashare.setSelectedVatValue(data);
    }
  }

  handleData($event, des) {
    this.optionsetting?.find((f) => {
      if (f.optionsMasterFullDescription == des) {
        f.optionsMasterType = $event;
      }
    });
  }

  getAllOptionSettings() {
    this.settinServer.getOptionMasterSettings().subscribe((res: any) => {
      if (res.valid) {
        this.optionsetting = res.result;
        // console.log(this.optionsetting.filter())
      }
      this.optionsetting = res.result.map((m) => {
        if (m.optionsMasterValueType == 'File') {
          const splitText = m.optionsMasterType.split('::');
          if (splitText[0]) {
            m.optionsMasterType = splitText[0].trim();
          }
          if (splitText[1]) {
            m.optionsMasterType += '::' + splitText[1].trim();
          }

          if (
            m.optionsMasterDescription ===
            OptionSettingTable.ITEM_TREE_DISPLAY_FIELD
          ) {
            //  else if (m.optionsMasterDescription === OptionSettingTable.PURCHASE_LANDING_PRICE_CALCULATION) {
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
                    keyText:
                      l.countryMasterCountryName +
                      '::' +
                      l.countryMasterCountryId,
                    keyValue:
                      l.countryMasterCountryName +
                      '::' +
                      l.countryMasterCountryName,
                  };
                });
              });
          } else if (
            m.optionsMasterDescription === OptionSettingTable.PRINT_REPORT_FROM
          ) {
          }
          //  else if (m.optionsMasterDescription === OptionSettingTable.QUANTITY_DECIMAL_PLACE) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.CURRENCY_DECIMAL_NAME) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.MDI_FORMS) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.AGEING_REPORT_GROUP) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.AGEING_REPORT_GROUP_SUPP) {

          // }
          // //
          // else if (m.optionsMasterDescription === OptionSettingTable.INCLUDE_BANK_PAYMENT_RECEIPT) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.STATEMENTACC_DISPLAY_JOB_OR_COSTCENTER) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.INSERT_DESCRIPTION_FOR_ACCOUNTS_TABLE_FROM) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.GRN_QUANTITY_DECIMAL_PLACE) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.RETAINED_AC_NO) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.PDC_ALERT_DAYS) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.LOOKUP_SERCHING_START_CHARECTOR) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.ITEM_LOOKUP_SALES_PURCHASE_RECORD_COUNT) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.SHOW_SALES_PRICE_FROM) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.CASH_SALES_PREFIX) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.CREDIT_ACCOUNT_WHILE_DEPRECIATION) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.EXPIRY_ALERT_DAYS) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.ITEM_SEARCH_START_CHARS) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.HR_JOB_CREATION_DATABASE) {

          // } else if (m.optionsMasterDescription === OptionSettingTable.SERVICE_AMOUNT_FOR_JOB_CARD) {
          // }
        }
        return m;
      });
    });
  }

  updateSettings() {
    const dataArry: optionsettings[] = [...this.optionsetting];
    dataArry.forEach((k) => {
      if (k.optionsMasterValueType === 'File') {
        if (k.optionsMasterType.hasOwnProperty('keyValue')) {
          k.optionsMasterType = (k.optionsMasterType as any).keyValue;
        }
      }
      if (k.hasOwnProperty('options')) {
        delete k.options;
      }
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

  SearchData(event: any) {
    let that = this;
    clearTimeout(this.timer);
    var ms = 500; // milliseconds
    var val = event.target.value;
    this.timer = setTimeout(function () {
      that.search = val;
      that.getOptionsetting();
    }, ms);
  }
}
interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}
