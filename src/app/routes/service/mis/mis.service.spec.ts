import { TestBed } from '@angular/core/testing';

import { MISService } from './mis.service';

describe('MISService', () => {
  let service: MISService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MISService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
