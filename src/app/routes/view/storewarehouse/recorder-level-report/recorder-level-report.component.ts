import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api/menuitem';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-recorder-level-report',
  templateUrl: './recorder-level-report.component.html',
  styleUrls: ['./recorder-level-report.component.scss']
})
export class RecorderLevelReportComponent implements OnInit {
  index: number = 0;
  itemList:any;
  ScreenId: number;
  Permission: any;
  constructor(
    private router: Router,
    private activatedroute: ActivatedRoute,
    private permission: PermissionsService,
  ) { }

  title: string;
  breadcumbmodel: MenuItem[];

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      if (rights) {
        var res = rights[0]
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
    this.breadcumbmodel = this.router.url.slice(1).split('/').map((k) => ({ label: k }));
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
    });
  }

  handleChange(e) {
    this.index = e.index;
  }

}
