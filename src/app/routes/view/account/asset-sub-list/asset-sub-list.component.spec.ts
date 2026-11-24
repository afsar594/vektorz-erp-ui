import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetSubListComponent } from './asset-sub-list.component';

describe('AssetSubListComponent', () => {
  let component: AssetSubListComponent;
  let fixture: ComponentFixture<AssetSubListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetSubListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetSubListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
