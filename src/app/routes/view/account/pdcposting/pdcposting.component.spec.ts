import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PDCPostingComponent } from './pdcposting.component';

describe('PDCPostingComponent', () => {
  let component: PDCPostingComponent;
  let fixture: ComponentFixture<PDCPostingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PDCPostingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PDCPostingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
