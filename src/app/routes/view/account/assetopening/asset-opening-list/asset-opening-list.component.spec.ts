import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetOpeningListComponent } from './asset-opening-list.component';

describe('AssetOpeningListComponent', () => {
  let component: AssetOpeningListComponent;
  let fixture: ComponentFixture<AssetOpeningListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetOpeningListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetOpeningListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
