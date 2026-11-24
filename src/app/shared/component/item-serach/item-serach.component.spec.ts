import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSerachComponent } from './item-serach.component';

describe('ItemSerachComponent', () => {
  let component: ItemSerachComponent;
  let fixture: ComponentFixture<ItemSerachComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemSerachComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSerachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
