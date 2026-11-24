import { Component, OnInit } from '@angular/core';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.scss']
})
export class MainDashboardComponent implements OnInit {

  workGroupId: string | null;
  user: any;

  constructor(

    private permission: PermissionsService,
  ) {

  }

  ngOnInit(): void {
    this.user = this.permission.getUser();
  }

}
