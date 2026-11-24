import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelPreviewDialogComponent } from './excel-preview-dialog.component';

describe('ExcelPreviewDialogComponent', () => {
  let component: ExcelPreviewDialogComponent;
  let fixture: ComponentFixture<ExcelPreviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcelPreviewDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcelPreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
