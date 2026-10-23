import { TestBed } from '@angular/core/testing';

import { SemillaService } from './semilla.service';

describe('SemillaService', () => {
  let service: SemillaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SemillaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
