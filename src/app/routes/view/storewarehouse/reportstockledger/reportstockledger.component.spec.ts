import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportstockledgerComponent } from './reportstockledger.component';

describe('ReportstockledgerComponent', () => {
  let component: ReportstockledgerComponent;
  let fixture: ComponentFixture<ReportstockledgerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportstockledgerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportstockledgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
