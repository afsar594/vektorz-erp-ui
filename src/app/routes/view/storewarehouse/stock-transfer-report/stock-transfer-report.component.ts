import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-stock-transfer-report',
  templateUrl: './stock-transfer-report.component.html',
  styleUrls: ['./stock-transfer-report.component.scss'],
})
export class StockTransferReportComponent implements OnInit {
  dataset: any;
  title: string;
  subtitle: string;
  btnlabel: string = 'Submit';
  ItemFormGroup: FormGroup;
  stocktranferReport: any;
  user: any;

  constructor(
    private fb: FormBuilder,
    private activatedroute: ActivatedRoute,
    private stockAPi: StockApiService,
    public _MasterApiService: MasterApiService,
    private permission: PermissionsService,

    private translate: TranslateService
  ) {}

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[] = [];
  locationArry: string[] = [];

  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;

      this.user = this.permission.getUser();
    });
    this.initForm();
    this.getAllLOC();
  }

  initForm() {
    this.ItemFormGroup = this.fb.group({
      fromLoc: new FormControl(0),
      toLoc: new FormControl(0),
      DateFrom: new FormControl(new Date()),
      DateTo: new FormControl(new Date()),
      isdate: new FormControl(false),
    });
  }

  getAllLOC() {
    this._MasterApiService.GetAllLocation().subscribe((k: any) => {
      this.locationArray = k;
      this.locationList = k.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationList.unshift({ label: '--Select --', value: 0 });
      this.locationArry = k;
      this.ItemFormGroup.controls.toLoc.setValue(Number(this.user.locationId));
    });
  }

  public getLocName(unit: number): string {
    return this.locationArray?.find((j) => j.locationMasterLocationId === unit)
      ?.locationMasterLocationName;
  }

  get f() {
    return this.ItemFormGroup.controls;
  }
  GenerateReport() {
    const isdate = this.ItemFormGroup.controls.isdate.value;

    let req = {
      toLocation: this.ItemFormGroup.controls.toLoc.value,
      fromLocation: this.ItemFormGroup.controls.fromLoc.value,

      fromdate: isdate ? this.ItemFormGroup.controls.DateFrom.value : null,
      todate: isdate ? this.ItemFormGroup.controls.DateTo.value : null,
    };

    this.stockAPi.getStockTransferReport(req).subscribe((k) => {
      this.stocktranferReport = k.resultSet;
    });
  }

  onClear() {
    this.ItemFormGroup.reset();
  }
}
