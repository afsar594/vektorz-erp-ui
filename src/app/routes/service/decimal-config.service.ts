import { Injectable } from '@angular/core';
import { MasterApiService } from './master.api.services';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DecimalConfigService {
  private decimal = 2;

  constructor(private masterapi: MasterApiService) {}

  load() {
    return this.masterapi.GetGeneralSettingbyKey('DECIMAL_VALUE').pipe(
      map((res: any) => {
        this.decimal = Number(res.result[0]?.generalSettingsNumValue);
        return this.decimal;
      })
    );
  }

  getDecimal(): number {
    return this.decimal;
  }

  getPattern(): string {
    return `0,0.${'0'.repeat(this.decimal)}`;
  }
}
