import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasejournalComponent } from './purchasejournal.component';

describe('PurchasejournalComponent', () => {
  let component: PurchasejournalComponent;
  let fixture: ComponentFixture<PurchasejournalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchasejournalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchasejournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
