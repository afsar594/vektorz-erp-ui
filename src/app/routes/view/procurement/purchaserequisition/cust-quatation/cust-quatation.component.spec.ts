import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustQuatationComponent } from './cust-quatation.component';

describe('CustQuatationComponent', () => {
  let component: CustQuatationComponent;
  let fixture: ComponentFixture<CustQuatationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustQuatationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustQuatationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
