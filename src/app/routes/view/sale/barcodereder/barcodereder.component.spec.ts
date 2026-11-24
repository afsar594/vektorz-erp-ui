import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarcoderederComponent } from './barcodereder.component';

describe('BarcoderederComponent', () => {
  let component: BarcoderederComponent;
  let fixture: ComponentFixture<BarcoderederComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarcoderederComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BarcoderederComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
