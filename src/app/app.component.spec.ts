import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { AppFooterComponent } from './layout/footer/app.footer.component';
import { AppMenuComponent } from './layout/menu/component/app.menu.component';
import { MenuService } from './layout/menu/service/app.menu.service';
import { AppTopBarComponent } from './layout/topbar/app.topbar.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [
          AppComponent,
          AppTopBarComponent,
          AppMenuComponent,
          AppFooterComponent
      ],
        providers: [MenuService]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
