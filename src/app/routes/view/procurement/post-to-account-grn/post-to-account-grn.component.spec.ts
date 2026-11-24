import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostToAccountGrnComponent } from './post-to-account-grn.component';

describe('PostToAccountGrnComponent', () => {
  let component: PostToAccountGrnComponent;
  let fixture: ComponentFixture<PostToAccountGrnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostToAccountGrnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostToAccountGrnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
