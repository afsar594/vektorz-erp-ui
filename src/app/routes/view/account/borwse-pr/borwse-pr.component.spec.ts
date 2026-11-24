import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorwsePRComponent } from './borwse-pr.component';

describe('BorwsePRComponent', () => {
  let component: BorwsePRComponent;
  let fixture: ComponentFixture<BorwsePRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BorwsePRComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BorwsePRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
