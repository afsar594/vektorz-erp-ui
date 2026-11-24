import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterApiService } from '../../service/master.api.services';
import { LocationMaster } from '../../domain/Masters/LocationMaster';
import { FinancialPeriods } from '../../domain/FinancialPeriods';
import { forkJoin } from 'rxjs';
import { DatePipe } from '@angular/common';
import { User } from '../../domain';
import { LoginService } from '../../service/login.service';
import { MessageService, TreeNode } from 'primeng/api';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { AdministrationService } from 'src/app/routes/service/Administrations/administration.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { SelectItem } from 'primeng/api';
import { AccountApiService } from '../../service/account.api.service';
import { NotificationService } from 'src/app/shared/service/notification.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  value: boolean;
  loadList: any;
  returnUrl: string = '/dashboard'; // default redirect
  constructor(
    private router: Router,
    private fb: FormBuilder,
    public datepipe: DatePipe,
    private apiLogin: LoginService,
    private storage: LocalStorageService,
    private accountapi: AccountApiService,
    private messageService: MessageService,
    private AdministrationService: AdministrationService,
    private masterapi: MasterApiService,
    private _local: LocalStorageService,
    private _permission: PermissionsService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
  ) { }
  loginForm: FormGroup;
  files: TreeNode[];
  selectItem: any;
  locationList: SelectItem[];
  LocationmasterArry: LocationMaster[];
  FinacialPeriodArry: FinancialPeriods[];
  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        const decodedUrl = decodeURIComponent(params['returnUrl']);
        try {
          const url = new URL(decodedUrl);
          const path = url.hash.replace('#', '') || '/dashboard';
          this.returnUrl = path;
        } catch {
          this.returnUrl = decodedUrl;
        }
      }
    });

    this.loginForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]],
      location: [-1, [Validators.required]],
      financialperiod: [-1, [Validators.required]],
      rememberme: [false, [Validators.required]],
    });
    this.masterapi.LoadDropdown().subscribe((m) => {
      this.FinacialPeriodArry = m.resultSet.financialPeriods;
      this.f.financialperiod.setValue(this.FinacialPeriodArry[0]);
    });


    this.accountapi.LoadDropdownLocationMaster().subscribe((r) => {
      this.LocationmasterArry = r.resultSet.locationMaster;
      this.f.location.setValue(this.LocationmasterArry[0]);


      const locationData = JSON.stringify(this.LocationmasterArry[0])
      this.storage.set('selectedItemLocation', locationData)
    });



  }
  get f() {
    return this.loginForm.controls;
  }

  clklogin() {
    const formvalues = this.loginForm.value as User;
    this.apiLogin.loginRequest(formvalues).subscribe((k) => {
      if (k.valid) {
        const encryptData = this._permission.encryptLogin(k.result);
        this._local.remove('Login');
        this._local.set('Login', encryptData);
        this._local.remove('token');
        this.storage.set('token', k.result?.token);
        this._local.remove('groupId');
        this.storage.set('groupId', k.result?.workGroupId);
        this.apiLogin.user$.next(k.result);
        this.masterapi.GetAllStation().subscribe((m) => {
          var station = m[0];
          const encryptedData = this._permission.encryptData(station);
          this._local.remove('station');
          this._local.set('station', encryptedData);
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Alert',
          detail: k.message ? k.message : "Login Successfully",
        });
        // this.router.navigate(['/dashboard']);
        this.router.navigateByUrl(this.returnUrl);
        this.notificationService.connect();

      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: k.message ? k.message : "Login Failed",
        });
      }
    });
  }
  
  onLocationChange(event) {
    const selectedOption = this.loginForm.get('location')?.value
    const locationData = JSON.stringify(selectedOption)
    this.storage.set('selectedItemLocation', locationData)
  }

  clear() {
    this.loginForm.reset();
    // this.loadIntialData();
    this.loginForm.patchValue({
      rememberme: false,
      location: this.LocationmasterArry[0],
      vfinancialperiod: this.FinacialPeriodArry[0],
    });
    const locationData = JSON.stringify(this.LocationmasterArry[0])
    this.storage.set('selectedItemLocation', locationData)
  }

  getLocation() {
    this.masterapi.GetAllLocation().subscribe((data) => {
      this.LocationmasterArry = data;
    });
  }

  getFInancialPeriod() {
    this.masterapi.GetAllFinancialPeriod().subscribe((data) => {
      this.FinacialPeriodArry = data;
    });
  }

  loadIntialData() {
    forkJoin([
      this.masterapi.GetAllLocation(),
      this.masterapi.GetAllFinancialPeriod(),
    ]).subscribe((result) => {
      this.LocationmasterArry = result[0];
      this.FinacialPeriodArry = result[1];
      this.f.location.setValue(this.LocationmasterArry[0]);
      this.f.financialperiod.setValue(this.FinacialPeriodArry[0]);
    });
  }

  GetMenusByWorkgroup(id) {
    this.AdministrationService.GetMenusByWorkgroupId(id).subscribe(
      (response) => {
        const result = response.result;
        // console.log(result);
        this.files = this.mapMenuItems(result);
      }
    );
  }

  mapMenuItems(result: any[]): any[] {
    const files = [];
    for (const item of result) {
      const fileItem: any = {
        children: [],
        label: item.label,
        data: 'Movies Folder',
        expanded: false,
        expandedIcon: 'pi pi-folder-open',
        collapsedIcon: 'pi pi-folder',
      };

      if (item.items && item.items.length > 0) {
        const children = [];
        for (const childItem of item.items) {
          const fileItems: any = {
            children: childItem.items || [],
            label: childItem.label,
            data: 'Pacino Movies',
          };
          children.push(fileItems);
        }
        fileItem.children = children;
      }
      files.push(fileItem);
    }
    return files;
  }
}
