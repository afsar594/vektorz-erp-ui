import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostEstimationItemMasterComponent } from './cost-estimation-item-master.component';

describe('CostEstimationItemMasterComponent', () => {
  let component: CostEstimationItemMasterComponent;
  let fixture: ComponentFixture<CostEstimationItemMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CostEstimationItemMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CostEstimationItemMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
