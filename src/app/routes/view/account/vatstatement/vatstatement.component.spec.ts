import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VatstatementComponent } from './vatstatement.component';

describe('VatstatementComponent', () => {
  let component: VatstatementComponent;
  let fixture: ComponentFixture<VatstatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VatstatementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VatstatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
