import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasequotationComponent } from './purchasequotation.component';

describe('PurchasequotationComponent', () => {
  let component: PurchasequotationComponent;
  let fixture: ComponentFixture<PurchasequotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchasequotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchasequotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
