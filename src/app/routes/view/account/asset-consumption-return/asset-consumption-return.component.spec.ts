import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetConsumptionReturnComponent } from './asset-consumption-return.component';

describe('AssetConsumptionReturnComponent', () => {
  let component: AssetConsumptionReturnComponent;
  let fixture: ComponentFixture<AssetConsumptionReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetConsumptionReturnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetConsumptionReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
