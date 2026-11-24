import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoquantityComponent } from './boquantity.component';

describe('BoquantityComponent', () => {
  let component: BoquantityComponent;
  let fixture: ComponentFixture<BoquantityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoquantityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoquantityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
