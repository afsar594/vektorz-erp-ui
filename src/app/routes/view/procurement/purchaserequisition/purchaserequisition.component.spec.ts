import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaserequisitionComponent } from './purchaserequisition.component';

describe('PurchaserequisitionComponent', () => {
  let component: PurchaserequisitionComponent;
  let fixture: ComponentFixture<PurchaserequisitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaserequisitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaserequisitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not hide rate and amount columns when the PR setting is false', () => {
    const testComponent = Object.create(PurchaserequisitionComponent.prototype) as PurchaserequisitionComponent;
    testComponent.hideRateAndAmount = false;
    testComponent.isHideTable = false;
    testComponent.hiddenColumns = [];

    const updateSettingsSpy = jasmine.createSpy('updateSettings');
    (testComponent as any).hotRegisterer = {
      getInstance: jasmine.createSpy().and.returnValue({ updateSettings: updateSettingsSpy }),
    };
    testComponent.hotid = 'test-hot';

    testComponent.updateTableConfiguration();

    const settings = updateSettingsSpy.calls.first().args[0];
    expect(settings.hiddenColumns.columns).not.toContain(7);
    expect(settings.hiddenColumns.columns).not.toContain(8);
  });
});
