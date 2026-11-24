import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/shared/service/settings.service';
import { MenuService } from '../menu/service/app.menu.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent  {
constructor(public app: AppComponent) {

}
}
