import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlternativitemComponent } from './alternativitem.component';

describe('AlternativitemComponent', () => {
  let component: AlternativitemComponent;
  let fixture: ComponentFixture<AlternativitemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlternativitemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlternativitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
