import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetConsumptionComponent } from './asset-consumption.component';

describe('AssetConsumptionComponent', () => {
  let component: AssetConsumptionComponent;
  let fixture: ComponentFixture<AssetConsumptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetConsumptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
