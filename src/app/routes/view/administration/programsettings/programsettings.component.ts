import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, SelectItem } from 'primeng';
import { ProgramSettings } from 'src/app/routes/domain/Settings/program';
import { MasterTable } from 'src/app/routes/Enums/settings-type';
import { MasterApiService } from 'src/app/routes/service/master.api.services';

@Component({
  selector: 'app-programsettings',
  templateUrl: './programsettings.component.html',
  styleUrls: ['./programsettings.component.scss'],
})
export class ProgramsettingsComponent implements OnInit {
  @Input() listmode: boolean = true;

  title: string = 'Program Setting';
  list: ProgramSettings[] = [];
  list2: ProgramSettings[] = [];
  list3: ProgramSettings[] = [];
  PREFIXType: SelectItem[];
  JobValueTypeOptions: SelectItem[];
  PREFIXSeprator: SelectItem[];
  cols: any[];
  constructor(
    private masterAPI: MasterApiService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.JobValueTypeOptions = [
      { label: 'OnlyNumber', value: 'OnlyNumber' },
      { label: 'No&Name', value: 'No&Name' }
    ];

    this.PREFIXType = [
      { label: 'Monthly', value: '1' },
      { label: 'Yearly', value: '2' },
      { label: 'None', value: '3' },
    ];
    this.PREFIXSeprator = [
      { label: '-', value: '-' },
      { label: '/', value: '/' },
      { label: '_', value: '_' },
    ];
    this.intialize();
    this.cols = [
      { field: 'programSettingsDescription', header: 'Description' },
      { field: 'programSettingsTextValue', header: 'value' },
    ];
  }

  intialize(): void {
    this.masterAPI.GetProgramSettings().subscribe((k) => {
      this.list = k
        ?.filter((k) => k.programSettingsCategory === 'MENU')
        .map((m) => {
          return m;
        });

      this.list2 = k
        ?.filter((k) => k.programSettingsCategory === 'VOUCHER')
        .map((m) => {
          return m;
        });

      this.list3 = k
        ?.filter((k) => k.programSettingsCategory === 'GENERAL')
        .map((m) => {
          return m;
        });
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  updateSettings() {
    const dataArry = [...this.list, ...this.list2, ...this.list3];
    this.masterAPI.UpdateProgramSettings(dataArry).subscribe((k) => {
      if (k.valid) {
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
        ?.filter((k) => k.programSettingsCategory.toLowerCase() === 'menu')
        .map((m) => {
          return m;
        });

      this.list2 = k.result
        ?.filter((k) => k.programSettingsCategory.toLowerCase() === 'voucher')
        .map((m) => {
          return m;
        });

      this.list3 = k.result
        ?.filter((k) => k.programSettingsCategory.toLowerCase() === 'general')
        .map((m) => {
          return m;
        });
    });
  }
}
