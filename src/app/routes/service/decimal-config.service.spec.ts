import { TestBed } from '@angular/core/testing';

import { DecimalConfigService } from './decimal-config.service';

describe('DecimalConfigService', () => {
  let service: DecimalConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecimalConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
