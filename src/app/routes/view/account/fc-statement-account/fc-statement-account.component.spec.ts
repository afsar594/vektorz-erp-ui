import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FcStatementAccountComponent } from './fc-statement-account.component';

describe('FcStatementAccountComponent', () => {
  let component: FcStatementAccountComponent;
  let fixture: ComponentFixture<FcStatementAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FcStatementAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FcStatementAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
